import { formatStatus } from '../../utils/formatters';

const STEP_CONFIG = {
  received: { icon: '📋', color: 'orange' },
  preparing: { icon: '👨‍🍳', color: 'orange' },
  out_for_delivery: { icon: '🚗', color: 'orange' },
  delivered: { icon: '✅', color: 'green' },
};

const StatusStep = ({ step, isActive, isCompleted, isLast }) => {
  const config = STEP_CONFIG[step];

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
            isCompleted
              ? 'border-green-500 bg-green-50'
              : isActive
                ? 'border-orange-500 bg-orange-50 animate-pulse'
                : 'border-gray-200 bg-gray-50'
          }`}
        >
          {isCompleted ? '✓' : config.icon}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-12 transition-colors ${
              isCompleted ? 'bg-green-500' : 'bg-gray-200'
            }`}
          />
        )}
      </div>

      <div className="pt-2">
        <p
          className={`font-medium ${
            isActive
              ? 'text-orange-600'
              : isCompleted
                ? 'text-green-600'
                : 'text-gray-400'
          }`}
        >
          {formatStatus(step)}
        </p>
        {isActive && (
          <p className="text-sm text-gray-500 mt-0.5">In progress...</p>
        )}
      </div>
    </div>
  );
};

export default StatusStep;
