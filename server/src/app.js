const express = require('express');
const cors = require('cors');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorHandler);

module.exports = app;
