// src/Pages/Cart/Cart.jsx
import React from 'react';
import { useCart } from '../context/CartContext'; // Adjust path if necessary
import { Link } from 'react-router-dom'; // For "Continue Shopping" link
import { useNavigate } from 'react-router-dom';



const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };
  const navigate = useNavigate();
  const shippingCost = 0; // For simplicity, assume free shipping for now
  const taxRate = 0.08; // 8% tax
  const taxAmount = calculateSubtotal() * taxRate;
  const total = calculateSubtotal() + shippingCost + taxAmount;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center min-h-[60vh] flex items-center justify-center flex-col">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mt-4 md:mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Shopping Cart</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items Section */}
        <div className="lg:w-2/3 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Items ({cartItems.length})</h3>
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center border-b border-gray-200 py-4 last:border-b-0">
              <img
                src={item.images && item.images.length > 0 ? item.images[0] : 'placeholder.jpg'}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-lg mr-4"
              />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.description.substring(0, 70)}...</p>
                <p className="text-lg font-bold text-green-600 mt-1">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-xl hover:bg-gray-300"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="text-lg font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-xl hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors ml-4"
                >
                  <i className="fas fa-trash-alt"></i> {/* Font Awesome trash icon */}
                </button>
              </div>
            </div>
          ))}
          <Link
            to="/"
            className="mt-6 inline-block text-blue-600 hover:underline transition-colors"
          >
            &larr; Continue Shopping
          </Link>
        </div>

        {/* Order Summary Section */}
        <div className="lg:w-1/3 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax ({taxRate * 100}%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 border-t border-gray-300 pt-3 mt-3">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-green-600 text-white py-3 rounded-lg mt-6 hover:bg-green-700 transition-colors duration-300 text-lg font-semibold">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;