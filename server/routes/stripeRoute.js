const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middlewares/authMiddleware');
const Order = require('../models/Order');
const BillingInfo = require('../models/BillingInfo');

const generateOrderID = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const nanoid = customAlphabet(alphabet, 8);
  return `ORDER-${nanoid()}`;
};

// CREATE PAYMENT INTENT
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  const { totalAmount, items, shippingAddress, payerEmail, payerName } = req.body;
  const userId = req.user._id;

  if (
    !totalAmount || typeof totalAmount !== 'number' || totalAmount <= 0 ||
    !items || items.length === 0
  ) {
    return res.status(400).json({ error: 'Invalid amount or items provided.' });
  }

  const isValidEmail = payerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail);
  const customOrderId = generateOrderID(); // ✅ Generate once

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      metadata: {
        userId: userId.toString(),
        order_id: customOrderId,
        items: JSON.stringify(items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          productImage: item.productImage,
        }))),
        payerEmail,
        payerName,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : '',
      },
      customer: req.user.stripeCustomerId || undefined,
      ...(isValidEmail && { receipt_email: payerEmail }),
      description: `Order by ${payerName || 'Guest'} - User ID: ${userId}`,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      orderId: customOrderId, // ✅ Return this to redirect after payment
    });
  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/save-order', authMiddleware, async (req, res) => {
  try {
    const {
      stripePaymentIntentId,
      totalAmount,
      items,
      shippingAddress,
      payerEmail,
      payerName,
    } = req.body;

    const userId = req.user._id;

    let savedBillingInfo;
    let billing = await BillingInfo.findOne({ user: userId });

    const newBillingData = {
      name: payerName,
      email: payerEmail,
      address: shippingAddress?.address || 'N/A',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      zipCode: shippingAddress?.zip || '',
      country: shippingAddress?.country || '',
    };

    if (billing) {
      await BillingInfo.updateOne({ user: userId }, newBillingData);
      savedBillingInfo = await BillingInfo.findOne({ user: userId });
    } else {
      const newBilling = new BillingInfo({ user: userId, ...newBillingData });
      savedBillingInfo = await newBilling.save();
    }

    const order = new Order({
      orderId: req.body.customOrderId,
      user: userId,
      items: items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        productImage: item.productImage,
      })),
      totalAmount,
      paymentMethod: 'Stripe',
      paymentStatus: 'succeeded',
      transactionId: stripePaymentIntentId,
      billingInfoRef: savedBillingInfo._id,
      shippingAddress: shippingAddress ? {
        address_line1: shippingAddress.address_line1,
        address_line2: shippingAddress.address_line2,
        locality: shippingAddress.locality,
        administrative_area: shippingAddress.administrative_area,
        postal_code: shippingAddress.postal_code,
        country_code: shippingAddress.country_code,
        recipient: shippingAddress.recipient,
      } : undefined,
      stripePaymentIntentId,
    });

    await order.save();

    res.status(200).json({
      message: 'Stripe payment successful and order saved',
      order,
    });
  } catch (error) {
    console.error('Failed to save Stripe order:', error);
    res.status(500).json({ error: 'Failed to save Stripe order' });
  }
});

// STRIPE WEBHOOK
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // In production, use this for security
    // event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

    // Dev mode (no signature verification)
    event = JSON.parse(payload.toString());
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const pi = event.data.object;
      console.log(`✅ PaymentIntent ${pi.id} succeeded`);

      try {
        const userId = pi.metadata.userId;
        const customOrderId = pi.metadata.order_id;
        const items = JSON.parse(pi.metadata.items);
        const payerName = pi.metadata.payerName;
        const payerEmail = pi.metadata.payerEmail;
        const shippingAddress = pi.metadata.shippingAddress ? JSON.parse(pi.metadata.shippingAddress) : null;

        const charge = pi.charges.data[0];
        const billingDetails = charge?.billing_details || {};
        const cardDetails = charge?.payment_method_details?.card || {};

        let billing = await BillingInfo.findOne({ user: userId });
        const billingData = {
          name: billingDetails.name || payerName,
          email: billingDetails.email || payerEmail,
          phone: billingDetails.phone,
          address: billingDetails.address?.line1,
          city: billingDetails.address?.city,
          state: billingDetails.address?.state,
          zipCode: billingDetails.address?.postal_code,
          country: billingDetails.address?.country,
        };

        let savedBillingInfo;
        if (billing) {
          await BillingInfo.updateOne({ user: userId }, billingData);
          savedBillingInfo = await BillingInfo.findOne({ user: userId });
        } else {
          const newBilling = new BillingInfo({ user: userId, ...billingData });
          savedBillingInfo = await newBilling.save();
        }

        const order = new Order({
          orderId: customOrderId, // ✅ Use custom order ID
          user: userId,
          items: items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            productImage: item.productImage,
          })),
          totalAmount: pi.amount / 100,
          paymentMethod: `Card (${cardDetails.brand || 'Unknown'})`,
          paymentStatus: pi.status,
          transactionId: charge ? charge.id : pi.id,
          billingInfoRef: savedBillingInfo._id,
          shippingAddress: shippingAddress ? {
            address_line1: shippingAddress.address_line1,
            address_line2: shippingAddress.address_line2,
            locality: shippingAddress.locality,
            administrative_area: shippingAddress.administrative_area,
            postal_code: shippingAddress.postal_code,
            country_code: shippingAddress.country_code,
            recipient: shippingAddress.recipient,
          } : undefined,
          stripePaymentIntentId: pi.id,
          stripeChargeId: charge?.id,
        });

        await order.save();
        console.log(`✅ Order ${order.orderId} saved to DB`);
      } catch (err) {
        console.error('❌ DB Save Error:', err);
      }

      break;

    case 'payment_intent.payment_failed':
      console.log(`❌ Payment failed: ${event.data.object.id}`);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

module.exports = router;