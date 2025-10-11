"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
router.post('/register', (req, res) => {
    const parse = RegisterSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: parse.error.flatten() });
    }
    const { name, email, password } = parse.data;
    const db = (0, db_1.getDb)();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = bcryptjs_1.default.hashSync(password, 10);
    const result = db
        .prepare('INSERT INTO users (name, email, password_hash, role, reward_points, created_at) VALUES (?, ?, ?, ?, 0, datetime("now"))')
        .run(name, email, passwordHash, 'customer');
    const userId = Number(result.lastInsertRowid);
    const token = (0, jwt_1.signToken)({ userId, role: 'customer' });
    return res.json({ token, user: { id: userId, name, email, role: 'customer', rewardPoints: 0 } });
});
const LoginSchema = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(1) });
router.post('/login', (req, res) => {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: parse.error.flatten() });
    }
    const { email, password } = parse.data;
    const db = (0, db_1.getDb)();
    const user = db
        .prepare('SELECT id, name, email, password_hash AS passwordHash, role, reward_points AS rewardPoints FROM users WHERE email = ?')
        .get(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = bcryptjs_1.default.compareSync(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, rewardPoints: user.rewardPoints } });
});
exports.default = router;
// Current user profile
router.get('/me', auth_1.authRequired, (req, res) => {
    const db = (0, db_1.getDb)();
    const user = db
        .prepare('SELECT id, name, email, role, reward_points AS rewardPoints FROM users WHERE id = ?')
        .get(req.user.userId);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    return res.json(user);
});
// Customer profile: allergies and preferences
const ProfileSchema = zod_1.z.object({
    allergies: zod_1.z.string().default(''),
    preferences: zod_1.z.string().default(''),
});
router.get('/profile', auth_1.authRequired, (req, res) => {
    const db = (0, db_1.getDb)();
    const row = db
        .prepare('SELECT user_id AS userId, allergies, preferences FROM profiles WHERE user_id = ?')
        .get(req.user.userId);
    return res.json(row || { userId: req.user.userId, allergies: '', preferences: '' });
});
router.post('/profile', auth_1.authRequired, (req, res) => {
    const parse = ProfileSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { allergies, preferences } = parse.data;
    const db = (0, db_1.getDb)();
    db.prepare(`INSERT INTO profiles (user_id, allergies, preferences) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET allergies = excluded.allergies, preferences = excluded.preferences`).run(req.user.userId, allergies, preferences);
    return res.json({ ok: true });
});
