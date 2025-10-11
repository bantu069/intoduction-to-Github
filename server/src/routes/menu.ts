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

const UpdateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceCents: z.number().int().positive().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

router.patch('/:id', authRequired, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const parse = UpdateItemSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const id = Number(req.params.id);
  const db = getDb();
  const current = db
    .prepare(
      `SELECT id, name, description, price_cents AS priceCents, stock_qty AS stockQty, is_active AS isActive FROM menu_items WHERE id = ?`
    )
    .get(id) as { id: number; name: string; description: string; priceCents: number; stockQty: number; isActive: number } | undefined;
  if (!current) return res.status(404).json({ error: 'Not found' });
  const next = {
    name: parse.data.name ?? current.name,
    description: parse.data.description ?? current.description,
    priceCents: parse.data.priceCents ?? current.priceCents,
    stockQty: parse.data.stockQty ?? current.stockQty,
    isActive: (parse.data.isActive ?? !!current.isActive) ? 1 : 0,
  };
  db.prepare(
    'UPDATE menu_items SET name = ?, description = ?, price_cents = ?, stock_qty = ?, is_active = ? WHERE id = ?'
  ).run(next.name, next.description, next.priceCents, next.stockQty, next.isActive, id);
  return res.json({ ok: true });
});

router.delete('/:id', authRequired, (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const id = Number(req.params.id);
  const db = getDb();
  const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  return res.json({ ok: true });
});

export default router;
