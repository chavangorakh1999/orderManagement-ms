const menuService = require('../services/menuService');

const getAllMenuItems = async (req, res, next) => {
  try {
    const items = await menuService.getAllMenuItems();
    return res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
};

const getMenuItemById = async (req, res, next) => {
  try {
    const item = await menuService.getMenuItemById(req.params.id);
    if (!item) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Menu item with id '${req.params.id}' not found`,
          details: [],
        },
      });
    }
    return res.status(200).json({ item });
  } catch (err) {
    next(err);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.createMenuItem(req.body);
    return res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.updateMenuItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Menu item with id '${req.params.id}' not found`,
          details: [],
        },
      });
    }
    return res.status(200).json({ item });
  } catch (err) {
    next(err);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const result = await menuService.deleteMenuItem(req.params.id);
    if (!result) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Menu item with id '${req.params.id}' not found`,
          details: [],
        },
      });
    }
    return res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
