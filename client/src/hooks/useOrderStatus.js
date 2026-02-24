import { useState, useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

export const useOrderStatus = (orderId) => {
  const { socket, isConnected } = useSocketContext();
  const [status, setStatus] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('order:subscribe', { orderId });

    const handleStatusUpdate = (data) => {
      if (data.orderId === orderId) {
        setStatus(data.status);
        setUpdatedAt(data.updatedAt);
      }
    };

    socket.on('order:statusUpdate', handleStatusUpdate);

    return () => {
      socket.off('order:statusUpdate', handleStatusUpdate);
      socket.emit('order:unsubscribe', { orderId });
    };
  }, [socket, orderId]);

  return { status, updatedAt, isConnected };
};
