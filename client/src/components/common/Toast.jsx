import { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div
      className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${bgColor} ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Toast;
