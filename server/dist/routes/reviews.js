"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const CreateReviewSchema = zod_1.z.object({
    orderId: zod_1.z.number().int().positive(),
    itemId: zod_1.z.number().int().positive(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional(),
});
router.post('/', auth_1.authRequired, (req, res) => {
    const parse = CreateReviewSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { orderId, itemId, rating, comment } = parse.data;
    const db = (0, db_1.getDb)();
    const orderItem = db
        .prepare(`SELECT oi.order_id AS orderId, o.user_id AS userId
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE oi.order_id = ? AND oi.item_id = ?`)
        .get(orderId, itemId);
    if (!orderItem || orderItem.userId !== req.user.userId) {
        return res.status(400).json({ error: 'You did not order this item' });
    }
    const exists = db
        .prepare('SELECT id FROM reviews WHERE order_id = ? AND item_id = ? AND user_id = ?')
        .get(orderId, itemId, req.user.userId);
    if (exists)
        return res.status(409).json({ error: 'Already reviewed' });
    db.prepare('INSERT INTO reviews (order_id, item_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))').run(orderId, itemId, req.user.userId, rating, comment ?? null);
    return res.status(201).json({ ok: true });
});
router.get('/item/:itemId', (_req, res) => {
    const db = (0, db_1.getDb)();
    const itemId = Number(_req.params.itemId);
    const reviews = db
        .prepare(`SELECT r.id, r.rating, r.comment, r.created_at AS createdAt, u.name AS userName
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.item_id = ?
       ORDER BY r.created_at DESC`)
        .all(itemId);
    return res.json(reviews);
});
exports.default = router;
