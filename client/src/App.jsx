import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import DailyReportForm from './components/DailyReportForm';
import ReportList from './components/ReportList';
import { getAuthToken, getSavedUser, setAuthToken, setSavedUser, apiFetch } from './utils/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ postgresConnected: false });

  // Check health and DB connection
  const checkHealth = async () => {
    try {
      const res = await apiFetch('/health');
      setDbStatus(res);
    } catch (e) {
      console.warn('Health check failed', e.message);
    }
  };

  useEffect(() => {
    checkHealth();
    const token = getAuthToken();
    const saved = getSavedUser();

    if (token && saved) {
      setUser(saved);
      // Validate token with backend
      apiFetch('/auth/me')
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          // Clear invalid session
          setAuthToken(null);
          setSavedUser(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setSavedUser(null);
    setUser(null);
  };

  const handleReportSubmitted = (id) => {
    setActiveTab('history');
  };

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>
        <div>Loading Hostel Application...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        dbStatus={dbStatus}
      />

      <main className="main-content">
        {!user ? (
          <Login onLoginSuccess={(u) => setUser(u)} />
        ) : (
          <>
            {activeTab === 'new' && (
              <DailyReportForm user={user} onReportSubmitted={handleReportSubmitted} />
            )}
            {activeTab === 'history' && <ReportList />}
          </>
        )}
      </main>
    </div>
  );
}
