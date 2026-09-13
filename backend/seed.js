import bcrypt from 'bcryptjs';
import db from './db/init.js';

const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports & Fitness', 'Beauty'];
const catIds = {};
for (const name of categories) {
  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  catIds[name] = existing ? existing.id : db.prepare('INSERT INTO categories (name) VALUES (?)').run(name).lastInsertRowid;
}

function upsertUser(name, email, password, role) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return existing.id;
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(name, email, hash, role);
  db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(info.lastInsertRowid);
  return info.lastInsertRowid;
}

const adminId = upsertUser('Admin User', 'admin@shopsphere.com', 'admin123', 'admin');
const vendorId = upsertUser('Vendor Store', 'vendor@shopsphere.com', 'vendor123', 'vendor');
upsertUser('Demo Customer', 'customer@shopsphere.com', 'customer123', 'customer');

const products = [
  ['Wireless Noise-Cancelling Headphones', 'Over-ear Bluetooth headphones with 30-hour battery life and active noise cancellation.', 4999, 'Electronics', 40, 'ELEC-001'],
  ['Smart Fitness Watch', 'Tracks heart rate, sleep, steps, and workouts with a 7-day battery.', 3499, 'Electronics', 55, 'ELEC-002'],
  ['Mechanical Keyboard RGB', 'Hot-swappable mechanical keyboard with per-key RGB lighting.', 5499, 'Electronics', 25, 'ELEC-003'],
  ['4K Action Camera', 'Waterproof action camera with image stabilization, 4K60 recording.', 8999, 'Electronics', 15, 'ELEC-004'],
  ['Men\u2019s Casual Cotton Shirt', 'Breathable slim-fit cotton shirt available in multiple colors.', 899, 'Fashion', 100, 'FASH-001'],
  ['Women\u2019s Running Shoes', 'Lightweight cushioned running shoes for daily training.', 2299, 'Fashion', 60, 'FASH-002'],
  ['Leather Wallet', 'Genuine leather bifold wallet with RFID protection.', 799, 'Fashion', 80, 'FASH-003'],
  ['Non-Stick Cookware Set (5-Piece)', 'Durable non-stick cookware set suitable for all stovetops.', 3199, 'Home & Kitchen', 30, 'HOME-001'],
  ['Robot Vacuum Cleaner', 'Smart robot vacuum with app control and auto-recharge.', 12999, 'Home & Kitchen', 12, 'HOME-002'],
  ['Memory Foam Pillow (Set of 2)', 'Ergonomic cervical support memory foam pillows.', 1199, 'Home & Kitchen', 70, 'HOME-003'],
  ['Atomic Habits (Paperback)', 'Bestselling book on building good habits and breaking bad ones.', 399, 'Books', 150, 'BOOK-001'],
  ['Clean Code', 'A handbook of agile software craftsmanship by Robert C. Martin.', 899, 'Books', 45, 'BOOK-002'],
  ['Adjustable Dumbbell Set', 'Space-saving adjustable dumbbells, 5-25kg per hand.', 6999, 'Sports & Fitness', 20, 'SPRT-001'],
  ['Yoga Mat Premium', 'Non-slip extra-thick yoga mat with carrying strap.', 999, 'Sports & Fitness', 90, 'SPRT-002'],
  ['Vitamin C Face Serum', 'Brightening face serum with hyaluronic acid, 30ml.', 649, 'Beauty', 120, 'BEAU-001'],
  ['Herbal Shampoo & Conditioner Set', 'Sulfate-free herbal hair care duo for daily use.', 549, 'Beauty', 100, 'BEAU-002'],
];

const insert = db.prepare(
  `INSERT OR IGNORE INTO products (name, description, price, image_url, category_id, stock, sku, vendor_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

for (const [name, description, price, catName, stock, sku] of products) {
  const seed = encodeURIComponent(name);
  const image_url = `https://picsum.photos/seed/${seed}/600/600`;
  insert.run(name, description, price, image_url, catIds[catName], stock, sku, vendorId);
}

console.log('Seed complete.');
console.log('Login credentials:');
console.log('  Admin:    admin@shopsphere.com / admin123');
console.log('  Vendor:   vendor@shopsphere.com / vendor123');
console.log('  Customer: customer@shopsphere.com / customer123');
