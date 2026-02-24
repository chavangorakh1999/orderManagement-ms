import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import CheckoutForm from '../components/checkout/CheckoutForm';
import CartSummary from '../components/cart/CartSummary';
import Toast from '../components/common/Toast';
import { formatPrice } from '../utils/formatters';

const CheckoutPage = () => {
  const { items, totalAmount, itemCount, clearCart } = useCart();
  const { placeOrder, loading, error } = useOrder();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  const handleSubmit = async (customerData) => {
    try {
      const orderData = {
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        customer: customerData,
      };

      const order = await placeOrder(orderData);
      setToast({ message: 'Order placed successfully!', type: 'success' });
      setTimeout(() => navigate(`/order/${order.id}`), 500);
      clearCart();
      localStorage.setItem('lastCustomer', JSON.stringify(customerData));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Summary — shown first on mobile, right column on desktop */}
        <div className="order-first lg:order-last">
          <CartSummary totalAmount={totalAmount} itemCount={itemCount} />
          <div className="mt-3 sm:mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h4 className="font-medium text-gray-700 mb-3">Your Items</h4>
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-start gap-2 text-sm py-1.5">
                <span className="text-gray-600 min-w-0 flex-1">
                  <span className="block truncate">{item.name}</span>
                  <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="text-gray-900 shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form — shown second on mobile, left two columns on desktop */}
        <div className="lg:col-span-2 order-last lg:order-first">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <CheckoutForm onSubmit={handleSubmit} loading={loading} />
            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
