import React from 'react';
import { useLocation } from 'react-router-dom';

function OrderSuccessPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentIntentId = params.get('payment_intent_id');

  return (
    <div className="container mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold text-green-600">Payment Successful 🎉</h2>
      <p className="mt-4">Your order has been placed successfully.</p>
      {paymentIntentId && <p className="mt-2">Payment ID: {paymentIntentId}</p>}
    </div>
  );
}

export default OrderSuccessPage;