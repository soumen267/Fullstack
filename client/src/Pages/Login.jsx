import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const API_BASE = process.env.REACT_APP_API_URL;
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
        await axios.post(
          `${API_BASE}/login`,
          { email, password },
          {
            withCredentials: true, // This ensures cookies are sent/stored
          }
        );

        // Do not store anything in localStorage
        // Navigate after successful login
        toast.success('Logged in successfully!');
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
        toast.error('Login error:', err);
      }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Login</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4 text-center">Sign in to start your session</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-1">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2">Remember Me</span>
              </label>
              <a href="www.google.com" className="text-sm text-blue-600 hover:underline">Forgot Your Password?</a>
            </div>

            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Login
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900"
            >
              <i className="fab fa-facebook mr-2"></i> Sign in using Facebook
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <i className="fab fa-google-plus mr-2"></i> Sign in using Google+
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;