const mongoose = require('mongoose');
const { generateCustomerId } = require('../utils/generateId');

const customerSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, default: generateCustomerId },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
  },
  {
    id: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
