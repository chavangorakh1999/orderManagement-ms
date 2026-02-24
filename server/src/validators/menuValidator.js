const { z } = require('zod');

const MENU_CATEGORIES = [
  'Pizza',
  'Burger',
  'Pasta',
  'Salad',
  'Beverage',
  'Dessert',
  'Appetizer',
  'Main Course',
];

const createMenuItemSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be at most 500 characters'),
  price: z
    .number({ required_error: 'Price is required' })
    .positive('Price must be a positive number')
    .max(9999.99, 'Price must be at most 9999.99'),
  image: z
    .string({ required_error: 'Image URL is required' })
    .min(1, 'Image URL is required'),
  category: z.enum(MENU_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${MENU_CATEGORIES.join(', ')}` }),
  }),
  available: z.boolean().optional().default(true),
});

const updateMenuItemSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  price: z.number().positive().max(9999.99).optional(),
  image: z.string().min(1).optional(),
  category: z.enum(MENU_CATEGORIES).optional(),
  available: z.boolean().optional(),
});

module.exports = {
  createMenuItemSchema,
  updateMenuItemSchema,
  MENU_CATEGORIES,
};
