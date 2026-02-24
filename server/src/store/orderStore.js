const { generateOrderId } = require('../utils/generateId');

const ORDER_STATUSES = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
};

const STATUS_TRANSITIONS = {
  [ORDER_STATUSES.RECEIVED]: [ORDER_STATUSES.PREPARING],
  [ORDER_STATUSES.PREPARING]: [ORDER_STATUSES.OUT_FOR_DELIVERY],
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.DELIVERED]: [],
};

class OrderStore {
  constructor() {
    this.orders = new Map();
  }

  getAll() {
    return Array.from(this.orders.values());
  }

  getById(id) {
    return this.orders.get(id) || null;
  }

  create(data) {
    const now = new Date().toISOString();
    const order = {
      id: generateOrderId(),
      items: data.items,
      customer: data.customer,
      status: ORDER_STATUSES.RECEIVED,
      totalAmount: data.totalAmount,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(order.id, order);
    return order;
  }

  updateStatus(id, status) {
    const order = this.orders.get(id);
    if (!order) return null;

    const updated = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  clear() {
    this.orders.clear();
  }
}

const orderStore = new OrderStore();

module.exports = { orderStore, OrderStore, ORDER_STATUSES, STATUS_TRANSITIONS };
