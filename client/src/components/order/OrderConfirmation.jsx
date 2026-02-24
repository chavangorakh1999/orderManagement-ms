import { formatPrice, formatDate } from '../../utils/formatters';

const OrderConfirmation = ({ order }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎉</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order Confirmed</h3>
          <p className="text-sm text-gray-500">Order ID: {order.id}</p>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h4 className="font-medium text-gray-700">Items</h4>
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {item.name} x {item.quantity}
            </span>
            <span className="text-gray-900 font-medium">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}

        <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="border-t pt-4 mt-4 text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">Delivering to:</span> {order.customer.name}</p>
        <p><span className="font-medium">Address:</span> {order.customer.address}</p>
        <p><span className="font-medium">Phone:</span> {order.customer.phone}</p>
        <p><span className="font-medium">Placed:</span> {formatDate(order.createdAt)}</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
