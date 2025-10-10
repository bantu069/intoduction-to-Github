"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
exports.requireAdmin = requireAdmin;
const jwt_1 = require("../utils/jwt");
function authRequired(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.slice('Bearer '.length);
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    return next();
}
