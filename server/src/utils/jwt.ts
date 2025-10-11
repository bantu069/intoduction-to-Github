import jwt from 'jsonwebtoken';

export type JwtPayload = {
  userId: number;
  role: 'customer' | 'admin';
};

function getSecret(): string {
  return process.env.JWT_SECRET || 'dev-secret-change-me';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
