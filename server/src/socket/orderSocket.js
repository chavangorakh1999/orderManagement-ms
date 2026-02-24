const setupOrderSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('order:subscribe', ({ orderId }) => {
      if (!orderId) {
        socket.emit('order:error', { message: 'orderId is required' });
        return;
      }
      socket.join(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} subscribed to order:${orderId}`);
    });

    socket.on('order:unsubscribe', ({ orderId }) => {
      if (!orderId) return;
      socket.leave(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} unsubscribed from order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupOrderSocket };
