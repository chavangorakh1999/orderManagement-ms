const MenuItem = require('../models/MenuItem');
const { getRedisClient, getRedisStatus } = require('../config/redis');

const CACHE_KEY = 'menu:all';
const CACHE_TTL = 60;

const getAllMenuItems = async () => {
  if (getRedisStatus()) {
    try {
      const cached = await getRedisClient().get(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.warn('[MenuService] Cache read failed:', err.message);
    }
  }

  const items = await MenuItem.find();

  if (getRedisStatus()) {
    try {
      await getRedisClient().set(CACHE_KEY, JSON.stringify(items), 'EX', CACHE_TTL);
    } catch (err) {
      console.warn('[MenuService] Cache write failed:', err.message);
    }
  }

  return items;
};

const getMenuItemById = async (id) => {
  try {
    const item = await MenuItem.findById(id);
    return item || null;
  } catch (err) {
    if (err.name === 'CastError') return null;
    throw err;
  }
};

const createMenuItem = async (data) => {
  const item = await MenuItem.create(data);
  await invalidateCache();
  return item;
};

const updateMenuItem = async (id, data) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
    if (item) await invalidateCache();
    return item || null;
  } catch (err) {
    if (err.name === 'CastError') return null;
    throw err;
  }
};

const deleteMenuItem = async (id) => {
  try {
    const item = await MenuItem.findByIdAndDelete(id);
    if (item) await invalidateCache();
    return item !== null;
  } catch (err) {
    if (err.name === 'CastError') return false;
    throw err;
  }
};

const invalidateCache = async () => {
  if (getRedisStatus()) {
    try {
      await getRedisClient().del(CACHE_KEY);
    } catch (err) {
      console.warn('[MenuService] Cache invalidation failed:', err.message);
    }
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
