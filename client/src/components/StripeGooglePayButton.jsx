import React, { useEffect, useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentRequestButtonElement
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import api from '../api';

const StripeGooglePayButton = ({ total, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [buttonReady, setButtonReady] = useState(false);
  const [fallbackGPayReady, setFallbackGPayReady] = useState(false);

  useEffect(() => {
    if (!stripe || total <= 0) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Total',
        amount: Math.round(total * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
      supportedPaymentMethods: [
        {
          supportedMethods: 'card',
        },
        {
          supportedMethods: 'google_pay',
          data: {
            environment: 'TEST',
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: ['CARD', 'TOKENIZED_CARD'],
            paymentMethodTokenizationParameters: {
              tokenizationType: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'stripe',
                'stripe:version': '2020-08-27',
                'stripe:publishableKey': process.env.REACT_APP_STRIPE_PUBLIC_KEY,
              },
            },
            merchantInfo: {
              merchantId: '12345678901234567890', // optional in test
              merchantName: 'Test Merchant',
            },
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          },
        },
      ],
    });


    pr.canMakePayment().then(result => {
      console.log('Google Pay canMakePayment result:', result);
      if (result) {
        setPaymentRequest(pr);
        setButtonReady(true);
      } else {
        setupRawGooglePay(); // fallback to native GPay JS
      }
    });

    pr.on('paymentmethod', async e => {
      try {
        const { paymentMethod } = e;

        const res = await api.post('/api/stripe/process-payment', {
          payment_method_id: paymentMethod.id,
          totalAmount: total,
          items: cartItems.map(item => ({
            productName: item.title,
            quantity: item.quantity,
            price: item.price,
            productImage: item.images?.[0] || '',
          })),
          shippingAddress: e.shippingAddress,
          payerEmail: e.payerEmail,
          payerName: e.payerName,
        }, { withCredentials: true });

        if (res.data.success) {
          e.complete('success');
          toast.success('Payment successful!');
          clearCart();
        } else {
          e.complete('fail');
          toast.error(res.data.message || 'Payment failed.');
        }
      } catch (err) {
        console.error(err);
        e.complete('fail');
        toast.error('Payment error occurred.');
      }
    });

    setPaymentRequest(pr);
  }, [stripe, total]);

  // ✅ Raw Google Pay fallback
  const setupRawGooglePay = () => {
    if (!window.google) return;

    const paymentsClient = new window.google.payments.api.PaymentsClient({ environment: 'TEST' });

    const request = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example', // 🔁 Replace 'example' with 'stripe' or 'braintree' for real usage
            gatewayMerchantId: 'test_gateway_merchant_id',
          }
        }
      }],
      merchantInfo: {
        merchantName: 'My Shop'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: total.toFixed(2),
        currencyCode: 'USD',
        countryCode: 'US',
      }
    };

    paymentsClient.isReadyToPay(request).then(res => {
      if (res.result) {
        const button = paymentsClient.createButton({
          onClick: () => {
            paymentsClient.loadPaymentData(request).then(paymentData => {
              const token = paymentData.paymentMethodData.tokenizationData.token;
              console.log('💳 Google Pay Token:', token);
              toast.success('Google Pay token received. You need to send it to backend.');
              // ✅ Send `token` to backend to process with Stripe/Braintree/custom processor
            }).catch(err => {
              console.error('Google Pay loadPaymentData error:', err);
              toast.error('Google Pay payment failed.');
            });
          }
        });
        const container = document.getElementById('gpay-fallback');
        if (container) container.appendChild(button);
        setFallbackGPayReady(true);
      } else {
        toast.error('Google Pay not supported.');
      }
    });
  };

  // 👇 Load Google Pay SDK for fallback
  useEffect(() => {
    if (!window.google && !document.getElementById('gpay-sdk')) {
      const script = document.createElement('script');
      script.id = 'gpay-sdk';
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = () => console.log('Google Pay JS SDK loaded');
      document.head.appendChild(script);
    }
  }, []);

  if (!stripe || !elements) {
    return <div>Loading Google Pay...</div>;
  }

  if (buttonReady) {
    return (
      <div className="mt-2.5 max-w-xs">
        <PaymentRequestButtonElement
          options={{ paymentRequest }}
          className="PaymentRequestButton"
        />
      </div>
    );
  }

  return (
    <div>
      {/* <p className="text-sm text-gray-600 mb-2">Stripe Google Pay not supported in this browser. Trying fallback…</p> */}
      <div id="gpay-fallback" className="max-w-xs mt-2.5" />
      {!fallbackGPayReady && (
        <div className="text-xs text-gray-500">Checking Google Pay availability...</div>
      )}
    </div>
  );
};

export default StripeGooglePayButton;