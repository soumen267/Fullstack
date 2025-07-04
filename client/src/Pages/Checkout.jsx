import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const CheckoutPage = () => {

  const navigate = useNavigate();
  useEffect(() => {
    axios.get('http://localhost:5000/auth-status', { withCredentials: true })
      .then((res) => {
        if (!res.data.isAuthenticated) {
          navigate('/');
        }
      })
      .catch(() => {
        toast.error('Please sign in to proceed to checkout!');
        navigate('/');
      });
  }, [navigate]);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const { cartItems } = useCart();

  const calculateSubtotal = () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 0;
  const taxRate = 0.08;
  const taxAmount = calculateSubtotal() * taxRate;
  const total = calculateSubtotal() + shippingCost + taxAmount;

  const [formData, setFormData] = useState({
    name: '', email: '', address: '', city: '', zip: '',
    cardName: '', cardNumber: '', expiry: '', cvv: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.country) newErrors.country = 'Please select your country';
    if (!formData.state) newErrors.state = 'Please select your state';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zip || !/^\d{5}$/.test(formData.zip)) newErrors.zip = 'Valid 5-digit ZIP code is required';

    if (paymentMethod === 'card') {
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
      if (!formData.cardNumber || !/^\d{16}$/.test(formData.cardNumber)) newErrors.cardNumber = 'Valid 16-digit card number required';
      if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) newErrors.expiry = 'Expiry must be MM/YY';
      if (!formData.cvv || !/^\d{3}$/.test(formData.cvv)) newErrors.cvv = 'Valid 3-digit CVV required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const orderPayload = {
      billingInfo: {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zip,
        country: formData.country,
      },
      // payment: {
      //   method: paymentMethod,
      //   ...(paymentMethod === 'card' && {
      //     cardName: formData.cardName,
      //     cardNumber: formData.cardNumber,
      //     expiry: formData.expiry,
      //     cvv: formData.cvv,
      //   }),
      // },
      items: cartItems.map(item => ({
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        productImage: item.image, // or however your item holds image
      })),
      total: total.toFixed(2),
    };

    try {
      const res = await axios.post('http://localhost:5000/checkout', orderPayload, {
        withCredentials: true, // important if you're using cookie-based JWT auth
      });
      console.log(res);
      toast.success('Order placed successfully!');
      // optionally redirect
      //navigate('/order-success'); 
    } catch (err) {
      toast.error('Something went wrong placing the order!');
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg grid md:grid-cols-2 gap-8 p-8">

        {/* Billing + Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Billing Information</h2>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email Address"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <select name="country" value={formData.country} onChange={handleChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="">Select Country</option>
                <option value="USA">United States</option>
                <option value="IND">India</option>
              </select>
              {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
            </div>

            <div>
              <select name="state" value={formData.state} onChange={handleChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="">Select State</option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
                <option value="IL">Illinois</option>
                <option value="TX">Texas</option>
                <option value="AZ">Arizona</option>
              </select>
              {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input name="city" value={formData.city} onChange={handleChange} placeholder="City"
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>
            <div>
              <input name="zip" value={formData.zip} onChange={handleChange} placeholder="ZIP Code"
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
              {errors.zip && <p className="text-red-500 text-sm">{errors.zip}</p>}
            </div>
          </div>

          {/* Payment Method */}
          <h3 className="text-lg font-semibold pt-6">Select Payment Method</h3>
          <div className="flex gap-3">
            {['card', 'paypal', 'gpay'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 border rounded-xl py-2 px-4 text-sm transition ${
                  paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {method === 'card' ? '💳 Credit Card' : method === 'paypal' ? '🅿️ PayPal' : '🟢 GPay'}
              </button>
            ))}
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-4 mt-4">
              <input name="cardName" value={formData.cardName} onChange={handleChange} placeholder="Cardholder Name"
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
              {errors.cardName && <p className="text-red-500 text-sm">{errors.cardName}</p>}

              <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="Card Number"
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
              {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <input
                    type="text"
                    name="expiry"
                    onChange={handleChange}
                    value={formData.expiry}
                    placeholder="MM/YY"
                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.expiry && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
                    )}
                </div>
                <div className="flex flex-col">
                    <input
                    type="text"
                    name="cvv"
                    onChange={handleChange}
                    value={formData.cvv}
                    placeholder="CVV"
                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                </div>
                </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Place Order
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 text-gray-700 max-h-64 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-3">
                  <img src={item.images?.[0] || 'placeholder.jpg'} alt={item.title}
                    className="w-12 h-12 rounded object-cover" />
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
    </div>
  );
};

export default CheckoutPage;