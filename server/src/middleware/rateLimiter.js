const { RateLimiterMemory, RateLimiterRedis } = require('rate-limiter-flexible');
const { getRedisClient, getRedisStatus } = require('../config/redis');

let rateLimiter = null;

const createRateLimiter = () => {
  if (getRedisStatus()) {
    try {
      rateLimiter = new RateLimiterRedis({
        storeClient: getRedisClient(),
        keyPrefix: 'rl',
        points: 10,
        duration: 1,
      });
      return rateLimiter;
    } catch (err) {
      console.warn('[RateLimiter] Redis unavailable, falling back to memory:', err.message);
    }
  }

  rateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 1,
  });

  return rateLimiter;
};

const rateLimiterMiddleware = async (req, res, next) => {
  if (!rateLimiter) {
    createRateLimiter();
  }

  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (err) {
    return res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please try again later.',
        details: [],
      },
    });
  }
};

module.exports = { rateLimiterMiddleware, createRateLimiter };
