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
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);