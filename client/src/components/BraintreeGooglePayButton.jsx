// src/components/BraintreeGooglePayButton.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import braintree from 'braintree-web';

const BraintreeGooglePayButton = ({ total, cartItems, billingInfo }) => {
  // const navigate = useNavigate();
  const { clearCart } = useCart();
  const [clientToken, setClientToken] = useState(null);
  const [googlePayInstance, setGooglePayInstance] = useState(null);
  const [isButtonReady, setIsButtonReady] = useState(false);
  

  // 1. Fetch Braintree token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await api.get('/api/braintree/client-token', {
          withCredentials: true,
        });
        setClientToken(res.data.clientToken);
      } catch (err) {
        console.error('Error fetching Braintree token:', err);
        toast.error('Failed to load payment system. Please refresh.');
      }
    };
    fetchToken();
  }, []);

  // 2. Setup Google Pay
  useEffect(() => {
    if (!clientToken) return;

    const setupGooglePay = async () => {
      try {
        const clientInstance = await braintree.client.create({
          authorization: clientToken,
        });

        // ✅ Initialize Google Pay instance
        const gpInstance = await braintree.googlePayment.create({
          client: clientInstance,
          googlePayVersion: 2,
          // merchantId is only needed in PRODUCTION!
        });

        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: 'TEST', // Use 'PRODUCTION' when live
        });

        const paymentDataRequest = gpInstance.createPaymentDataRequest({
          transactionInfo: {
            currencyCode: 'USD',
            totalPriceStatus: 'FINAL',
            totalPrice: total.toFixed(2),
          },
          merchantInfo: {
            merchantName: 'My Store',
          },
        });

        const isReadyToPay = await paymentsClient.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: paymentDataRequest.allowedPaymentMethods,
        });

        if (isReadyToPay.result) {
          setGooglePayInstance(gpInstance);
          setIsButtonReady(true);
        } else {
          toast.info('Google Pay not available on this device.');
        }
      } catch (err) {
        console.error('Google Pay setup failed:', err);
        toast.error('Failed to setup Google Pay. Try again later.');
      }
    };

    setupGooglePay();
  }, [clientToken, total]);

  // 3. Handle click
  const handleGooglePayClick = async () => {
    if (!googlePayInstance) return;

    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST',
      });

      const paymentDataRequest = googlePayInstance.createPaymentDataRequest({
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: total.toFixed(2),
          currencyCode: 'USD',
          shippingAddressRequired: false,
        },
        merchantInfo: {
          merchantName: 'My Store',
        },
      });

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      const payload = await googlePayInstance.parseResponse(paymentData);

      console.log('Nonce:', payload.nonce);

      const res = await api.post('/api/braintree/process-google-pay',
        {
          paymentMethodNonce: payload.nonce,
          totalAmount: total,
          items: cartItems.map(item => ({
            productName: item.title,
            quantity: item.quantity,
            price: item.price,
            productImage: item.images?.[0] || '',
          })),
          shippingAddress: payload.details.shippingAddress,
          payerEmail: payload.details.email,
          payerName: payload.details.payerName,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success('Payment successful!');
        clearCart();
        // navigate('/order-success');
      } else {
        toast.error(res.data.message || 'Payment failed.');
      }
    } catch (error) {
      console.error('Google Pay error:', error);
      if (error.statusCode === 'CANCELED') {
        toast.info('Payment canceled.');
      } else {
        toast.error('An error occurred during Google Pay checkout.');
      }
    }
  };

  if (!isButtonReady) {
    return <div>Loading Google Pay...</div>;
  }

  return (
    <button
      onClick={handleGooglePayClick}
      disabled={!isButtonReady}
      className="bg-black text-white px-5 py-2 rounded-md text-base border-none cursor-pointer flex items-center gap-2 max-w-xs mt-2.5"
    >
      <img
        src="https://www.gstatic.com/instantbuy/svg/dark_gpay.svg"
        alt="Google Pay"
        style={{ height: '24px' }}
      />
    </button>
  );
};

export default BraintreeGooglePayButton;