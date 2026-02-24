const orderService = require('./orderService');

const STATUS_SEQUENCE = ['received', 'preparing', 'out_for_delivery', 'delivered'];

/**
 * Automatically advances an order through all statuses.
 * Each transition happens after STATUS_UPDATE_INTERVAL_MS milliseconds.
 * Controlled by the STATUS_UPDATE_INTERVAL_MS environment variable.
 */
const simulateOrderProgress = (orderId, io) => {
  const intervalMs = parseInt(process.env.STATUS_UPDATE_INTERVAL_MS, 10) || 0;

  // 0 or missing = simulation disabled
  if (!intervalMs || intervalMs <= 0) return;

  // Schedule transitions: preparing, out_for_delivery, delivered
  // (order starts at 'received', so we skip the first status)
  const transitions = STATUS_SEQUENCE.slice(1);

  transitions.forEach((status, index) => {
    const delay = intervalMs * (index + 1);

    setTimeout(() => {
      try {
        const order = orderService.updateOrderStatus(orderId, status);
        if (order && io) {
          io.to(`order:${order.id}`).emit('order:statusUpdate', {
            orderId: order.id,
            status: order.status,
            updatedAt: order.updatedAt,
          });
          console.log(`[Simulator] Order ${orderId} → ${status}`);
        }
      } catch (err) {
        // Order may already be in a terminal state or deleted — silently skip
        console.warn(`[Simulator] Skipped transition for ${orderId} → ${status}: ${err.message}`);
      }
    }, delay);
  });
};

module.exports = { simulateOrderProgress };
