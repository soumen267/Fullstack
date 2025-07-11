const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productName: String,
      quantity: Number,
      price: Number,
      productImage: String,
    },
  ],
  totalAmount: Number,
  paymentMethod: String,
  paymentStatus: String,
  transactionId: String,
  stripePaymentIntentId: String,
  billingInfoRef: { type: mongoose.Schema.Types.ObjectId, ref: 'BillingInfo' },
  shippingAddress: {
    address_line1: String,
    address_line2: String,
    locality: String,
    administrative_area: String,
    postal_code: String,
    country_code: String,
    recipient: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);