// models/Wishlist.js
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: String,
      title: String,
      price: Number,
      image: String,
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);