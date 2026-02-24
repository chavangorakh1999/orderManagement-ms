import { formatPrice } from '../../utils/formatters';

const CartSummary = ({ totalAmount, itemCount }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Items ({itemCount})</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-gray-900 text-base">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
