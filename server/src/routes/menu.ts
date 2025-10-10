import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db';
import { authRequired, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const items = db
    .prepare(
      `SELECT id, name, description, price_cents AS priceCents, stock_qty AS stockQty, is_active AS isActive
       FROM menu_items WHERE is_active = 1 ORDER BY name`
    )
    .all();
  return res.json(items);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const item = db
    .prepare(
      `SELECT id, name, description, price_cents AS priceCents, stock_qty AS stockQty, is_active AS isActive
       FROM menu_items WHERE id = ?`
    )
    .get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  return res.json(item);
});

const AddItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  priceCents: z.number().int().positive(),
  stockQty: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
});

router.post('/', authRequired, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const parse = AddItemSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { name, description, priceCents, stockQty, isActive } = parse.data;
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO menu_items (name, description, price_cents, stock_qty, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, datetime("now"))`
    )
    .run(name, description, priceCents, stockQty, isActive ? 1 : 0);
  return res.status(201).json({ id: Number(result.lastInsertRowid) });
});

export default router;
