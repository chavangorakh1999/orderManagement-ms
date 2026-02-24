import Cart from '../components/cart/Cart';

const getLastCustomer = () => {
  try {
    const raw = localStorage.getItem('lastCustomer');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const CartPage = () => {
  const customer = getLastCustomer();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        {customer && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-2">
            <span className="text-lg">👤</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{customer.name}</p>
              <p className="text-xs text-gray-500 leading-tight">{customer.phone}</p>
            </div>
          </div>
        )}
      </div>
      <Cart />
    </div>
  );
};

export default CartPage;
