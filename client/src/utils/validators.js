export const validateName = (name) => {
  if (!name || name.trim().length === 0) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 100) return 'Name must be at most 100 characters';
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim().length === 0) return 'Phone number is required';
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phoneRegex.test(phone.trim())) return 'Invalid phone format (e.g., +1234567890)';
  return '';
};

export const validateAddress = (address) => {
  if (!address || address.trim().length === 0) return 'Address is required';
  if (address.trim().length < 5) return 'Address must be at least 5 characters';
  if (address.trim().length > 300) return 'Address must be at most 300 characters';
  return '';
};

export const validateCheckoutForm = ({ name, address, phone }) => {
  const errors = {};
  const nameError = validateName(name);
  const addressError = validateAddress(address);
  const phoneError = validatePhone(phone);

  if (nameError) errors.name = nameError;
  if (addressError) errors.address = addressError;
  if (phoneError) errors.phone = phoneError;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
