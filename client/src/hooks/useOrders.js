import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/api/orders');
      setOrders(data.orders);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refetch: fetchOrders };
};
