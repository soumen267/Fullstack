import React from 'react';
// Import the components from the library
import { PayPalScriptProvider, PayPalButtons as SDKPayPalButtons } from '@paypal/react-paypal-js';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PayPalButton = ({ total, cartItems, billingInfo, validateBillingInfo }) => {
    const navigate = useNavigate();
    const { clearCart } = useCart();

    // PayPal SDK options. Ensure REACT_APP_PAYPAL_CLIENT_ID is correct and available.
    const initialOptions = {
        clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
        currency: 'USD',
        components: 'buttons',
        'disable-funding': 'credit,card'
    };

    // This is a nested component that uses the SDK's PayPalButtons
    const InnerPayPalButtons = () => {
        return (
            <SDKPayPalButtons
                // Optional: Customize button style here
                style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                createOrder={(data, actions) => {
                    // if (!validateBillingInfo()) {
                    //     toast.error("Please fill in all required billing information before proceeding with PayPal.");
                    //     // Importantly, return actions.reject() if validation fails to stop the PayPal flow
                    //     return actions.reject();
                    // }

                    return api.post('/api/paypal/create-order', {
                        amount: total.toFixed(2),
                        currency: 'USD',
                        items: cartItems.map(item => ({
                            name: item.title,
                            quantity: item.quantity,
                            unit_amount: {
                                currency_code: 'USD',
                                value: item.price.toFixed(2)
                            }
                        }))
                    }, { withCredentials: true })
                    .then(res => {
                        // IMPORTANT: Log the response from your backend
                        console.log("Backend create-order response:", res.data);
                        // Ensure res.data.id is actually the order ID from PayPal
                        return res.data.id;
                    })
                    .catch(error => {
                        console.error('Error creating PayPal order:', error.response ? error.response.data : error.message);
                        toast.error('Failed to create PayPal order. Please try again.');
                        // Throw actions.reject to signal error to PayPal
                        throw actions.reject(error);
                    });
                }}
                onApprove={(data, actions) => {
                    return api.post('/api/paypal/capture-order', {
                        orderID: data.orderID,
                        billingInfo: billingInfo,
                        items: cartItems.map(item => ({
                            productName: item.title,
                            quantity: item.quantity,
                            price: item.price,
                            productImage: item.images?.[0] || 'placeholder.jpg',
                        })),
                        total: total.toFixed(2)
                    }, { withCredentials: true })
                    .then(res => {
                        console.log('PayPal payment captured:', res.data);
                        toast.success('Payment successful via PayPal!');
                        clearCart();
                        navigate('/order-success');
                    })
                    .catch(error => {
                        console.error('Error capturing PayPal payment:', error.response ? error.response.data : error.message);
                        toast.error('Payment capture failed via PayPal. Please try again.');
                    });
                }}
                onCancel={(data) => {
                    toast.info('PayPal payment cancelled.');
                    console.log('PayPal payment cancelled:', data);
                }}
                onError={(err) => {
                    toast.error('An error occurred with PayPal payment.');
                    console.error('PayPal onError:', err);
                }}
            />
        );
    };

    // Conditionally render the PayPal components only when needed
    // For example, if PayPal is the selected payment method and total > 0
    if (total > 0 /* && some_payment_method_is_paypal_prop */) {
        return (
            <PayPalScriptProvider options={initialOptions}>
                <InnerPayPalButtons />
            </PayPalScriptProvider>
        );
    }

    return null; // Render nothing if conditions are not met
};

export default PayPalButton;