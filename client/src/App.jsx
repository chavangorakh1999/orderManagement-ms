import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';
import OrdersPage from './pages/OrdersPage';

const App = () => {
  return (
    <Router>
      <SocketProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order/:id" element={<OrderStatusPage />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </SocketProvider>
    </Router>
  );
};

export default App;
