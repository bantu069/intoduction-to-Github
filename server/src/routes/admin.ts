import { Router } from 'express';
import { getDb } from '../db';
import { authRequired, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authRequired, requireAdmin);

router.get('/stock', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(
    'SELECT id, name, stock_qty AS stockQty, is_active AS isActive FROM menu_items ORDER BY name'
  ).all();
  return res.json(rows);
});

router.get('/payments', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(
    `SELECT p.id, p.order_id AS orderId, p.amount_cents AS amountCents, p.method, p.status, p.created_at AS createdAt,
            u.name AS userName
     FROM payments p JOIN orders o ON o.id = p.order_id JOIN users u ON u.id = o.user_id
     ORDER BY p.created_at DESC`
  ).all();
  return res.json(rows);
});

router.get('/reviews', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(
    `SELECT r.id, r.rating, r.comment, r.created_at AS createdAt, u.name AS userName, m.name AS itemName
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN menu_items m ON m.id = r.item_id
     ORDER BY r.created_at DESC`
  ).all();
  return res.json(rows);
});

export default router;
