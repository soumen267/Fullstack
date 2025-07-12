import React from 'react';

const OrderCard = ({ order, onViewDetails }) => {
  return (
    <div className="border rounded-lg shadow-md bg-white p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="font-semibold text-gray-800">Order ID: {order.orderId}</p>
          <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total: ${order.totalAmount.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${order.paymentStatus === 'succeeded' ? 'text-green-600' : 'text-red-600'}`}>
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {order.items.map((item, idx) => (
        <div key={idx} className="flex items-start space-x-4 mb-4 border-t pt-4">
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-20 h-20 object-contain rounded border"
          />
          <div>
            <p className="font-medium text-gray-800">{item.productName}</p>
            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            <p className="text-sm text-gray-500">Price: ${item.price}</p>
          </div>
        </div>
      ))}

      <div className="text-right">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={() => onViewDetails(order)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default OrderCard;