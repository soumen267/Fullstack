const mongoose = require('mongoose');

const billingInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String },
  city: String,
  state: String,
  zipCode: String,
  country: String,
});

module.exports = mongoose.model('BillingInfo', billingInfoSchema);