const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { STATUS_TRANSITIONS } = require('../models/Order');
const { findOrCreateCustomer } = require('./customerService');

const getAllOrders = async (phone) => {
  const filter = phone ? { 'customer.phone': phone } : {};
  return Order.find(filter).sort({ createdAt: -1 });
};

const getOrderById = async (id) => {
  try {
    const order = await Order.findById(id);
    return order || null;
  } catch (err) {
    if (err.name === 'CastError') return null;
    throw err;
  }
};

const createOrder = async (data) => {
  for (const item of data.items) {
    let menuItem = null;
    try {
      menuItem = await MenuItem.findById(item.menuItemId);
    } catch (err) {
      if (err.name !== 'CastError') throw err;
      // CastError means invalid ObjectId format — treat as not found
    }

    if (!menuItem) {
      const error = new Error(`Menu item '${item.menuItemId}' not found`);
      error.status = 400;
      error.code = 'INVALID_MENU_ITEM';
      error.details = [{ field: 'items', message: `Menu item '${item.menuItemId}' does not exist` }];
      throw error;
    }
  }

  const totalAmount =
    Math.round(data.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

  const customer = await findOrCreateCustomer(data.customer);

  const order = await Order.create({
    items: data.items,
    customer: data.customer,
    customerId: customer._id,
    totalAmount,
  });

  return order;
};

const updateOrderStatus = async (id, newStatus) => {
  const order = await getOrderById(id);
  if (!order) return null;

  const allowedTransitions = STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    const error = new Error(`Cannot transition from '${order.status}' to '${newStatus}'`);
    error.status = 400;
    error.code = 'INVALID_STATUS_TRANSITION';
    error.details = [
      {
        field: 'status',
        message: `Valid transitions from '${order.status}': ${allowedTransitions.join(', ') || 'none'}`,
      },
    ];
    throw error;
  }

  order.status = newStatus;
  await order.save();
  return order;
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};
