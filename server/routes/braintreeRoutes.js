// server/routes/braintree.js
const express = require('express');
const router = express.Router();
const braintree = require('braintree');
const authMiddleware = require('../middlewares/authMiddleware');
const Order = require('../models/Order'); // Your Mongoose Order model
const BillingInfo = require('../models/BillingInfo'); // Your Mongoose BillingInfo model
const crypto = require('crypto'); // For dummy Order IDs if not using Braintree IDs

// Initialize Braintree Gateway
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment[process.env.BRAINTREE_ENVIRONMENT], // Sandbox
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Endpoint to generate client token for frontend
router.get('/api/braintree/client-token', authMiddleware, async (req, res) => {
    try {
        const response = await gateway.clientToken.generate({});
        res.json({ clientToken: response.clientToken });
    } catch (err) {
        console.error('Error generating Braintree client token:', err);
        res.status(500).json({ error: 'Failed to generate client token' });
    }
});

// Endpoint to process Google Pay payment (after nonce is received)
router.post('/api/braintree/process-google-pay', authMiddleware, async (req, res) => {
    const { paymentMethodNonce, totalAmount, items, shippingAddress, payerEmail, payerName } = req.body; // Extract data sent from frontend
    const userId = req.user._id;

    try {
        // Create a sale transaction
        const result = await gateway.transaction.sale({
            amount: totalAmount.toFixed(2), // Ensure amount is in correct format (e.g., "10.00")
            paymentMethodNonce: paymentMethodNonce,
            options: {
                submitForSettlement: true // Set to true for a real transaction, false for testing "authorization"
            },
            // Optionally, pass customer details and shipping
            customer: {
                firstName: payerName ? payerName.split(' ')[0] : 'Guest',
                lastName: payerName ? payerName.split(' ').slice(1).join(' ') : 'User',
                email: payerEmail
            },
            shipping: shippingAddress ? {
                firstName: shippingAddress.recipient ? shippingAddress.recipient.split(' ')[0] : 'Guest',
                lastName: shippingAddress.recipient ? shippingAddress.recipient.split(' ').slice(1).join(' ') : 'User',
                streetAddress: shippingAddress.address_line1,
                extendedAddress: shippingAddress.address_line2 || '',
                locality: shippingAddress.locality, // City
                region: shippingAddress.administrative_area, // State
                postalCode: shippingAddress.postal_code,
                countryCodeAlpha2: shippingAddress.country_code
            } : undefined,
            // Custom fields
            customFields: {
                userId: userId.toString(),
                items_summary: JSON.stringify(items.map(i => ({ name: i.productName, qty: i.quantity }))),
            }
        });

        if (result.success) {
            console.log('Braintree Google Pay Transaction successful:', result.transaction);

            // --- Start Database Saving Logic ---
            let savedBillingInfo;
            let billing = await BillingInfo.findOne({ user: userId });

            const newBillingData = {
                name: payerName,
                email: payerEmail,
                address: shippingAddress?.address_line1,
                city: shippingAddress?.locality,
                state: shippingAddress?.administrative_area,
                zipCode: shippingAddress?.postal_code,
                country: shippingAddress?.country_code,
            };

            if (billing) {
                await BillingInfo.updateOne({ user: userId }, newBillingData);
                savedBillingInfo = await BillingInfo.findOne({ user: userId });
            } else {
                const newBilling = new BillingInfo({ user: userId, ...newBillingData });
                savedBillingInfo = await newBilling.save();
            }

            const order = new Order({
                orderId: result.transaction.id, // Use Braintree transaction ID as your order ID
                user: userId,
                items: items.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    productImage: item.productImage,
                })),
                totalAmount: totalAmount,
                paymentMethod: 'Google Pay (Braintree)',
                paymentStatus: result.transaction.status, // e.g., 'submitted_for_settlement'
                transactionId: result.transaction.id,
                billingInfoRef: savedBillingInfo._id
            });
            await order.save();
            // --- End Database Saving Logic ---

            res.json({ success: true, message: 'Google Pay payment successful and order saved!', order, transaction: result.transaction });
        } else {
            console.error('Braintree Google Pay Transaction failed:', result.message);
            res.status(400).json({ success: false, message: result.message, errors: result.errors });
        }

    } catch (error) {
        console.error('Error processing Braintree Google Pay transaction:', error);
        res.status(500).json({ success: false, message: 'Failed to process Google Pay payment via Braintree.', error: error.message });
    }
});

module.exports = router;