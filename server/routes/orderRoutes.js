const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const BillingInfo = require('../models/BillingInfo');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

const generateOrderId = () => 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { billingInfo, items, totalAmount } = req.body;

    let billing = await BillingInfo.findOne({ user: userId });
    if (billing) {
      await BillingInfo.updateOne({ user: userId }, billingInfo);
    } else {
      billing = new BillingInfo({ user: userId, ...billingInfo });
      await billing.save();
    }

    const order = new Order({ orderId: generateOrderId(), user: userId, items, totalAmount });
    await order.save();

    res.status(201).json({ message: 'Order and billing info saved successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Checkout failed' });
  }
});

module.exports = router;