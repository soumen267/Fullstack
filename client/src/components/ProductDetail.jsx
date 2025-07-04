// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook to get URL parameters
import { useCart } from '../context/CartContext'; // Assuming you have a CartContext

const ProductDetail = () => {
  const { id } = useParams(); // Get the 'id' from the URL (e.g., /product/123 -> id = "123")
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart(); // Access addToCart from context

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://dummyjson.com/products/${id}`);

        // Check if the HTTP response was successful (status code 200-299)
        if (!response.ok) {
          // If not successful, try to parse an error message from the response body
          // The DummyJSON API typically returns a JSON object for errors too.
          const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response body
        setProduct(data); // Set the fetched product data to state

      } catch (err) {
        setError('Failed to fetch product details. ' + err.message);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) { // Only fetch if ID is available
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen-minus-header">
        <div className="text-xl text-gray-700">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen-minus-header">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen-minus-header">
        <div className="text-xl text-gray-500">Product not found.</div>
      </div>
    );
  }

  // --- Render Product Details ---
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col md:flex-row gap-8 bg-white shadow-lg rounded-lg p-6 md:p-8">
        {/* Product Image */}
        <div className="md:w-1/2 flex justify-center items-center">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full max-w-md h-auto object-cover rounded-md shadow-md"
          />
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{product.title}</h1>
            <h3 className="text-2xl font-bold text-white-100 mb-3">{product.category}</h3>
            <p className="text-gray-700 text-lg mb-4">{product.description}</p>

            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold text-indigo-600 mr-2">${product.price.toFixed(2)}</span>
              <span className="text-4xl text-gray-500 line-through">${product.discountPercentage ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2) : 'N/A'}</span>
            </div>

            {/* Optional: Add more details like stock, ratings, etc. */}
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-semibold">Availability:</span> {product.availabilityStatus}
              </p>
              { <p className="text-gray-600">
                <span className="font-semibold">SKU:</span> {product.sku}
              </p> }
              {/* Example of rating */}
              { <div className="flex items-center text-yellow-400 mt-2">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
                <i className="far fa-star"></i>
                <span className="ml-2 text-gray-600">(4.5 / 5 stars)</span>
              </div> }
            </div>
          </div>

          {/* Add to Cart Section */}
          <div>
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-indigo-600 text-white text-xl py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;