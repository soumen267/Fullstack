import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children, userId }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/show/${userId}`)
        .then((res) => setWishlistItems(res.data))
        .catch((err) => console.error('Failed to load wishlist:', err));
    }
  }, [userId]);

  const addToWishlist = (product) => {
    axios.post('http://localhost:5000/add', { userId, product })
      .then((res) => {
        setWishlistItems(res.data);
        toast.success('Added to wishlist');
      })
      .catch((err) => {
        console.error('Add error:', err);
        toast.error('Failed to add to wishlist');
      });
  };

  const removeFromWishlist = (productId) => {
    axios.post('http://localhost:5000/remove', { userId, productId })
      .then((res) => {
        setWishlistItems(res.data);
        toast.success('Removed from wishlist');
      })
      .catch((err) => {
        console.error('Remove error:', err);
        toast.error('Failed to remove from wishlist');
      });
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, wishlistCount: wishlistItems.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);