import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

const Header = () => {
  const { itemCount } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <span className="text-xl font-bold text-gray-900">FoodDash</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Menu
            </Link>
            <Link
              to="/orders"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Orders
            </Link>
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
