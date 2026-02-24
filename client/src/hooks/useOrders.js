import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const getSavedPhone = () => {
  try {
    const raw = localStorage.getItem('lastCustomer');
    return raw ? JSON.parse(raw)?.phone : null;
  } catch {
    return null;
  }
};

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    const phone = getSavedPhone();
    if (!phone) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/api/orders', { params: { phone } });
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
