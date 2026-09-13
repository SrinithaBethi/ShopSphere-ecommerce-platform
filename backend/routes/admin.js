import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db/init.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authRequired, requireRole('admin'));

router.get('/stats', (req, res) => {
  const totalRevenue = db.prepare(`SELECT COALESCE(SUM(total),0) as v FROM orders WHERE status != 'cancelled'`).get().v;
  const totalOrders = db.prepare('SELECT COUNT(*) as v FROM orders').get().v;
  const totalCustomers = db.prepare(`SELECT COUNT(*) as v FROM users WHERE role = 'customer'`).get().v;
  const totalProducts = db.prepare('SELECT COUNT(*) as v FROM products WHERE is_active = 1').get().v;
  const lowStock = db.prepare('SELECT id, name, stock FROM products WHERE is_active = 1 AND stock <= 5 ORDER BY stock ASC').all();

  const revenueByDay = db
    .prepare(
      `SELECT date(created_at) as day, SUM(total) as revenue, COUNT(*) as orders
       FROM orders WHERE status != 'cancelled' AND created_at >= date('now','-13 days')
       GROUP BY day ORDER BY day ASC`
    )
    .all();

  const topProducts = db
    .prepare(
      `SELECT oi.product_name, SUM(oi.quantity) as units_sold, SUM(oi.price * oi.quantity) as revenue
       FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status != 'cancelled'
       GROUP BY oi.product_name ORDER BY units_sold DESC LIMIT 5`
    )
    .all();

  const ordersByStatus = db
    .prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status')
    .all();

  res.json({ totalRevenue, totalOrders, totalCustomers, totalProducts, lowStock, revenueByDay, topProducts, ordersByStatus });
});

router.get('/users', (req, res) => {
  res.json({ users: db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all() });
});

router.put(
  '/users/:id/role',
  [body('role').isIn(['customer', 'admin', 'vendor'])],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(req.body.role, req.params.id);
    res.json({ message: 'Role updated' });
  }
);

router.post('/categories', [body('name').trim().isLength({ min: 2 })], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(req.body.name);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch {
    res.status(409).json({ error: 'Category already exists' });
  }
});

router.delete('/categories/:id', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

export default router;
