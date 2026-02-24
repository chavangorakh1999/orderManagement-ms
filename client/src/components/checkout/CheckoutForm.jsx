import { useState } from 'react';
import FormField from './FormField';
import { validateCheckoutForm, validateName, validatePhone, validateAddress } from '../../utils/validators';

const CheckoutForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const validator = { name: validateName, address: validateAddress, phone: validatePhone }[name];
      const error = validator(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validator = { name: validateName, address: validateAddress, phone: validatePhone }[name];
    const error = validator(value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateCheckoutForm(formData);

    setTouched({ name: true, address: true, phone: true });
    setErrors(validationErrors);

    if (isValid) {
      onSubmit(formData);
    }
  };

  const { isValid } = validateCheckoutForm(formData);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h3>

      <FormField
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name ? errors.name : ''}
        placeholder="John Doe"
      />

      <FormField
        label="Delivery Address"
        name="address"
        type="textarea"
        value={formData.address}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.address ? errors.address : ''}
        placeholder="123 Main Street, Apt 4B, Springfield"
      />

      <FormField
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.phone ? errors.phone : ''}
        placeholder="+1234567890"
      />

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors mt-2 cursor-pointer"
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
};

export default CheckoutForm;
