import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

const Cart = () => {
  const { items, totalAmount, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
        <Link
          to="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cart Items ({itemCount})
          </h2>
          {items.map((item) => (
            <CartItem key={item.menuItemId} item={item} />
          ))}
        </div>
      </div>

      <div>
        <CartSummary totalAmount={totalAmount} itemCount={itemCount} />
        <Link
          to="/checkout"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg text-center mt-4 transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;
