import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutForm from '../../components/checkout/CheckoutForm';

const mockOnSubmit = jest.fn();

const renderForm = (props = {}) =>
  render(<CheckoutForm onSubmit={mockOnSubmit} loading={false} {...props} />);

describe('CheckoutForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Delivery Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  it('renders Place Order button', () => {
    renderForm();
    expect(screen.getByText('Place Order')).toBeInTheDocument();
  });

  it('shows Placing Order... when loading', () => {
    renderForm({ loading: true });
    expect(screen.getByText('Placing Order...')).toBeInTheDocument();
  });

  it('submit button is disabled when form is empty', () => {
    renderForm();
    expect(screen.getByText('Place Order')).toBeDisabled();
  });

  it('shows validation error on blur for empty name', () => {
    renderForm();
    const nameInput = screen.getByLabelText('Full Name');
    fireEvent.focus(nameInput);
    fireEvent.blur(nameInput);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('shows validation error on blur for short address', () => {
    renderForm();
    const addressInput = screen.getByLabelText('Delivery Address');
    fireEvent.change(addressInput, { target: { value: 'AB', name: 'address' } });
    fireEvent.blur(addressInput);

    expect(screen.getByText('Address must be at least 5 characters')).toBeInTheDocument();
  });

  it('shows validation error on blur for invalid phone', () => {
    renderForm();
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: 'not-a-phone', name: 'phone' } });
    fireEvent.blur(phoneInput);

    expect(screen.getByText('Invalid phone format (e.g., +1234567890)')).toBeInTheDocument();
  });

  it('calls onSubmit with valid form data', () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe', name: 'name' },
    });
    fireEvent.change(screen.getByLabelText('Delivery Address'), {
      target: { value: '123 Main Street, Springfield', name: 'address' },
    });
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+1234567890', name: 'phone' },
    });

    fireEvent.click(screen.getByText('Place Order'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      address: '123 Main Street, Springfield',
      phone: '+1234567890',
    });
  });

  it('does not call onSubmit with invalid form data', () => {
    renderForm();

    fireEvent.click(screen.getByText('Place Order'));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
