require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupOrderSocket } = require('./socket/orderSocket');
const { menuStore } = require('./store/menuStore');
const { MENU_SEED_DATA } = require('./seed/menuSeed');
const { connectRedis, getRedisStatus } = require('./config/redis');

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const startServer = async () => {
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

  // Seed menu data
  if (menuStore.getAll().length === 0) {
    MENU_SEED_DATA.forEach((item) => menuStore.create(item));
    console.log(`[Server] Seeded ${MENU_SEED_DATA.length} menu items`);
  }

  server.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });

  return server;
};

startServer();
