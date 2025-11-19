import { useEffect, useRef } from 'react';
import api from '../api/axiosInstance';

export default function useAuthRefresh(userId) {
  const refreshInterval = 119 * 60 * 1000 + 55 * 1000;
  const activityThrottle = 5000;

  const refreshTimer = useRef(null);

  const scheduleRefresh = () => {
    clearTimeout(refreshTimer.current);

    refreshTimer.current = setTimeout(async () => {
      const token = localStorage.getItem(`accessToken_${userId}`);

      if (!token) return handleLogout();

      try {
        const { data } = await api.post('/refresh-token');
        localStorage.setItem(`accessToken_${userId}`, data.accessToken);
        scheduleRefresh();
      } catch {
        handleLogout();
      }
    }, refreshInterval);
  };

  const handleActivity = () => {
    const now = Date.now();
    const last = parseInt(localStorage.getItem(`lastActivityUpdate_${userId}`) || '0');

    if (now - last < activityThrottle) return;

    localStorage.setItem(`lastActivityUpdate_${userId}`, now);
    api.post('/update-activity').catch(() => {});
  };

  const handleLogout = () => {
    api.post('/logout').finally(() => {
      localStorage.clear();
      window.location.href = '/admin/login';
    });
  };

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem(`accessToken_${userId}`);
    const isLoggedIn = localStorage.getItem(`isLoggedIn_${userId}`);

    if (!token || isLoggedIn !== 'true') return handleLogout();

    scheduleRefresh();

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((e) => window.addEventListener(e, handleActivity));

    return () => {
      clearTimeout(refreshTimer.current);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [userId]);

  return null;
}
