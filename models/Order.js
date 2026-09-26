const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        price: Number,
      },
    ],

    shippingAddress: {
      name: String,
      fullName: String,
      phone: String,
      email: String,
      address: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },

    totalAmount: Number,

    paymentMethod: {
      type: String,
      enum: ['cod', 'online', 'COD', 'Online'],
      default: 'cod',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Delivered',
        'Cancelled',
        'Returned',
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'Pending',
    },

    trackingNumber: {
      type: String,
      default: null,
    },

    cancelReason: {
      type: String,
      default: null,
    },

    returnReason: {
      type: String,
      default: null,
    },

    couponCode: {
      type: String,
      default: null,
    },

    discount: {
      type: Number,
      default: 0,
    },

    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);