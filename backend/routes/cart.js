import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db/init.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

function getOrCreateCartId(userId) {
  let cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(userId);
  if (!cart) {
    const info = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
    return info.lastInsertRowid;
  }
  return cart.id;
}

router.get('/', (req, res) => {
  const cartId = getOrCreateCartId(req.user.id);
  const items = db
    .prepare(
      `SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ? AND p.is_active = 1`
    )
    .all(cartId);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json({ items, total: Math.round(total * 100) / 100 });
});

router.post(
  '/items',
  [body('product_id').isInt(), body('quantity').isInt({ min: 1 })],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { product_id, quantity } = req.body;
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: `Only ${product.stock} in stock` });

    const cartId = getOrCreateCartId(req.user.id);
    const existing = db.prepare('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?').get(cartId, product_id);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) return res.status(400).json({ error: `Only ${product.stock} in stock` });
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(cartId, product_id, quantity);
    }
    res.status(201).json({ message: 'Added to cart' });
  }
);

router.put('/items/:itemId', [body('quantity').isInt({ min: 1 })], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const cartId = getOrCreateCartId(req.user.id);
  const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND cart_id = ?').get(req.params.itemId, cartId);
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.product_id);
  if (req.body.quantity > product.stock) return res.status(400).json({ error: `Only ${product.stock} in stock` });

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(req.body.quantity, item.id);
  res.json({ message: 'Cart updated' });
});

router.delete('/items/:itemId', (req, res) => {
  const cartId = getOrCreateCartId(req.user.id);
  db.prepare('DELETE FROM cart_items WHERE id = ? AND cart_id = ?').run(req.params.itemId, cartId);
  res.json({ message: 'Item removed' });
});

export default router;
