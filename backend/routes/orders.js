import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db/init.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

router.post(
  '/checkout',
  authRequired,
  [
    body('shipping_name').trim().notEmpty(),
    body('shipping_address').trim().notEmpty(),
    body('shipping_city').trim().notEmpty(),
    body('shipping_zip').trim().notEmpty(),
    body('payment_method').isIn(['card', 'cod', 'upi']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(req.user.id);
    const items = cart
      ? db
          .prepare(
            `SELECT ci.*, p.name, p.price, p.stock FROM cart_items ci
             JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?`
          )
          .all(cart.id)
      : [];

    if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    for (const item of items) {
      if (item.quantity > item.stock) {
        return res.status(400).json({ error: `${item.name} only has ${item.stock} in stock` });
      }
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const { shipping_name, shipping_address, shipping_city, shipping_zip, payment_method } = req.body;

    const insertOrder = db.prepare(
      `INSERT INTO orders (user_id, status, total, shipping_name, shipping_address, shipping_city, shipping_zip, payment_method)
       VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)`
    );
    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)`
    );
    const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    const clearCart = db.prepare('DELETE FROM cart_items WHERE cart_id = ?');

    const txn = db.transaction(() => {
      const orderInfo = insertOrder.run(
        req.user.id,
        Math.round(total * 100) / 100,
        shipping_name,
        shipping_address,
        shipping_city,
        shipping_zip,
        payment_method
      );
      for (const item of items) {
        insertItem.run(orderInfo.lastInsertRowid, item.product_id, item.name, item.price, item.quantity);
        decrementStock.run(item.quantity, item.product_id);
      }
      clearCart.run(cart.id);
      return orderInfo.lastInsertRowid;
    });

    const orderId = txn();
    res.status(201).json({ message: 'Order placed successfully', order_id: orderId });
  }
);

router.get('/mine', authRequired, (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  for (const order of orders) {
    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  }
  res.json({ orders });
});

router.get('/:id', authRequired, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to view this order' });
  }
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order });
});

// ---- Admin: all orders + status updates ----
router.get('/', authRequired, requireRole('admin'), (req, res) => {
  const orders = db
    .prepare(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`
    )
    .all();
  res.json({ orders });
});

router.put(
  '/:id/status',
  authRequired,
  requireRole('admin'),
  [body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    res.json({ message: 'Order status updated' });
  }
);

export default router;
