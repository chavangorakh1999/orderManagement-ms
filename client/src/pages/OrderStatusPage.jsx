import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { useOrderStatus } from '../hooks/useOrderStatus';
import OrderConfirmation from '../components/order/OrderConfirmation';
import OrderStatusTracker from '../components/order/OrderStatusTracker';

const OrderStatusPage = () => {
  const { id } = useParams();
  const { getOrder } = useOrder();
  const { status: liveStatus, isConnected } = useOrderStatus(id);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const fetchedOrder = await getOrder(id);
        setOrder(fetchedOrder);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (liveStatus && order) {
      setOrder((prev) => ({ ...prev, status: liveStatus }));
    }
  }, [liveStatus]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link
          to="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live updates' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {order && (
        <>
          <OrderStatusTracker currentStatus={order.status} />
          <OrderConfirmation order={order} />
          <div className="text-center">
            <Link
              to="/"
              className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              Order More
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderStatusPage;
