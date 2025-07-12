import React, { useRef } from 'react';
import { PayPalScriptProvider, PayPalButtons as SDKPayPalButtons } from '@paypal/react-paypal-js';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PayPalButton = ({ total, cartItems, billingInfo, validateBillingInfo, onReady }) => {
  const isReady = useRef(false);
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const initialOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: 'USD',
    components: 'buttons',
    'disable-funding': 'credit,card'
  };

  const InnerPayPalButtons = () => {
    return (
      <SDKPayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
        onInit={() => {
          if (!isReady.current && typeof onReady === 'function') {
            isReady.current = true;
            onReady(); // ✅ Notify parent
          }
        }}
        createOrder={(data, actions) => {
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
            .then(res => res.data.id)
            .catch(error => {
              toast.error('Failed to create PayPal order.');
              throw actions.reject(error);
            });
        }}
        onApprove={(data, actions) => {
          return api.post('/api/paypal/capture-order', {
            orderID: data.orderID,
            billingInfo,
            items: cartItems.map(item => ({
              productName: item.title,
              quantity: item.quantity,
              price: item.price,
              productImage: item.images?.[0] || 'placeholder.jpg',
            })),
            total: total.toFixed(2)
          }, { withCredentials: true })
            .then(res => {
              toast.success('Payment successful via PayPal!');
              clearCart();
              navigate('/order-success');
            })
            .catch(error => {
              toast.error('Payment capture failed via PayPal.');
            });
        }}
        onCancel={() => toast.info('PayPal payment cancelled.')}
        onError={(err) => {
          console.error('PayPal Error:', err);
          toast.error('An error occurred with PayPal.');
        }}
      />
    );
  };

  if (total > 0) {
    return (
      <PayPalScriptProvider options={initialOptions}>
        <div className="w-full h-14 flex items-center justify-center">
          <InnerPayPalButtons />
        </div>
      </PayPalScriptProvider>
    );
  }

  return null;
};

export default PayPalButton;