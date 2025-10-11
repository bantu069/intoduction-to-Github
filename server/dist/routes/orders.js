"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const CartItemSchema = zod_1.z.object({ itemId: zod_1.z.number().int().positive(), quantity: zod_1.z.number().int().positive() });
const CreateOrderSchema = zod_1.z.object({ items: zod_1.z.array(CartItemSchema).min(1) });
router.post('/', auth_1.authRequired, (req, res) => {
    const parse = CreateOrderSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { items } = parse.data;
    const db = (0, db_1.getDb)();
    const tx = db.transaction(() => {
        // Create order
        const result = db
            .prepare('INSERT INTO orders (user_id, status, total_cents, created_at) VALUES (?, ?, 0, datetime("now"))')
            .run(req.user.userId, 'PENDING');
        const orderId = Number(result.lastInsertRowid);
        let totalCents = 0;
        for (const { itemId, quantity } of items) {
            const item = db
                .prepare('SELECT id, price_cents AS priceCents, stock_qty AS stockQty, is_active AS isActive FROM menu_items WHERE id = ?')
                .get(itemId);
            if (!item || !item.isActive)
                throw new Error('Invalid item');
            if (item.stockQty < quantity)
                throw new Error('Insufficient stock');
            db.prepare('INSERT INTO order_items (order_id, item_id, quantity, price_cents) VALUES (?, ?, ?, ?)')
                .run(orderId, itemId, quantity, item.priceCents);
            db.prepare('UPDATE menu_items SET stock_qty = stock_qty - ? WHERE id = ?').run(quantity, itemId);
            totalCents += item.priceCents * quantity;
        }
        db.prepare('UPDATE orders SET total_cents = ? WHERE id = ?').run(totalCents, orderId);
        return { orderId, totalCents };
    });
    try {
        const { orderId, totalCents } = tx();
        return res.status(201).json({ orderId, totalCents });
    }
    catch (e) {
        return res.status(400).json({ error: e.message || 'Failed to create order' });
    }
});
const PaySchema = zod_1.z.object({ orderId: zod_1.z.number().int().positive(), method: zod_1.z.enum(['CARD', 'CASH']) });
router.post('/pay', auth_1.authRequired, (req, res) => {
    const parse = PaySchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { orderId, method } = parse.data;
    const db = (0, db_1.getDb)();
    const tx = db.transaction(() => {
        const order = db
            .prepare('SELECT id, user_id AS userId, status, total_cents AS totalCents FROM orders WHERE id = ?')
            .get(orderId);
        if (!order || order.userId !== req.user.userId)
            throw new Error('Order not found');
        if (order.status !== 'PENDING')
            throw new Error('Order not payable');
        db.prepare('INSERT INTO payments (order_id, amount_cents, method, status, created_at) VALUES (?, ?, ?, ?, datetime("now"))').run(orderId, order.totalCents, method, 'PAID');
        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('PAID', orderId);
        // Reward points: 1 point per 100 cents
        const rewardPoints = Math.floor(order.totalCents / 100);
        db.prepare('UPDATE users SET reward_points = reward_points + ? WHERE id = ?')
            .run(rewardPoints, req.user.userId);
        return { rewardPoints };
    });
    try {
        const { rewardPoints } = tx();
        return res.json({ ok: true, rewardPointsAwarded: rewardPoints });
    }
    catch (e) {
        return res.status(400).json({ error: e.message || 'Payment failed' });
    }
});
router.get('/', auth_1.authRequired, (req, res) => {
    const db = (0, db_1.getDb)();
    const orders = db
        .prepare(`SELECT o.id, o.status, o.total_cents AS totalCents, o.created_at AS createdAt
       FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`)
        .all(req.user.userId);
    return res.json(orders);
});
exports.default = router;
// Order items for a user's order
router.get('/:orderId/items', auth_1.authRequired, (req, res) => {
    const orderId = Number(req.params.orderId);
    const db = (0, db_1.getDb)();
    const order = db
        .prepare('SELECT id, user_id AS userId FROM orders WHERE id = ?')
        .get(orderId);
    if (!order || order.userId !== req.user.userId)
        return res.status(404).json({ error: 'Not found' });
    const items = db
        .prepare(`SELECT oi.id, oi.item_id AS itemId, m.name AS itemName, oi.quantity, oi.price_cents AS priceCents
       FROM order_items oi JOIN menu_items m ON m.id = oi.item_id
       WHERE oi.order_id = ?`)
        .all(orderId);
    return res.json(items);
});
