import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidFjwuEmail } from '../utils/validators.js';

const departments = [
  'Computer Science',
  'Economics',
  'Mathematics',
  'Business',
  'English',
  'Psychology',
];

export default function Signup() {
  const [roleTab, setRoleTab] = useState('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(departments[0]);
  const [semester, setSemester] = useState('1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup, message } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!isValidFjwuEmail(email)) {
      setError('University email must end with .fjwu.edu.pk');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup({ firstName, lastName, email, department, semester, password, role: roleTab });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 card">
        <h1 className="text-2xl font-semibold text-fjwuGreen mb-4">airelpier — Signup</h1>
        <div className="flex gap-2 mb-4">
          <button className={`btn ${roleTab === 'student' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRoleTab('student')}>Student</button>
          <button className={`btn ${roleTab === 'manager' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRoleTab('manager')}>Event Manager</button>
        </div>
        {(error || message) && (
          <div className="mb-3 text-sm text-red-600">{error || message}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">First Name</span>
              <input className="input mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label className="block">
              <span className="text-sm">Last Name</span>
              <input className="input mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>
          </div>
          <label className="block">
            <span className="text-sm">University Email</span>
            <input type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">Department</span>
              <select className="input mt-1" value={department} onChange={(e) => setDepartment(e.target.value)}>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm">Semester</span>
              <input type="number" min="1" max="8" className="input mt-1" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">Password</span>
              <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <label className="block">
              <span className="text-sm">Confirm Password</span>
              <input type="password" className="input mt-1" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </label>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Already have an account?</span>{' '}
          <Link to="/login" className="text-fjwuGreen underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}