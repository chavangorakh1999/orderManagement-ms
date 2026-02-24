require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupOrderSocket } = require('./socket/orderSocket');
const { connectDB } = require('./config/db');
const MenuItem = require('./models/MenuItem');
const { MENU_SEED_DATA } = require('./seed/menuSeed');
const { connectRedis, getRedisStatus } = require('./config/redis');

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Try to connect Redis and set up adapter
  try {
    const redisClient = await connectRedis();
    if (getRedisStatus()) {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const pubClient = redisClient;
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Server] Socket.io Redis adapter enabled');
    }
  } catch (err) {
    console.warn('[Server] Running without Redis adapter:', err.message);
  }

  // Attach io to Express app for use in controllers
  app.set('io', io);

  // Set up Socket.io event handlers
  setupOrderSocket(io);

  // Seed menu data if collection is empty
  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany(MENU_SEED_DATA);
    console.log(`[Server] Seeded ${MENU_SEED_DATA.length} menu items`);
  }

  server.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });

  return server;
};

startServer();
