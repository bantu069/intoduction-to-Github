"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    const db = (0, db_1.getDb)();
    const items = db
        .prepare(`SELECT id, name, description, price_cents AS priceCents, stock_qty AS stockQty, is_active AS isActive
       FROM menu_items WHERE is_active = 1 ORDER BY name`)
        .all();
    return res.json(items);
});
router.get('/:id', (req, res) => {
    const db = (0, db_1.getDb)();
    const item = db
        .prepare(`SELECT id, name, description, price_cents AS priceCents, stock_qty AS stockQty, is_active AS isActive
       FROM menu_items WHERE id = ?`)
        .get(Number(req.params.id));
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    return res.json(item);
});
const AddItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().default(''),
    priceCents: zod_1.z.number().int().positive(),
    stockQty: zod_1.z.number().int().nonnegative(),
    isActive: zod_1.z.boolean().default(true),
});
router.post('/', auth_1.authRequired, (req, res) => {
    if (req.user?.role !== 'admin')
        return res.status(403).json({ error: 'Admin access required' });
    const parse = AddItemSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { name, description, priceCents, stockQty, isActive } = parse.data;
    const db = (0, db_1.getDb)();
    const result = db
        .prepare(`INSERT INTO menu_items (name, description, price_cents, stock_qty, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, datetime("now"))`)
        .run(name, description, priceCents, stockQty, isActive ? 1 : 0);
    return res.status(201).json({ id: Number(result.lastInsertRowid) });
});
exports.default = router;
