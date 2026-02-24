const { z } = require('zod');
const { ORDER_STATUSES } = require('../store/orderStore');

const orderItemSchema = z.object({
  menuItemId: z.string({ required_error: 'Menu item ID is required' }).min(1),
  name: z.string({ required_error: 'Item name is required' }).min(1),
  price: z.number({ required_error: 'Item price is required' }).positive(),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity must be at most 99'),
});

const customerSchema = z.object({
  name: z
    .string({ required_error: 'Customer name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  address: z
    .string({ required_error: 'Delivery address is required' })
    .min(5, 'Address must be at least 5 characters')
    .max(300, 'Address must be at most 300 characters'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .regex(
      /^\+?[1-9]\d{6,14}$/,
      'Phone must be a valid format (e.g., +1234567890)'
    ),
});

const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema, { required_error: 'Order items are required' })
    .min(1, 'Order must contain at least one item'),
  customer: customerSchema,
});

const allStatuses = Object.values(ORDER_STATUSES);

const updateOrderStatusSchema = z.object({
  status: z.enum(allStatuses, {
    errorMap: () => ({
      message: `Status must be one of: ${allStatuses.join(', ')}`,
    }),
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  orderItemSchema,
  customerSchema,
};
