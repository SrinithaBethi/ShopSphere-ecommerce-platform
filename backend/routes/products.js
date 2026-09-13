import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db/init.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', (req, res) => {
  const { search = '', category = '', minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 } = req.query;

  let where = 'WHERE p.is_active = 1';
  const params = [];

  if (search) {
    where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    where += ' AND c.name = ?';
    params.push(category);
  }
  if (minPrice) {
    where += ' AND p.price >= ?';
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    where += ' AND p.price <= ?';
    params.push(Number(maxPrice));
  }

  const sortMap = {
    newest: 'p.created_at DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    name: 'p.name ASC',
  };
  const orderBy = sortMap[sort] || sortMap.newest;

  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

  const products = db
    .prepare(
      `SELECT p.*, c.name as category_name,
        (SELECT ROUND(AVG(rating),1) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    )
    .all(...params, Number(limit), offset);

  const total = db
    .prepare(`SELECT COUNT(*) as count FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`)
    .get(...params).count;

  res.json({ products, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) });
});

router.get('/categories/list', (req, res) => {
  res.json({ categories: db.prepare('SELECT * FROM categories ORDER BY name').all() });
});

router.get('/:id', (req, res) => {
  const product = db
    .prepare(
      `SELECT p.*, c.name as category_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? AND p.is_active = 1`
    )
    .get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const reviews = db
    .prepare(
      `SELECT r.*, u.name as user_name FROM reviews r
       JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC`
    )
    .all(req.params.id);

  res.json({ product, reviews });
});

router.post(
  '/:id/reviews',
  authRequired,
  [body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().trim().isLength({ max: 1000 })],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const boughtIt = db
      .prepare(
        `SELECT 1 FROM order_items oi JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id = ? AND oi.product_id = ? LIMIT 1`
      )
      .get(req.user.id, req.params.id);
    if (!boughtIt) return res.status(403).json({ error: 'You can only review products you have purchased' });

    try {
      db.prepare(
        'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)'
      ).run(req.params.id, req.user.id, req.body.rating, req.body.comment || null);
      res.status(201).json({ message: 'Review submitted' });
    } catch (e) {
      res.status(409).json({ error: 'You have already reviewed this product' });
    }
  }
);

// ---- Admin/vendor product management ----
router.post(
  '/',
  authRequired,
  requireRole('admin', 'vendor'),
  [
    body('name').trim().isLength({ min: 2 }),
    body('price').isFloat({ min: 0 }),
    body('stock').isInt({ min: 0 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description = '', price, image_url = '', category_id = null, stock, sku = null } = req.body;
    const info = db
      .prepare(
        `INSERT INTO products (name, description, price, image_url, category_id, stock, sku, vendor_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(name, description, price, image_url, category_id, stock, sku, req.user.id);
    res.status(201).json({ id: info.lastInsertRowid });
  }
);

router.put('/:id', authRequired, requireRole('admin', 'vendor'), (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (req.user.role === 'vendor' && product.vendor_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own products' });
  }

  const fields = ['name', 'description', 'price', 'image_url', 'category_id', 'stock', 'sku', 'is_active'];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ message: 'Product updated' });
});

router.delete('/:id', authRequired, requireRole('admin', 'vendor'), (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (req.user.role === 'vendor' && product.vendor_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own products' });
  }
  db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product removed' });
});

export default router;
