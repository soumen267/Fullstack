import React from 'react';
import SuggestedProducts from '../components/SuggestedProducts';

const OrderDetails = ({ order, onBack }) => {
  if (!order) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back to Orders
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Details</h2>

      {/* Order Meta */}
      <div className="mb-6 border-b pb-4">
        <p className="text-sm text-gray-500">Order ID: {order.orderId}</p>
        <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
        <p className="text-sm text-gray-500">
          Payment Status:
          <span className={`ml-1 font-semibold ${order.paymentStatus === 'succeeded' ? 'text-green-600' : 'text-red-600'}`}>
            {order.paymentStatus}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Billing Info */}
        <div className="md:col-span-1">
          <h3 className="font-semibold text-gray-700 mb-2">Billing Info</h3>
          {order.billingInfoRef && (
            <div className="text-sm text-gray-600">
              <p>{order.billingInfoRef.name}</p>
              <p>{order.billingInfoRef.email}</p>
              <p>{order.billingInfoRef.address}</p>
              <p>{order.billingInfoRef.city}, {order.billingInfoRef.state} {order.billingInfoRef.zipCode}</p>
              <p>{order.billingInfoRef.country}</p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="md:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-start gap-4 border p-4 rounded">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-20 h-20 object-contain rounded border"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.productName}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-500">Price: ${item.price}</p>
                  <button
                    className="mt-2 px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => alert('Redirect to rating UI or modal')}
                  >
                    Rate Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Total + Invoice */}
      <div className="flex justify-between items-center mt-4 border-t pt-4">
        <p className="text-xl font-bold text-gray-800">Total: ${order.totalAmount.toFixed(2)}</p>
        <button
          onClick={() => alert('Downloading Invoice...')}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Download Invoice
        </button>
      </div>

      {/* Suggestions Section */}
      <div className="mt-10 pt-6 w-full">
        <div className="group relative overflow-hidden">
          <div id="suggested-scroll" className="flex space-x-4 overflow-x-hidden scrollbar-visible">
            <SuggestedProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;