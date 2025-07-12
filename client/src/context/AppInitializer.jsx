import React, { useEffect, useState } from 'react';
import api from '../api';
import { WishlistProvider } from './WishlistContext';

const AppInitializer = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth-status', { withCredentials: true }) // important: send cookies
      .then(res => {
        if (res.data.isAuthenticated && res.data.userId) {
          setUserId(res.data.userId);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading app...</div>;

  return (
    <WishlistProvider userId={userId}>
      {children}
    </WishlistProvider>
  );
};

export default AppInitializer;