import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const useMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/api/menu');
        setItems(data.items);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { items, loading, error };
};
