import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

const getStoredCustomer = () => {
  try {
    const raw = localStorage.getItem('lastCustomer');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const Header = () => {
  const { itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(getStoredCustomer);

  // Sync when another tab checks out or logs out
  useEffect(() => {
    const onStorage = () => setCustomer(getStoredCustomer());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lastCustomer');
    clearCart();
    setCustomer(null);
    navigate('/');
  };

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

            {customer ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Hi, {customer.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
