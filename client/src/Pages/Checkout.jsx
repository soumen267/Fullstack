import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStatus from '../hooks/useAuthStatus';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../api';
import PayPalButton from '../components/PayPalButton';
import BraintreeGooglePayButton from '../components/BraintreeGooglePayButton';
import LocationDropdown from '../components/LocationDropdown';
import useDebounce from '../hooks/useDebounce';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';

const stripeKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

const CheckoutPage = () => {
  useAuthStatus();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [clientSecret, setClientSecret] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);
  const stripePaymentRef = useRef(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', address: '', city: '', zip: '', country: 'US', state: ''
  });

  const [errors, setErrors] = useState({});
  const debouncedFormData = useDebounce(formData, 500);
  const [customOrderId, setCustomOrderId] = useState('');
  
  const calculateSubtotal = () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 0;
  const taxRate = 0.08;
  const taxAmount = calculateSubtotal() * taxRate;
  const total = calculateSubtotal() + shippingCost + taxAmount;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateBillingInfo = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.country) newErrors.country = 'Please select your country';
    if (!formData.state) newErrors.state = 'Please select your state';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zip || !/^\d{5}$/.test(formData.zip)) newErrors.zip = 'Valid 5-digit ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isBillingInfoValid = () =>
    formData.name &&
    formData.email && /\S+@\S+\.\S+/.test(formData.email) &&
    formData.address && formData.country &&
    formData.state && formData.city &&
    formData.zip && /^\d{5}$/.test(formData.zip);

  useEffect(() => {
    const fetchClientSecret = async () => {
      if (
        paymentMethod !== 'card' ||
        total <= 0 || cartItems.length === 0 ||
        clientSecret || !debouncedFormData.email ||
        !debouncedFormData.name
      ) return;

      setStripeLoading(true);
      try {
        const res = await api.post('/create-payment-intent', {
          totalAmount: total,
          items: cartItems.map(item => ({
            productName: item.title, quantity: item.quantity, price: item.price, productImage: item.images?.[0] || 'placeholder.jpg'
          })),
          billingInfo: {
            ...debouncedFormData,
            address2: debouncedFormData.address2 || ''
          },
          payerEmail: debouncedFormData.email,
          payerName: debouncedFormData.name,
        }, { withCredentials: true });

        if (res.data.clientSecret) {
          setClientSecret(res.data.clientSecret);
          setCustomOrderId(res.data.orderId);
        } else {
          toast.error(`Stripe error: ${res.data.error}`);
        }
      } catch (error) {
        console.error('Stripe error:', error);
        toast.error('Failed to initialize payment.');
      } finally {
        setStripeLoading(false);
      }
    };

    fetchClientSecret();
  }, [paymentMethod, total, cartItems, debouncedFormData, clientSecret]);

  const handleStripePaymentSuccess = async (paymentIntent, customOrderId) => {
    try {
      const res = await api.post('/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          stripePaymentIntentId: paymentIntent.id,
          totalAmount: total,
          items: cartItems.map(item => ({
            productName: item.title, quantity: item.quantity, price: item.price, productImage: item.images?.[0] || 'placeholder.jpg'
          })),
          shippingAddress: { ...formData },
          payerEmail: formData.email,
          payerName: formData.name,
          customOrderId
        })
      });
      const result = await res.json();
      console.log("Response Status:", res.status);
      console.log("Response JSON:", result);
      if (res.ok) {
        toast.success('Order saved!');
        clearCart();
        setSuccessOrderId(customOrderId);
        setOrderSuccess(true);
      } else {
        console.error('Order Save Error:', result);
        toast.error(result.error || 'Order saving failed.');
      }
    } catch (err) {
      console.error('Save Order Error:', err);
      toast.error('Something went wrong while saving the order.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBillingInfo()) {
      console.log("⛔ Billing info invalid:", formData);
      toast.error('Please complete billing information.');
      return;
    }

    if (total === 0) {
      try {
        await api.post('/checkout-free-order', {
          billingInfo: formData,
          payment: { method: 'free' },
          items: cartItems.map(item => ({
            productName: item.title, quantity: item.quantity, price: item.price, productImage: item.images?.[0]
          })),
          total: total.toFixed(2),
        }, { withCredentials: true });

        toast.success('Free order placed!');
        clearCart();
        navigate('/');
      } catch (err) {
        toast.error('Free order failed.');
      }
      return;
    }

    if (paymentMethod === 'paypal' || paymentMethod === 'gpay') {
      toast.info(`Please complete the payment using ${paymentMethod.toUpperCase()} button.`);
      return;
    }

    if (paymentMethod === 'card') {
      if (stripePaymentRef.current) {
        stripePaymentRef.current.triggerSubmit(); // ✅ Trigger the payment
      } else {
        toast.error('Stripe form not ready.');
      }
    }
  };

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      labels: 'floating'
    },
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6 mt-4 md:mt-6 lg:mt-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl grid md:grid-cols-2 gap-8 p-6 md:p-10">
        {/* Billing Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Billing Information</h2>

          {['name', 'email', 'address'].map((field) => (
            <div key={field}>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field[0].toUpperCase() + field.slice(1).replace('address', 'Address')}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
            </div>
          ))}

          <LocationDropdown formData={formData} setFormData={setFormData} />          

          <div className="grid grid-cols-2 gap-4">
            <input name="zip" value={formData.zip} onChange={handleChange} placeholder="ZIP Code" className="w-full border p-3 rounded-xl" />
          </div>
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          {errors.zip && <p className="text-sm text-red-500">{errors.zip}</p>}

          {/* Payment Selection */}
          <h3 className="pt-6 text-lg font-semibold">Select Payment Method</h3>
          <div className="flex gap-3">
            {['card', 'paypal', 'gpay'].map((method) => (
              <button key={method} type="button" onClick={() => setPaymentMethod(method)}
                className={`flex-1 border rounded-xl py-2 px-4 text-sm transition ${
                  paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}>
                {method === 'card' ? '💳 Card' : method === 'paypal' ? '🅿️ PayPal' : '🟢 GPay'}
              </button>
            ))}
          </div>

          {/* Stripe */}
          {paymentMethod === 'card' && total > 0 && (
            stripeLoading ? (
              <div className="text-center mt-4 text-gray-600">Loading card form...</div>
            ) : clientSecret ? (
              <Elements options={stripeOptions} stripe={stripePromise}>
                <StripePayment totalAmount={total} clientSecret={clientSecret} onPaymentSuccess={handleStripePaymentSuccess} billingInfo={formData} ref={stripePaymentRef} customOrderId={customOrderId} />
              </Elements>
            ) : (
              <div className="text-center mt-4 text-red-600">Complete billing info to load payment form.</div>
            )
          )}

          {/* PayPal */}
          {paymentMethod === 'paypal' && total > 0 && (
            <div className="mt-4">
              <PayPalButton total={total} cartItems={cartItems} billingInfo={formData} validateBillingInfo={validateBillingInfo} />
            </div>
          )}

          {/* GPay */}
          {paymentMethod === 'gpay' && total > 0 && (
            <div className="mt-4">
              <BraintreeGooglePayButton total={total} cartItems={cartItems} billingInfo={formData} />
            </div>
          )}

          {/* Submit */}
          {(paymentMethod === 'card' || total === 0) && (
            <button
              type="submit"
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
              disabled={
                stripeLoading ||
                (paymentMethod === 'card' && (!clientSecret || total === 0)) ||
                (total === 0 && !isBillingInfoValid())
              }
            >
              {stripeLoading ? 'Loading Payment...' : (total === 0 ? 'Place Free Order' : 'Place Order')}
            </button>
          )}
        </form>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 text-gray-700 max-h-64 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-3">
                  <img src={item.images?.[0] || 'placeholder.jpg'} alt={item.title} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-gray-700">
            <div className="flex justify-between"><span>Subtotal</span><span>${calculateSubtotal().toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span>${shippingCost.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>Tax</span><span>${taxAmount.toFixed(2)}</span></div>
            <hr className="my-4" />
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      {orderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">🎉 Order Successful!</h2>
            <p className="text-gray-700 mb-2">Your order has been placed successfully.</p>
            <p className="text-gray-800 font-semibold">Order ID: <span className="text-blue-600">{successOrderId}</span></p>
            <button
              onClick={() => {
                setOrderSuccess(false);
                navigate('/');
              }}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
            >
              Continue to Homepage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;