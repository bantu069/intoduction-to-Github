import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { signToken } from '../utils/jwt';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', (req, res) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  const { name, email, password } = parse.data;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      'INSERT INTO users (name, email, password_hash, role, reward_points, created_at) VALUES (?, ?, ?, ?, 0, datetime("now"))'
    )
    .run(name, email, passwordHash, 'customer');
  const userId = Number(result.lastInsertRowid);
  const token = signToken({ userId, role: 'customer' });
  return res.json({ token, user: { id: userId, name, email, role: 'customer', rewardPoints: 0 } });
});

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/login', (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  const { email, password } = parse.data;
  const db = getDb();
  const user = db
    .prepare('SELECT id, name, email, password_hash AS passwordHash, role, reward_points AS rewardPoints FROM users WHERE email = ?')
    .get(email) as
    | { id: number; name: string; email: string; passwordHash: string; role: 'customer' | 'admin'; rewardPoints: number }
    | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ userId: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, rewardPoints: user.rewardPoints } });
});

export default router;
