"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authRequired, auth_1.requireAdmin);
router.get('/stock', (_req, res) => {
    const db = (0, db_1.getDb)();
    const rows = db.prepare('SELECT id, name, stock_qty AS stockQty, is_active AS isActive FROM menu_items ORDER BY name').all();
    return res.json(rows);
});
router.get('/payments', (_req, res) => {
    const db = (0, db_1.getDb)();
    const rows = db.prepare(`SELECT p.id, p.order_id AS orderId, p.amount_cents AS amountCents, p.method, p.status, p.created_at AS createdAt,
            u.name AS userName
     FROM payments p JOIN orders o ON o.id = p.order_id JOIN users u ON u.id = o.user_id
     ORDER BY p.created_at DESC`).all();
    return res.json(rows);
});
router.get('/reviews', (_req, res) => {
    const db = (0, db_1.getDb)();
    const rows = db.prepare(`SELECT r.id, r.rating, r.comment, r.created_at AS createdAt, u.name AS userName, m.name AS itemName
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN menu_items m ON m.id = r.item_id
     ORDER BY r.created_at DESC`).all();
    return res.json(rows);
});
// Analytics: popular items (by quantity sold) and frequent customers (by paid orders)
router.get('/analytics', (_req, res) => {
    const db = (0, db_1.getDb)();
    const popularItems = db.prepare(`SELECT m.id, m.name, SUM(oi.quantity) AS totalQty
     FROM order_items oi
     JOIN menu_items m ON m.id = oi.item_id
     GROUP BY m.id, m.name
     ORDER BY totalQty DESC
     LIMIT 10`).all();
    const frequentCustomers = db.prepare(`SELECT u.id, u.name, COUNT(o.id) AS ordersCount
     FROM orders o JOIN users u ON u.id = o.user_id
     WHERE o.status = 'PAID'
     GROUP BY u.id, u.name
     ORDER BY ordersCount DESC
     LIMIT 10`).all();
    return res.json({ popularItems, frequentCustomers });
});
// Sales reports: totals by day and payment method
router.get('/sales', (_req, res) => {
    const db = (0, db_1.getDb)();
    const byDay = db.prepare(`SELECT substr(created_at, 1, 10) AS day, SUM(amount_cents) AS totalCents
     FROM payments
     WHERE status = 'PAID'
     GROUP BY day
     ORDER BY day DESC`).all();
    const byMethod = db.prepare(`SELECT method, SUM(amount_cents) AS totalCents
     FROM payments
     WHERE status = 'PAID'
     GROUP BY method`).all();
    return res.json({ byDay, byMethod });
});
exports.default = router;
