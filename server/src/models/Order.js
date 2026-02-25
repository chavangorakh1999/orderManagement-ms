const mongoose = require('mongoose');

const ORDER_STATUSES = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
};

const STATUS_TRANSITIONS = {
  [ORDER_STATUSES.RECEIVED]: [ORDER_STATUSES.PREPARING],
  [ORDER_STATUSES.PREPARING]: [ORDER_STATUSES.OUT_FOR_DELIVERY],
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.DELIVERED]: [],
};

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],
    customer: customerSchema,
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUSES),
      default: ORDER_STATUSES.RECEIVED,
    },
    totalAmount: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.STATUS_TRANSITIONS = STATUS_TRANSITIONS;
