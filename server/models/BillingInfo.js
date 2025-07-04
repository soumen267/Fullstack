const mongoose = require('mongoose');

const billingInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
});

module.exports = mongoose.model('BillingInfo', billingInfoSchema);