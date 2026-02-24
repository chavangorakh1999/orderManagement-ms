import { useState } from 'react';
import apiClient from '../api/apiClient';

export const useOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const placeOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.post('/api/orders', orderData);
      return data.order;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to place order';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId) => {
    try {
      const { data } = await apiClient.get(`/api/orders/${orderId}`);
      return data.order;
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to fetch order';
      setError(message);
      throw new Error(message);
    }
  };

  return { placeOrder, getOrder, loading, error };
};
