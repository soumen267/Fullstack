import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children, userId }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (userId) {
      api.get(`/show/${userId}`)
        .then((res) => setWishlistItems(res.data))
        .catch((err) => console.error('Failed to load wishlist:', err));
    }
  }, [userId]);

  const addToWishlist = (product) => {
    api.post('/add', { userId, product })
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
    api.post('/remove', { userId, productId })
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