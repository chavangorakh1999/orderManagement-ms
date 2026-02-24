const { orderStore, STATUS_TRANSITIONS } = require('../store/orderStore');
const { menuStore } = require('../store/menuStore');

const getAllOrders = () => {
  return orderStore.getAll();
};

const getOrderById = (id) => {
  return orderStore.getById(id);
};

const createOrder = (data) => {
  for (const item of data.items) {
    const menuItem = menuStore.getById(item.menuItemId);
    if (!menuItem) {
      const error = new Error(`Menu item '${item.menuItemId}' not found`);
      error.status = 400;
      error.code = 'INVALID_MENU_ITEM';
      error.details = [{ field: 'items', message: `Menu item '${item.menuItemId}' does not exist` }];
      throw error;
    }
  }

  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const roundedTotal = Math.round(totalAmount * 100) / 100;

  return orderStore.create({
    items: data.items,
    customer: data.customer,
    totalAmount: roundedTotal,
  });
};

const updateOrderStatus = (id, newStatus) => {
  const order = orderStore.getById(id);
  if (!order) return null;

  const allowedTransitions = STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    const error = new Error(
      `Cannot transition from '${order.status}' to '${newStatus}'`
    );
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

  return orderStore.updateStatus(id, newStatus);
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};
