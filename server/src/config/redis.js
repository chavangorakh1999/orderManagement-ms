const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;
let isRedisAvailable = false;

const createRedisClient = () => {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('[Redis] Max retries reached. Running without Redis.');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on('connect', () => {
    isRedisAvailable = true;
    console.log('[Redis] Connected successfully');
  });

  client.on('error', (err) => {
    isRedisAvailable = false;
    console.warn('[Redis] Connection error:', err.message);
  });

  client.on('close', () => {
    isRedisAvailable = false;
  });

  return client;
};

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
};

const connectRedis = async () => {
  const client = getRedisClient();
  try {
    await client.connect();
  } catch (err) {
    console.warn('[Redis] Failed to connect:', err.message);
    isRedisAvailable = false;
  }
  return client;
};

const getRedisStatus = () => isRedisAvailable;

module.exports = { getRedisClient, connectRedis, getRedisStatus };
