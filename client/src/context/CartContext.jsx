import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie'; // Import js-cookie for easy cookie management

// Define the name for the cookie where anonymous cart data will be stored
const ANONYMOUS_CART_COOKIE_NAME = 'anonymous_cart';

export const CartContext = createContext();

// Changed CartProvider to be a default export to resolve "Element type is invalid" error
const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false); // New state to manage initial load

  // Function to load cart from cookies
  const loadCartFromCookies = useCallback(() => {
    try {
      const cookieCart = Cookies.get(ANONYMOUS_CART_COOKIE_NAME);
      if (cookieCart) {
        const parsedCart = JSON.parse(cookieCart);
        setCartItems(parsedCart);
        console.log("Anonymous cart loaded from cookies:", parsedCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error loading anonymous cart from cookies:", error);
      setCartItems([]); // Ensure cart is empty on error
    } finally {
      setIsInitialLoadComplete(true); // Mark initial load as complete
    }
  }, []);

  // Function to save cart to cookies
  const saveCartToCookies = useCallback((items) => {
    try {
      // Only save if the initial load has completed to prevent overwriting
      // the cookie with an empty array before the actual cookie data is read.
      if (isInitialLoadComplete) {
        Cookies.set(ANONYMOUS_CART_COOKIE_NAME, JSON.stringify(items), { expires: 7 }); // Store for 7 days
        console.log("Anonymous cart saved to cookies:", items);
      }
    } catch (error) {
      console.error("Error saving anonymous cart to cookies:", error);
    }
  }, [isInitialLoadComplete]);


  // Effect to load cart from cookies on initial component mount
  useEffect(() => {
    loadCartFromCookies();
  }, [loadCartFromCookies]);

  // Effect to persist cartItems to cookies whenever they change
  useEffect(() => {
    if (isInitialLoadComplete) {
      saveCartToCookies(cartItems);
    }
  }, [cartItems, isInitialLoadComplete, saveCartToCookies]);


  // Add to Cart function
  const addToCart = useCallback((productToAdd) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id);
      if (existingItem) {
        // If the item exists, update its quantity
        return prevItems.map(item =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Otherwise, add the new item with quantity 1
        return [...prevItems, { ...productToAdd, quantity: 1 }];
      }
    });
  }, []);

  // Remove from Cart function
  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  // Update Quantity function
  const updateQuantity = useCallback((productId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ).filter(item => item.quantity > 0) // Remove if quantity goes to 0
    );
  }, []);

  // Calculate total number of items (sum of quantities) in the cart
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Export CartProvider as a default export
export default CartProvider;

// Create a Custom Hook for easier consumption (still a named export)
export const useCart = () => {
  return useContext(CartContext);
};