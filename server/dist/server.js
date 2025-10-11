"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const auth_1 = __importDefault(require("./routes/auth"));
const menu_1 = __importDefault(require("./routes/menu"));
const orders_1 = __importDefault(require("./routes/orders"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, db_1.initializeDatabase)();
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/menu', menu_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/admin', admin_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
});
