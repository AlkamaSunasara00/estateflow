import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [loginInfo, setLoginInfo] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const userId = userData.id;
    const isLoggedIn = userId ? localStorage.getItem(`isLoggedIn_${userId}`) : null;
    const token = userId ? localStorage.getItem(`accessToken_${userId}`) : null;

    if (token && isLoggedIn === 'true') {
      navigate('/admin/dashboard', { replace: true });
    }

    const params = new URLSearchParams(location.search);
    if (params.get('reason') === 'new-login') {
      setMessage('You were logged out because you logged in from another device.');
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/login', loginInfo);

      const userId = res.data.user.id;

      localStorage.setItem(`accessToken_${userId}`, res.data.accessToken);
      localStorage.setItem(`user_${userId}`, JSON.stringify(res.data.user));
      localStorage.setItem(`isLoggedIn_${userId}`, 'true');
      localStorage.setItem(`lastActivityUpdate_${userId}`, Date.now());

      // global fallback
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('isLoggedIn', 'true');

      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      const errorMessage = error?.response?.data?.error || 'Login failed.';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-login">
      <div className="loginn wrap">
        <h1 className="h1" id="login">Admin Login</h1>
        {message && <div style={{ color: 'red', marginBottom: '10px' }}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            name="identifier"
            type="text"
            onChange={handleChange}
            value={loginInfo.identifier}
            placeholder="Email or Phone Number"
            required
            disabled={loading}
          />

          <input
            name="password"
            type="password"
            onChange={handleChange}
            value={loginInfo.password}
            placeholder="Password"
            required
            disabled={loading}
          />

          <button className="button type1" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
