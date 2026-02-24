import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../../components/cart/Cart';
import { CartProvider } from '../../context/CartContext';
import MenuItem from '../../components/menu/MenuItem';

const mockItem = {
  id: 'item_1',
  name: 'Test Pizza',
  description: 'A delicious test pizza',
  price: 12.99,
  image: '/images/test-pizza.jpg',
  category: 'Pizza',
};

const renderCart = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <Cart />
      </CartProvider>
    </MemoryRouter>
  );

const renderCartWithItem = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <MenuItem item={mockItem} />
        <Cart />
      </CartProvider>
    </MemoryRouter>
  );

describe('Cart', () => {
  it('shows empty cart message when no items', () => {
    renderCart();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Browse Menu')).toBeInTheDocument();
  });

  it('shows cart items after adding an item', () => {
    renderCartWithItem();
    fireEvent.click(screen.getByText('Add to Cart'));

    expect(screen.getAllByText('Test Pizza').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('displays correct item count in cart header', () => {
    renderCartWithItem();
    fireEvent.click(screen.getByText('Add to Cart'));

    expect(screen.getByText('Cart Items (1)')).toBeInTheDocument();
  });
});
