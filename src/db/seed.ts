import db, { initDb } from './index.ts';
import bcrypt from 'bcryptjs';

export async function seedDb() {
  initDb();

  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  console.log('Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Admin Voltix',
    'admin@voltix.com',
    adminPassword,
    'admin'
  );

  // Create Categories
  const categories = [
    { name: 'Iluminación Inteligente', slug: 'iluminacion-inteligente', description: 'Soluciones de iluminación inteligente para tu hogar.', image_url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Electrodomésticos', slug: 'electrodomesticos', description: 'Electrodomésticos modernos para el corazón de tu hogar.', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Seguridad y Protección', slug: 'seguridad-proteccion', description: 'Mantén tu hogar seguro con seguridad impulsada por IA.', image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800' },
    { name: 'Audio para el Hogar', slug: 'audio-hogar', description: 'Experiencias de sonido inmersivas para cada habitación.', image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800' },
  ];

  const insertCategory = db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)');
  categories.forEach(cat => insertCategory.run(cat.name, cat.slug, cat.description, cat.image_url));

  // Create Products
  const products = [
    {
      name: 'Voltix Echo Pro',
      slug: 'voltix-echo-pro',
      sku: 'VX-ECHO-PRO',
      brand: 'Voltix',
      category_id: 4,
      price: 129000,
      short_description: 'Altavoz inteligente controlado por voz con sonido premium.',
      stock_quantity: 50,
      is_featured: 1,
      rating: 4.5,
      review_count: 42
    },
    {
      name: 'Control Pad S1',
      slug: 'control-pad-s1',
      sku: 'VX-CP-S1',
      brand: 'Voltix',
      category_id: 3,
      price: 299000,
      discount_price: 239000,
      short_description: 'Centro de control para todos tus dispositivos inteligentes.',
      stock_quantity: 30,
      is_featured: 1,
      rating: 5.0,
      review_count: 156
    },
    {
      name: 'Auriculares ZenSync',
      slug: 'auriculares-zensync',
      sku: 'VX-ZS-HP',
      brand: 'Voltix',
      category_id: 4,
      price: 199000,
      short_description: 'Auriculares inalámbricos con cancelación de ruido para una concentración profunda.',
      stock_quantity: 25,
      is_new: 1,
      rating: 4.8,
      review_count: 89
    },
    {
      name: 'BrewMaster AI',
      slug: 'brewmaster-ai',
      sku: 'VX-BM-AI',
      brand: 'Voltix',
      category_id: 2,
      price: 245000,
      short_description: 'Cafetera inteligente con pantalla digital y control por aplicación.',
      stock_quantity: 15,
      is_featured: 1,
      rating: 4.9,
      review_count: 210
    },
    {
      name: 'Bombillas Inteligentes RGB (Pack de 4)',
      slug: 'bombillas-inteligentes-rgb-pack-4',
      sku: 'VX-RGB-B4',
      brand: 'Voltix',
      category_id: 1,
      price: 59000,
      short_description: 'Bombillas LED RGB regulables con control por voz.',
      stock_quantity: 100,
      rating: 4.2,
      review_count: 65
    },
    {
      name: 'Timbre Voltix Guard',
      slug: 'timbre-voltix-guard',
      sku: 'VX-GD-DB',
      brand: 'Voltix',
      category_id: 3,
      price: 149000,
      short_description: 'Timbre con video inteligente con cámara 2K y visión nocturna.',
      stock_quantity: 20,
      rating: 4.7,
      review_count: 112
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (name, slug, sku, brand, category_id, price, discount_price, short_description, stock_quantity, is_featured, is_new, rating, review_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImage = db.prepare('INSERT INTO product_images (product_id, url, is_main) VALUES (?, ?, ?)');

  const productImages = [
    'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800'
  ];

  products.forEach((p, i) => {
    const result = insertProduct.run(
      p.name, p.slug, p.sku, p.brand, p.category_id, p.price, p.discount_price || null,
      p.short_description, p.stock_quantity, p.is_featured || 0, p.is_new || 0, p.rating, p.review_count
    );
    insertImage.run(result.lastInsertRowid, productImages[i], 1);
  });

  console.log('Database seeded successfully.');
}
