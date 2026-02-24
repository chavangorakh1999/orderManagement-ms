import { render, screen } from '@testing-library/react';
import OrderStatusTracker from '../../components/order/OrderStatusTracker';

describe('OrderStatusTracker', () => {
  it('renders all four status steps', () => {
    render(<OrderStatusTracker currentStatus="received" />);

    expect(screen.getByText('Order Received')).toBeInTheDocument();
    expect(screen.getByText('Preparing')).toBeInTheDocument();
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('shows "In progress..." for the active step', () => {
    render(<OrderStatusTracker currentStatus="preparing" />);

    expect(screen.getByText('In progress...')).toBeInTheDocument();
  });

  it('shows check mark for completed steps', () => {
    render(<OrderStatusTracker currentStatus="out_for_delivery" />);

    const checkMarks = screen.getAllByText('✓');
    expect(checkMarks).toHaveLength(2);
  });

  it('shows all steps completed when status is delivered', () => {
    render(<OrderStatusTracker currentStatus="delivered" />);

    // All 4 steps completed — none should be active/pulsing
    const checkMarks = screen.getAllByText('✓');
    expect(checkMarks).toHaveLength(4);
    expect(screen.queryByText('In progress...')).not.toBeInTheDocument();
  });

  it('shows Order Status heading', () => {
    render(<OrderStatusTracker currentStatus="received" />);
    expect(screen.getByText('Order Status')).toBeInTheDocument();
  });
});
