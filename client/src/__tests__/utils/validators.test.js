import { validateName, validatePhone, validateAddress, validateCheckoutForm } from '../../utils/validators';

describe('validators', () => {
  describe('validateName', () => {
    it('returns error for empty name', () => {
      expect(validateName('')).toBe('Name is required');
    });

    it('returns error for name too short', () => {
      expect(validateName('A')).toBe('Name must be at least 2 characters');
    });

    it('returns error for name too long', () => {
      expect(validateName('A'.repeat(101))).toBe('Name must be at most 100 characters');
    });

    it('returns empty string for valid name', () => {
      expect(validateName('John Doe')).toBe('');
    });
  });

  describe('validatePhone', () => {
    it('returns error for empty phone', () => {
      expect(validatePhone('')).toBe('Phone number is required');
    });

    it('returns error for invalid phone format', () => {
      expect(validatePhone('not-a-phone')).toBe('Invalid phone format (e.g., +1234567890)');
    });

    it('returns empty string for valid phone', () => {
      expect(validatePhone('+1234567890')).toBe('');
    });
  });

  describe('validateAddress', () => {
    it('returns error for empty address', () => {
      expect(validateAddress('')).toBe('Address is required');
    });

    it('returns error for address too short', () => {
      expect(validateAddress('AB')).toBe('Address must be at least 5 characters');
    });

    it('returns error for address too long', () => {
      expect(validateAddress('A'.repeat(301))).toBe('Address must be at most 300 characters');
    });

    it('returns empty string for valid address', () => {
      expect(validateAddress('123 Main Street, Springfield')).toBe('');
    });
  });

  describe('validateCheckoutForm', () => {
    it('returns isValid true for valid form data', () => {
      const result = validateCheckoutForm({
        name: 'John Doe',
        address: '123 Main Street',
        phone: '+1234567890',
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('returns isValid false with all field errors', () => {
      const result = validateCheckoutForm({
        name: '',
        address: '',
        phone: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.address).toBeDefined();
      expect(result.errors.phone).toBeDefined();
    });
  });
});
