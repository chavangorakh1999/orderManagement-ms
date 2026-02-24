import StatusStep from './StatusStep';

const STEPS = ['received', 'preparing', 'out_for_delivery', 'delivered'];

const OrderStatusTracker = ({ currentStatus }) => {
  const currentIndex = STEPS.indexOf(currentStatus);
  const isFinalStatus = currentIndex === STEPS.length - 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>
      <div className="space-y-0">
        {STEPS.map((step, index) => (
          <StatusStep
            key={step}
            step={step}
            isActive={index === currentIndex && !isFinalStatus}
            isCompleted={index < currentIndex || (index === currentIndex && isFinalStatus)}
            isLast={index === STEPS.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderStatusTracker;
