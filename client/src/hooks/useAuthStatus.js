import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api'; // Your axios instance

const useAuthStatus = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth-status');
        if (!res.data.isAuthenticated) {
          toast.error('Please sign in to proceed to checkout!');
          navigate('/');
        }
      } catch (err) {
        toast.error('Please sign in to proceed to checkout!');
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);
};

export default useAuthStatus;