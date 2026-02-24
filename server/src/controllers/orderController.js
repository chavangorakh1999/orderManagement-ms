const orderService = require('../services/orderService');
const { simulateOrderProgress } = require('../services/orderStatusSimulator');

const getAllOrders = (req, res, next) => {
  try {
    const orders = orderService.getAllOrders();
    return res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

const getOrderById = (req, res, next) => {
  try {
    const order = orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Order with id '${req.params.id}' not found`,
          details: [],
        },
      });
    }
    return res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
};

const createOrder = (req, res, next) => {
  try {
    const order = orderService.createOrder(req.body);
    simulateOrderProgress(order.id, req.app.get('io'));
    return res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = (req, res, next) => {
  try {
    const order = orderService.updateOrderStatus(req.params.id, req.body.status);
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Order with id '${req.params.id}' not found`,
          details: [],
        },
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${order.id}`).emit('order:statusUpdate', {
        orderId: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
      });
    }

    return res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};
