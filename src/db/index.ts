import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('voltix.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      ci_ruc TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      parent_id INTEGER,
      FOREIGN KEY (parent_id) REFERENCES categories(id)
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      brand TEXT,
      category_id INTEGER,
      price INTEGER NOT NULL,
      discount_price INTEGER,
      short_description TEXT,
      long_description TEXT,
      stock_quantity INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT 0,
      is_new BOOLEAN DEFAULT 1,
      tags TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Migration: Add tags column if it doesn't exist
  const tableInfo = db.prepare("PRAGMA table_info(products)").all() as any[];
  const hasTags = tableInfo.some(col => col.name === 'tags');
  if (!hasTags) {
    try {
      db.exec("ALTER TABLE products ADD COLUMN tags TEXT");
    } catch (e) {
      console.error("Error adding tags column:", e);
    }
  }

  // Product Images
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      url TEXT NOT NULL,
      is_main BOOLEAN DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Product Variants
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      name TEXT NOT NULL, -- e.g., 'Color', 'Voltage'
      value TEXT NOT NULL, -- e.g., 'Black', '220V'
      additional_price INTEGER DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Coupons
  db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
      discount_value INTEGER NOT NULL,
      expiration_date DATETIME,
      usage_limit INTEGER,
      used_count INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT 1
    )
  `);

  // Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      order_number TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
      total_amount INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      shipping_cost INTEGER DEFAULT 0,
      discount_amount INTEGER DEFAULT 0,
      coupon_id INTEGER,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      shipping_method TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (coupon_id) REFERENCES coupons(id)
    )
  `);

  // Order Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      variant_id INTEGER,
      product_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    )
  `);

  // Wishlist
  db.exec(`
    CREATE TABLE IF NOT EXISTS wishlist (
      user_id INTEGER,
      product_id INTEGER,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Seed default settings if empty
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('store_name', 'Voltix Home');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('contact_email', 'soporte@voltix.com');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('currency', 'PYG');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('shipping_fee', '25000');
  }
}

export default db;
