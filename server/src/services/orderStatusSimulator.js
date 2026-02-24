const orderService = require('./orderService');

const STATUS_SEQUENCE = ['received', 'preparing', 'out_for_delivery', 'delivered'];

const simulateOrderProgress = (orderId, io) => {
  const intervalMs = parseInt(process.env.STATUS_UPDATE_INTERVAL_MS, 10) || 0;
  if (!intervalMs || intervalMs <= 0) return;

  const transitions = STATUS_SEQUENCE.slice(1);

  transitions.forEach((status, index) => {
    const delay = intervalMs * (index + 1);

    setTimeout(async () => {
      try {
        const order = await orderService.updateOrderStatus(orderId, status);
        if (order && io) {
          io.to(`order:${order.id}`).emit('order:statusUpdate', {
            orderId: order.id,
            status: order.status,
            updatedAt: order.updatedAt,
          });
          console.log(`[Simulator] Order ${orderId} → ${status}`);
        }
      } catch (err) {
        console.warn(`[Simulator] Skipped transition for ${orderId} → ${status}: ${err.message}`);
      }
    }, delay);
  });
};

module.exports = { simulateOrderProgress };
