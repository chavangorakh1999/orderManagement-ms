import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { formatPrice, formatDate, formatStatus } from '../utils/formatters';

const STATUS_COLORS = {
  received: 'bg-blue-100 text-blue-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
};

const OrdersPage = () => {
  const { orders, loading, error, refetch } = useOrders();

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Place your first order from our menu!</p>
          <Link
            to="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  // Show newest first
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        <button
          onClick={refetch}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {sorted.map((order) => (
          <Link
            key={order.id}
            to={`/order/${order.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500 font-mono">#{order.id}</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {order.customer.name}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</span>
              <span>•</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>

            <div className="mt-2 text-sm text-gray-500 truncate">
              {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
