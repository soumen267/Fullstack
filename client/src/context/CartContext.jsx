import React, { createContext, useState, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (productToAdd) => {
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
  };

  // You might want a removeFromCart function as well
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // And an updateQuantity function
  const updateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ).filter(item => item.quantity > 0) // Remove if quantity goes to 0
    );
  };


  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount: cartItems.length }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Create a Custom Hook for easier consumption
export const useCart = () => {
  return useContext(CartContext);
};