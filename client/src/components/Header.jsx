import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Header = () => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState(null);
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const navigate = useNavigate();

    const [currency] = useState('USD');
    const [language] = useState('English');
  
    const [userId, setUserId] = useState(null);

    const updateAuthStatus = useCallback(async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth-status', {
          withCredentials: true,
        });

        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUsername(response.data.username);
          setUserId(response.data.userId);
        } else {
          setIsAuthenticated(false);
          setUsername(null);
          setUserId(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      }
    }, []);

    useEffect(() => {
      updateAuthStatus();
      const interval = setInterval(updateAuthStatus, 60000);
      return () => clearInterval(interval);
    }, [updateAuthStatus]);

    useEffect(() => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    }, []);

    useEffect(() => {
      // 1. Initial check when component mounts
      updateAuthStatus();

      // 2. Listen for 'storage' events (e.g., if login/logout happens in another tab/window)
      const handleStorageChange = (event) => {
          if (event.key === 'token' || event.key === 'username') {
              updateAuthStatus();
          }
      };
      window.addEventListener('storage', handleStorageChange);

      // Cleanup the event listener when the component unmounts
      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
  }, [updateAuthStatus]);

  const toggleUserDropdown = () => setIsUserDropdownOpen(prev => !prev);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isUserDropdownOpen && !event.target.closest('.user-dropdown-container')) {
                setIsUserDropdownOpen(false);
            }
        };
        // if (isUserDropdownOpen) {
        //     document.addEventListener('mousedown', handleClickOutside);
        // } else {
        //     document.removeEventListener('mousedown', handleClickOutside);
        // }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserDropdownOpen]);
    const goToHome = () => {
        navigate('/');
    };
    const goToLogin = () => {
        navigate('/login');
    };
    const goToRegister = () => {
        navigate('/register');
      };
    const handleLogout = async (event) => {
      event.stopPropagation();
      event.preventDefault();
      try {
        await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
        setIsAuthenticated(false);
        setUsername(null);
        setUserId(null);
        setIsUserDropdownOpen(false);
        toast.success('Logged out successfully!');
        navigate('/');

      } catch (err) {
        toast.error('Something went wrong!');
        console.error('Logout failed:', err);
      }
    };
    // Reinitialize the dropdown on component update
    return (
        <>
  {/* Top Header */}
  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm py-3 fixed top-0 left-0 right-0 z-50 shadow-md">
  <div className="max-w-screen-xl mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
      
      {/* Left Info Block */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto">
        <button onClick={goToHome} className="hover:underline transition">
          ShopCart
        </button>
        <span className="font-medium">{currency}</span>
        <span className="font-medium">{language}</span>
        <div className="flex items-center gap-2">
          <i className="anm anm-phone-s text-white"></i>
          <span className="font-medium">+440 0(111) 044 833</span>
        </div>
      </div>

      {/* Center Promo Message */}
      <div className="hidden md:block md:flex-1 text-center">
        <p className="font-semibold tracking-wide whitespace-nowrap">
          🌍 Worldwide Express Shipping
        </p>
      </div>

      {/* Right Auth + Cart */}
      <div className="flex items-center gap-4 justify-end w-full md:w-auto">
        {/* Mobile User Icon */}
        <span className="block lg:hidden text-white text-lg">
          <i className="anm anm-user-al"></i>
        </span>

        {/* Cart Icon */}
        <Link to="/cart" className="relative text-white text-lg">
          <i className="fa-solid fa-cart-shopping"></i>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-white text-red-600 text-xs font-bold rounded-full px-1.5 py-0.5 shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>

        <Link to="/wishlist" className="relative text-white text-lg">
          <i className="fa-solid fa-heart"></i>
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-white text-red-600 text-xs font-bold rounded-full px-1.5 py-0.5 shadow-sm">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* Auth Links */}
        <ul className="flex items-center gap-3 text-sm font-medium">
          {!isAuthenticated ? (
            <>
              <li>
                <button onClick={goToLogin} className="hover:underline transition">
                  Login
                </button>
              </li>
              <li>
                <button onClick={goToRegister} className="hover:underline transition">
                  Register
                </button>
              </li>
            </>
          ) : (
            <li className="relative group">
              <button
                onClick={toggleUserDropdown}
                className="hover:underline transition"
              >
                {username || 'My Account'}
              </button>

              {/* Dropdown */}
              <div className={`absolute right-0 mt-2 bg-white text-black rounded shadow-md w-44 z-30 ${isUserDropdownOpen ? 'block' : 'hidden'}`}>
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    navigate(`/profile/${userId}`);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </button>
                <a
                  href="/orders"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  Orders
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  </div>
</div>
</>
    );
};

export default Header;