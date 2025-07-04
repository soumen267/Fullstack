import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MainLayout from './Layout/Layout';
import Home from './Pages/Home/Home';
import About from './Pages/About/About';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Cart from './Pages/Cart';
import { CartProvider } from './context/CartContext';
import AppInitializer from './context/AppInitializer';
import ProductDetail from './components/ProductDetail';
import CheckoutPage from './Pages/Checkout';
import UserProfile from './Pages/UserProfile';
import Wishlist from './Pages/Wishlist';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/cart', element: <Cart /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/singleProduct/:id', element: <ProductDetail /> },
      { path: '/profile/:id', element: <UserProfile /> },
      { path: '/wishlist', element: <Wishlist /> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
    <AppInitializer>
    <RouterProvider router={router} />
    <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
    />
    </AppInitializer>
    </CartProvider>
  </React.StrictMode>
);