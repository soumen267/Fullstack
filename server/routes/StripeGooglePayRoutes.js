// server/routes/stripe.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middlewares/authMiddleware');
const Order = require('../models/Order');
const BillingInfo = require('../models/BillingInfo');

router.post('/api/stripe/process-payment', authMiddleware, async (req, res) => {
  const {
    payment_method_id, // From Stripe Elements (optional)
    google_pay_token,  // From raw GPay SDK fallback (optional)
    totalAmount,
    items,
    shippingAddress,
    payerEmail,
    payerName
  } = req.body;

  const userId = req.user._id;

  try {
    // 🔄 Construct payment method data
    let paymentIntentData = {
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      confirmation_method: 'manual',
      confirm: true,
      receipt_email: payerEmail,
      metadata: {
        userId: userId.toString(),
        items_summary: JSON.stringify(items.map(i => `${i.productName} x${i.quantity}`)),
      },
    };

    if (google_pay_token) {
      paymentIntentData.payment_method_data = {
        type: 'card',
        card: { token: google_pay_token },
        billing_details: {
          name: payerName,
          email: payerEmail,
        }
      };
    } else if (payment_method_id) {
      paymentIntentData.payment_method = payment_method_id;
    } else {
      return res.status(400).json({ success: false, message: 'No payment method provided.' });
    }

    if (shippingAddress) {
      paymentIntentData.shipping = {
        name: payerName,
        address: {
          line1: shippingAddress.addressLine1 || shippingAddress.address_line1,
          line2: shippingAddress.addressLine2 || shippingAddress.address_line2,
          city: shippingAddress.city || shippingAddress.locality,
          state: shippingAddress.state || shippingAddress.administrative_area,
          postal_code: shippingAddress.zip || shippingAddress.postal_code,
          country: shippingAddress.country || shippingAddress.country_code,
        }
      };
    }

    // ✅ Create and confirm the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    // 🧾 Save Billing Info
    const billingData = {
      name: payerName,
      email: payerEmail,
      address: shippingAddress?.addressLine1 || shippingAddress?.address_line1,
      city: shippingAddress?.city || shippingAddress?.locality,
      state: shippingAddress?.state || shippingAddress?.administrative_area,
      zipCode: shippingAddress?.zip || shippingAddress?.postal_code,
      country: shippingAddress?.country || shippingAddress?.country_code,
    };

    let savedBillingInfo = await BillingInfo.findOneAndUpdate(
      { user: userId },
      billingData,
      { new: true, upsert: true }
    );

    // 💾 Save Order
    const order = new Order({
      orderId: paymentIntent.id,
      user: userId,
      items: items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        productImage: item.productImage,
      })),
      totalAmount,
      paymentMethod: google_pay_token ? 'Google Pay (Raw SDK)' : 'Google Pay (Stripe)',
      paymentStatus: paymentIntent.status,
      transactionId: paymentIntent.id,
      billingInfoRef: savedBillingInfo._id,
    });
    await order.save();

    return res.json({
      success: true,
      message: 'Payment successful and order saved!',
      order,
      paymentIntent,
    });
  } catch (error) {
    console.error('Stripe payment processing error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed.',
    });
  }
});

module.exports = router;