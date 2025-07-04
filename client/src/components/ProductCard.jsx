import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext'; // ✅ Add this import
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, wishlistItems } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://dummyjson.com/products')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products", err);
        setLoading(false);
      });      
  }, []);

  const handleProductClick = (productId) => {
    console.log('Navigating to product:', productId);
    navigate(`/singleProduct/${productId}`); // Navigate to the product detail page
  };

  if (loading) return <Loader />;

  // Helper function to render stars
  const renderStars = (rating) => {
    const totalStars = 5;
    const filledStars = Math.floor(rating);
    // Logic for half star (adjust as needed based on how you want to handle decimals)
    const hasHalfStar = (rating % 1) >= 0.3 && (rating % 1) < 0.7; // Example: .3 to .69 is a half star
    const emptyStars = totalStars - filledStars - (hasHalfStar ? 1 : 0);

    const stars = [];

    // Filled stars
    for (let i = 0; i < filledStars; i++) {
      stars.push(<i key={`filled-${i}`} className="fas fa-star text-yellow-400 text-base"></i>);
    }

    // Half star
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400 text-base"></i>);
    } else if (rating % 1 >= 0.7) { // If remainder is 0.7 or more, visually treat as next full star
        stars.push(<i key="filled-roundup" className="fas fa-star text-yellow-400 text-base"></i>);
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300 text-base"></i>);
    }
    return (
        <div className="flex items-center space-x-0.5 mt-2">
            {stars}
            {/* Display numerical rating to two decimal places, e.g., (2.56) */}
            <span className="text-sm text-gray-600 ml-1">({rating.toFixed(2)})</span>
        </div>
    );
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50">
  {products.map(product => {
    const isWished = wishlistItems.some(item => item.productId === product.id);

    return (
      <div
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col"
          >
            <img
              className="w-full h-48 object-cover rounded-t-2xl transform hover:scale-105 transition-transform duration-300"
              src={product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg'}
              alt={product.title}
            />

            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.title}</h3>

              {typeof product.rating === 'number' && (
                <div className="mb-2">{renderStars(product.rating)}</div>
              )}

              <div className="flex items-center space-x-3 mb-4">
                <span className="text-green-600 font-bold text-lg">${product.price}</span>
                <span className="text-sm text-red-500 line-through">
                  {product.discountPercentage
                    ? `$${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}`
                    : ''}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isWished
                    ? removeFromWishlist(product.id)
                    : addToWishlist({
                        productId: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.images?.[0] || '',
                      });
                }}
                className={`mt-2 px-4 py-2 rounded ${
                  isWished ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                {isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300"
              >
                Add to Cart
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Products;