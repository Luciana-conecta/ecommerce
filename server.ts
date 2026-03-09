import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./src/db/index.ts";
import { seedDb } from "./src/db/seed.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "voltix-secret-key-2024";

interface AuthRequest extends express.Request {
  user?: any;
}

async function startServer() {
  await seedDb();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    console.log(`Checking admin role for user:`, req.user);
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      console.log(`Admin access denied for user:`, req.user);
      res.status(403).json({ error: "Admin access required" });
    }
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
      const user = { id: result.lastInsertRowid, name, email, role: 'customer' };
      const token = jwt.sign(user, JWT_SECRET);
      res.json({ token, user });
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign(userWithoutPassword, JWT_SECRET);
    res.json({ token, user: userWithoutPassword });
  });

  app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
    res.json(req.user);
  });

  // Products
  app.get("/api/products", (req, res) => {
    const { category, featured, search } = req.query;
    let query = `
      SELECT p.*, 
        COALESCE(
          (SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1),
          (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1)
        ) as main_image 
      FROM products p
    `;
    const params: any[] = [];

    const conditions = [];
    if (category) {
      conditions.push('p.category_id = (SELECT id FROM categories WHERE slug = ?)');
      params.push(category);
    }
    if (featured === 'true') {
      conditions.push('p.is_featured = 1');
    }
    if (search) {
      conditions.push('(p.name LIKE ? OR p.brand LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const products = db.prepare(query).all(...params);
    res.json(products);
  });

  app.get("/api/products/:slug", (req, res) => {
    const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug) as any;
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    const images = db.prepare('SELECT * FROM product_images WHERE product_id = ?').all(product.id);
    const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(product.category_id);
    
    res.json({ ...product, images, variants, category });
  });

  // Categories
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  });

  // Orders
  app.post("/api/orders", authenticateToken, (req: AuthRequest, res) => {
    const { items, total_amount, subtotal, shipping_cost, discount_amount, payment_method, shipping_address, shipping_city, contact_phone, contact_email } = req.body;
    const order_number = 'VX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const insertOrder = db.prepare(`
      INSERT INTO orders (user_id, order_number, total_amount, subtotal, shipping_cost, discount_amount, payment_method, shipping_method, shipping_address, shipping_city, contact_phone, contact_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertOrder.run(
      req.user.id, order_number, total_amount, subtotal, shipping_cost, discount_amount, payment_method, 'home_delivery', shipping_address, shipping_city, contact_phone, contact_email
    );

    const order_id = result.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    items.forEach((item: any) => {
      insertItem.run(order_id, item.id, item.name, item.price, item.quantity, item.price * item.quantity);
    });

    res.json({ id: order_id, order_number });
  });

  app.get("/api/orders/my", authenticateToken, (req: AuthRequest, res) => {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(orders);
  });

  // Admin Stats
  app.get("/api/admin/stats", authenticateToken, isAdmin, (req: AuthRequest, res) => {
    const dailySales = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE date(created_at) = date('now')").get() as any;
    const weeklySales = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE date(created_at) >= date('now', '-7 days')").get() as any;
    const monthlyRevenue = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE date(created_at) >= date('now', '-30 days')").get() as any;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as any;
    const lowStock = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_quantity < 10").get() as any;

    // Weekly sales history
    const weeklySalesHistory = [
      { name: 'Lun', sales: 0 },
      { name: 'Mar', sales: 0 },
      { name: 'Mié', sales: 0 },
      { name: 'Jue', sales: 0 },
      { name: 'Vie', sales: 0 },
      { name: 'Sáb', sales: 0 },
      { name: 'Dom', sales: 0 },
    ];
    
    // Recent activity
    const recentOrders = db.prepare(`
      SELECT o.total_amount, o.order_number, o.created_at, u.name as customer_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC 
      LIMIT 5
    `).all() as any[];

    const recentActivity = recentOrders.map(o => ({
      description: `Nuevo pedido de ${o.customer_name}`,
      time: 'Reciente',
      amount: o.total_amount
    }));

    res.json({
      dailySales: dailySales.total || 0,
      weeklySales: weeklySales.total || 0,
      monthlyRevenue: monthlyRevenue.total || 0,
      pendingOrders: pendingOrders.count || 0,
      lowStock: lowStock.count || 0,
      weeklySalesHistory,
      recentActivity
    });
  });

  // Admin Orders
  app.get("/api/admin/orders", authenticateToken, isAdmin, (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, u.name as customer_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  });

  // Admin Products
  app.get("/api/admin/products", authenticateToken, isAdmin, (req, res) => {
    const products = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id').all();
    res.json(products);
  });

  app.post("/api/admin/products", authenticateToken, isAdmin, (req, res) => {
    const { name, sku, brand, category_id, price, stock_quantity, short_description, long_description, is_featured, is_new, main_image_url, tags } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    try {
      const result = db.prepare(`
        INSERT INTO products (name, slug, sku, brand, category_id, price, stock_quantity, short_description, long_description, is_featured, is_new, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, slug, sku, brand, category_id, price, stock_quantity, short_description, long_description || '', is_featured ? 1 : 0, is_new ? 1 : 0, tags || '');
      
      const productId = result.lastInsertRowid;
      
      if (main_image_url) {
        db.prepare('INSERT INTO product_images (product_id, url, is_main) VALUES (?, ?, ?)').run(productId, main_image_url, 1);
      }
      
      res.json({ id: productId });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Could not create product. SKU or Slug might already exist." });
    }
  });

  app.put("/api/admin/products/:id", authenticateToken, isAdmin, (req, res) => {
    const { name, sku, brand, category_id, price, stock_quantity, short_description, long_description, is_featured, is_new, tags } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    try {
      db.prepare(`
        UPDATE products 
        SET name = ?, slug = ?, sku = ?, brand = ?, category_id = ?, price = ?, stock_quantity = ?, short_description = ?, long_description = ?, is_featured = ?, is_new = ?, tags = ?
        WHERE id = ?
      `).run(name, slug, sku, brand, category_id, price, stock_quantity, short_description, long_description || '', is_featured ? 1 : 0, is_new ? 1 : 0, tags || '', req.params.id);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Could not update product." });
    }
  });

  app.delete("/api/admin/products/:id", authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    console.log(`Attempting to delete product with ID: ${id}`);
    try {
      // Use Number to ensure it's treated as an integer by SQLite
      const result = db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
      console.log(`Delete result:`, result);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(400).json({ error: "Could not delete product. It might be linked to existing orders." });
    }
  });

  app.post("/api/admin/products/:id/images", authenticateToken, isAdmin, (req, res) => {
    let { url, is_main } = req.body;
    
    // Auto-set as main if it's the first image for this product
    const countResult = db.prepare('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?').get(req.params.id) as { count: number };
    if (countResult.count === 0) {
      is_main = true;
    }

    if (is_main) {
      db.prepare('UPDATE product_images SET is_main = 0 WHERE product_id = ?').run(req.params.id);
    }
    db.prepare('INSERT INTO product_images (product_id, url, is_main) VALUES (?, ?, ?)').run(req.params.id, url, is_main ? 1 : 0);
    res.json({ success: true });
  });

  app.put("/api/admin/products/images/:id/main", authenticateToken, isAdmin, (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: "product_id is required" });
    
    // Remove main flag from all images of this product
    db.prepare('UPDATE product_images SET is_main = 0 WHERE product_id = ?').run(product_id);
    // Set this specific image as main
    db.prepare('UPDATE product_images SET is_main = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/products/images/:id", authenticateToken, isAdmin, (req, res) => {
    db.prepare('DELETE FROM product_images WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Admin Upload (ImgBB)
  app.post("/api/admin/upload", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const apiKey = process.env.IMGBB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "IMGBB_API_KEY not configured in backend" });
      }

      const formData = new URLSearchParams();
      // Remove data URI prefix if it exists
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      formData.append("image", base64Data);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        res.json({ url: data.data.url });
      } else {
        console.error("ImgBB upload error:", data);
        res.status(500).json({ error: "Failed to upload image to ImgBB" });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Internal server error during upload" });
    }
  });

  // Admin Customers
  app.get("/api/admin/customers", authenticateToken, isAdmin, (req, res) => {
    const customers = db.prepare("SELECT id, name, email, role, phone, city, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC").all();
    res.json(customers);
  });

  // Admin Order Details & Status
  app.get("/api/admin/orders/:id", authenticateToken, isAdmin, (req, res) => {
    const order = db.prepare(`
      SELECT o.*, u.name as customer_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.id = ?
    `).get(req.params.id) as any;
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ ...order, items });
  });

  app.put("/api/admin/orders/:id/status", authenticateToken, isAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  // Admin Settings
  app.get("/api/admin/settings", authenticateToken, isAdmin, (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.put("/api/admin/settings", authenticateToken, isAdmin, (req, res) => {
    const settings = req.body;
    const updateSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    Object.entries(settings).forEach(([key, value]) => {
      updateSetting.run(key, String(value));
    });
    res.json({ success: true });
  });

  // Admin Categories
  app.get("/api/admin/categories", authenticateToken, isAdmin, (req, res) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  });

  app.post("/api/admin/categories", authenticateToken, isAdmin, (req, res) => {
    const { name, slug, description, image_url } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO categories (name, slug, description, image_url)
        VALUES (?, ?, ?, ?)
      `).run(name, slug, description, image_url);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(400).json({ error: "Could not create category" });
    }
  });

  app.put("/api/admin/categories/:id", authenticateToken, isAdmin, (req, res) => {
    const { name, slug, description, image_url } = req.body;
    const { id } = req.params;
    try {
      db.prepare(`
        UPDATE categories 
        SET name = ?, slug = ?, description = ?, image_url = ?
        WHERE id = ?
      `).run(name, slug, description, image_url, id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Could not update category" });
    }
  });

  app.delete("/api/admin/categories/:id", authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    try {
      // Check if products exist in this category
      const products = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id) as { count: number };
      if (products.count > 0) {
        return res.status(400).json({ error: "Cannot delete category with associated products" });
      }
      db.prepare('DELETE FROM categories WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Could not delete category" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
