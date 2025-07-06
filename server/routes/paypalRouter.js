const express = require('express');
const Order = require('../models/Order');
const BillingInfo = require('../models/BillingInfo');
const authMiddleware = require('../middlewares/authMiddleware');
const fetch = require('node-fetch'); // or axios
const router = express.Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // For Sandbox

// Function to generate PayPal access token
async function generateAccessToken() {
    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
        const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Failed to generate access token:', error);
        throw error;
    }
}

// Route to create a PayPal order
router.post('/api/paypal/create-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const accessToken = await generateAccessToken();

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency || 'USD',
                        value: amount || '1.00', // Example amount
                    },
                }],
            }),
        });

        const order = await response.json();
        res.json(order);
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Route to capture a PayPal order
router.post('/api/paypal/capture-order', authMiddleware, async (req, res) => {
    const { orderID, items, total } = req.body;
    const userId = req.user._id;
    try {
        const accessToken = await generateAccessToken();
        const url = `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // const capture = await response.json();
        // res.json(capture);
        const paypalCaptureData = await response.json();
        if (!response.ok) {
            console.error("PayPal Capture API returned an error status:", response.status, paypalCaptureData);
            return res.status(response.status).json({
                error: "PayPal API capture failed",
                details: paypalCaptureData
            })
        }
        let savedBillingInfo;
        const payer = paypalCaptureData.payer;
        const shippingAddress = paypalCaptureData.purchase_units?.[0]?.shipping?.address;
        const shippingFullName = paypalCaptureData.purchase_units?.[0]?.shipping?.name?.full_name;

        let billing = await BillingInfo.findOne({ user: userId });

        // Populate billingInfo data from PayPal's response
        const newBillingData = {
            name: shippingFullName || (payer?.name?.given_name + ' ' + payer?.name?.surname),
            email: payer?.email_address,
            address: shippingAddress?.address_line_1,
            city: shippingAddress?.admin_area_2,
            state: shippingAddress?.admin_area_1,
            zipCode: shippingAddress?.postal_code,
            country: shippingAddress?.country_code,
        };

        if (billing) {
            // Update existing billing info with the latest from PayPal
            await BillingInfo.updateOne({ user: userId }, newBillingData);
            savedBillingInfo = await BillingInfo.findOne({ user: userId });
        } else {
            // Create new billing info
            const newBilling = new BillingInfo({ user: userId, ...newBillingData });
            savedBillingInfo = await newBilling.save();
        }

        // 2. Create the Order
        const order = new Order({
            orderId: orderID,
            user: userId,
            items: items.map(item => ({
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                productImage: item.productImage,
            })),
            totalAmount: total,
            paymentMethod: 'PayPal',
            paymentStatus: paypalCaptureData.status,
            paypalTransactionId: paypalCaptureData.id,
            billingInfoRef: savedBillingInfo._id
        });
        await order.save();

        res.status(200).json({
            message: 'PayPal payment captured and order saved successfully',
            order: order,
            paypalCaptureData: paypalCaptureData
        });

    } catch (error) {
        console.error("Failed to capture PayPal order or save to DB:", error.response ? error.response.data : error.message);
        res.status(500).json({
            error: "Failed to capture PayPal order or save order to database",
            details: error.response ? error.response.data : error.message
        });
    }
});

module.exports = router;