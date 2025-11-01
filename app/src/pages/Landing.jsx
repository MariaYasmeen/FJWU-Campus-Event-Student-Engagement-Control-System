import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(profile?.role === 'manager' ? '/manager' : '/student');
    }, 1200);
    return () => clearTimeout(timer);
  }, [profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-fjwuGreen">You are logged in</h1>
        <p className="text-gray-600 mt-2">Redirecting to your home...</p>
      </div>
    </div>
  );
}