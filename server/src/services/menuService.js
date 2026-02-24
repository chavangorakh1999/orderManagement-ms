const { menuStore } = require('../store/menuStore');
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

  const items = menuStore.getAll();

  if (getRedisStatus()) {
    try {
      await getRedisClient().set(CACHE_KEY, JSON.stringify(items), 'EX', CACHE_TTL);
    } catch (err) {
      console.warn('[MenuService] Cache write failed:', err.message);
    }
  }

  return items;
};

const getMenuItemById = (id) => {
  return menuStore.getById(id);
};

const createMenuItem = async (data) => {
  const item = menuStore.create(data);
  await invalidateCache();
  return item;
};

const updateMenuItem = async (id, data) => {
  const item = menuStore.update(id, data);
  if (item) await invalidateCache();
  return item;
};

const deleteMenuItem = async (id) => {
  const result = menuStore.delete(id);
  if (result) await invalidateCache();
  return result;
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
