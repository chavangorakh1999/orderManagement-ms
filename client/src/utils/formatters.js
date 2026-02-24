export const formatPrice = (price) => {
  return `₹${Number(price).toFixed(2)}`;
};

export const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString();
};

export const formatStatus = (status) => {
  const statusMap = {
    received: 'Order Received',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
  };
  return statusMap[status] || status;
};
