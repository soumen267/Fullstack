import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SuggestedProducts = () => {
  const [suggested, setSuggested] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-hover');

    let scrollInterval;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        scrollContainer.scrollLeft += 2; // adjust speed
      }, 10);
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval);
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('mouseenter', startScrolling);
      scrollContainer.addEventListener('mouseleave', stopScrolling);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', startScrolling);
        scrollContainer.removeEventListener('mouseleave', stopScrolling);
      }
    };
  }, []);

  useEffect(() => {
    const fetchAndShuffle = async () => {
      try {
        const res = await fetch('https://dummyjson.com/products');
        const data = await res.json();
        if (Array.isArray(data.products)) {
          const shuffled = data.products.sort(() => 0.5 - Math.random());
          setSuggested(shuffled.slice(0, 4)); // Show 4 + scrollable 2
        }
      } catch (err) {
        console.error("Failed to fetch suggested products", err);
      }
    };

    fetchAndShuffle();
  }, []);

  return (
    <div className="mt-10 border-t pt-6 w-full">
      <h3 className="text-xl font-bold mb-4 text-gray-800">You Might Also Like</h3>

      <div className="overflow-x-auto scrollbar-visible">
        <div
          className="flex space-x-4 max-w-full"
        >
          {suggested.map((product) => (
            <div
              key={product.id}
              className="min-w-[23%] max-w-[23%] bg-white rounded-lg shadow p-4 text-center flex-shrink-0"
              onClick={() => navigate(`/singleProduct/${product.id}`)}
            >
              <img
                src={product.images?.[0] || 'placeholder.jpg'}
                alt={product.title}
                className="w-full h-40 object-contain mb-2"
              />
              <p className="font-medium text-gray-800">{product.title}</p>
              <p className="text-green-600 font-bold">${product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestedProducts;