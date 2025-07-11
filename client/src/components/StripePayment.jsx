import React, { useImperativeHandle, forwardRef, useState } from 'react';
import {useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement} from '@stripe/react-stripe-js';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';

const StripePayment = forwardRef(({ totalAmount, clientSecret, onPaymentSuccess, billingInfo, customOrderId }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardBrand, setCardBrand] = useState('');
  const [cardErrors, setCardErrors] = useState({
    number: '',
    expiry: '',
    cvc: ''
  });

  useImperativeHandle(ref, () => ({
    async triggerSubmit() {
      if (!stripe || !elements) return;

      setIsLoading(true);

      const cardElement = elements.getElement(CardNumberElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingInfo.name,
            email: billingInfo.email,
            address: {
              line1: billingInfo.address,
              city: billingInfo.city,
              state: billingInfo.state,
              postal_code: billingInfo.zipCode,
              country: billingInfo.country
            }
          }
        }
      });

      if (error) {
        if (error.code === 'card_declined') {
          toast.error("Your card was declined. Please try another payment method.");
        } else {
          toast.error(error.message || "Payment failed. Please try again.");
        }
      } else if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent, customOrderId); // ✅ THIS TRIGGERS YOUR MODAL
      }

      setIsLoading(false);
    }
  }));

  const stripeStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#fa755a' },
    }
  };

  const getCardIcon = () => {
    switch (cardBrand) {
      case 'visa':
        return <FaCcVisa className="text-blue-600 text-xl" />;
      case 'mastercard':
        return <FaCcMastercard className="text-red-600 text-xl" />;
      case 'amex':
        return <FaCcAmex className="text-indigo-600 text-xl" />;
      default:
        return <FaCreditCard className="text-gray-400 text-xl" />;
    }
  };

  return (
    <div className="space-y-4 mt-4 relative">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
        <div className="flex items-center border rounded-xl p-3 bg-white shadow-sm">
          <CardNumberElement
            options={stripeStyle}
            onChange={(e) => {
              setCardErrors(prev => ({ ...prev, number: e.error?.message || '' }));
              setCardBrand(e.brand || '');
            }}
            className="flex-1"
          />
          <span className="ml-2">{getCardIcon()}</span>
        </div>
        {cardErrors.number && <p className="text-sm text-red-500 mt-1">{cardErrors.number}</p>}
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <div className="p-3 border rounded-xl bg-white shadow-sm">
            <CardExpiryElement
              options={stripeStyle}
              onChange={(e) => setCardErrors(prev => ({ ...prev, expiry: e.error?.message || '' }))}
            />
          </div>
          {cardErrors.expiry && <p className="text-sm text-red-500 mt-1">{cardErrors.expiry}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
          <div className="p-3 border rounded-xl bg-white shadow-sm">
            <CardCvcElement
              options={stripeStyle}
              onChange={(e) => setCardErrors(prev => ({ ...prev, cvc: e.error?.message || '' }))}
            />
          </div>
          {cardErrors.cvc && <p className="text-sm text-red-500 mt-1">{cardErrors.cvc}</p>}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
          <div className="animate-spin w-6 h-6 border-t-2 border-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
});

export default StripePayment;