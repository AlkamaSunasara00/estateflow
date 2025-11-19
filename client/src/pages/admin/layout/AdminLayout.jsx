import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import api from '../../../api/axiosInstance';
import useAuthRefresh from '../../../hooks/useAuthRefresh';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } finally {
      const userId = user?.id;
      localStorage.removeItem(`accessToken_${userId}`);
      localStorage.removeItem(`user_${userId}`);
      localStorage.removeItem(`isLoggedIn_${userId}`);
      localStorage.removeItem(`lastActivityUpdate_${userId}`);
      navigate('/admin/login', { replace: true });
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) throw new Error('Invalid user');

        const response = await api.get(`/getuserbyid/${userData.id}`);

        setUser(response.data);
        localStorage.setItem(`user_${userData.id}`, JSON.stringify(response.data));
        setLoading(false);
      } catch {
        localStorage.clear();
        navigate('/admin/login', { replace: true });
      }
    }

    fetchUser();
  }, [navigate]);

  useAuthRefresh(user?.id);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="Dashboard-container">
      <Sidebar user={user} onLogout={handleLogout} />
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <main className="admin-panel-header-div">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
