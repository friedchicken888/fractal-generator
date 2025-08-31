import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RootRedirect() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/generator');
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  return null; // This component doesn't render anything visible
}
