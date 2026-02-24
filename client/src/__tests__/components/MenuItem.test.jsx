import { render, screen, fireEvent } from '@testing-library/react';
import MenuItem from '../../components/menu/MenuItem';
import { CartProvider } from '../../context/CartContext';

const mockItem = {
  id: 'item_1',
  name: 'Test Pizza',
  description: 'A delicious test pizza',
  price: 12.99,
  image: '/images/test-pizza.jpg',
  category: 'Pizza',
};

const renderMenuItem = (item = mockItem) =>
  render(
    <CartProvider>
      <MenuItem item={item} />
    </CartProvider>
  );

describe('MenuItem', () => {
  it('renders item name, price, and category', () => {
    renderMenuItem();
    expect(screen.getByText('Test Pizza')).toBeInTheDocument();
    expect(screen.getByText('₹12.99')).toBeInTheDocument();
    expect(screen.getByText('Pizza')).toBeInTheDocument();
  });

  it('renders Add to Cart button initially', () => {
    renderMenuItem();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('shows quantity stepper after adding to cart', () => {
    renderMenuItem();
    fireEvent.click(screen.getByText('Add to Cart'));

    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('increments quantity when + is clicked', () => {
    renderMenuItem();
    fireEvent.click(screen.getByText('Add to Cart'));
    fireEvent.click(screen.getByText('+'));

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('removes item and shows Add to Cart when quantity reaches 0', () => {
    renderMenuItem();
    fireEvent.click(screen.getByText('Add to Cart'));
    fireEvent.click(screen.getByText('-'));

    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });
});
