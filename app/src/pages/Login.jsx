import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [roleTab, setRoleTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, message } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password, role: roleTab });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 card">
        <h1 className="text-2xl font-semibold text-fjwuGreen mb-4">airelpier — Login</h1>
        <div className="flex gap-2 mb-4">
          <button className={`btn ${roleTab === 'student' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRoleTab('student')}>Student</button>
          <button className={`btn ${roleTab === 'manager' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRoleTab('manager')}>Event Manager</button>
        </div>
        {(error || message) && (
          <div className="mb-3 text-sm text-red-600">{error || message}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm">Email</span>
            <input type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm">Password</span>
            <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">No account?</span>{' '}
          <Link to="/signup" className="text-fjwuGreen underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}