import { Link } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';
import MenuList from '../components/menu/MenuList';

const MenuPage = () => {
  const { items, loading, error } = useMenu();
  const { itemCount, totalAmount } = useCart();

  return (
    <div className="pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
        <p className="text-gray-500 mt-1">Choose from our delicious selection</p>
      </div>
      <MenuList items={items} loading={loading} error={error} />

      {/* Sticky checkout bar — only shown when cart has items */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">{itemCount} item{itemCount !== 1 ? 's' : ''} in cart</p>
              <p className="font-bold text-gray-900 text-lg leading-tight">{formatPrice(totalAmount)}</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/cart"
                className="px-5 py-2.5 border border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Checkout →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
