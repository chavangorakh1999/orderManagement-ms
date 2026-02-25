const mongoose = require('mongoose');
const { generateMenuId } = require('../utils/generateId');

const VALID_CATEGORIES = ['Pizza', 'Burger', 'Pasta', 'Salad', 'Appetizer', 'Dessert', 'Beverage'];

const menuItemSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, default: generateMenuId },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true, enum: VALID_CATEGORIES },
    available: { type: Boolean, default: true },
  },
  {
    id: false,
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
