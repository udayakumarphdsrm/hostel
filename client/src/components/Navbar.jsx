import React from 'react';
import { LogOut, FileText, ListFilter, Database, User } from 'lucide-react';
import logo from '../assets/images/logo.png';

export default function Navbar({ user, activeTab, setActiveTab, onLogout, dbStatus }) {
  return (
    <header className="navbar no-print">
      <div className="navbar-brand">
        <img src={logo} alt="SRM Group Logo" className="navbar-logo" />
        <span>HOSTEL DAILY ATTENDANCE REPORT SYSTEM</span>
      </div>

      {user && (
        <div className="navbar-links">
          {/* Only show "New Daily Report" button if user is not deanadmin */}
          {user.role !== 'deanadmin' && (
            <button
              className={`nav-btn ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              <FileText size={16} />
              <span>New Daily Report</span>
            </button>
          )}

          {/* For deanadmin, show Report History as the only menu option */}
          <button
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={user.role === 'deanadmin' ? { opacity: 0.7 } : {}}
            title={user.role === 'deanadmin' ? 'View only access' : ''}
          >
            <ListFilter size={16} />
            <span>Report History</span>
            {user.role === 'deanadmin' && <span style={{ fontSize: '0.7rem', marginLeft: '0.3rem' }}>(View Only)</span>}
          </button>

          <div className="user-badge">
            <User size={14} />
            <span>{user.fullName || user.username}</span>
            <span className="role">{user.role}</span>
          </div>

          <div
            className={`status-pill ${dbStatus?.postgresConnected ? 'postgres' : 'offline'}`}
            title={
              dbStatus?.postgresConnected
                ? 'Connected to PostgreSQL Database'
                : 'Using Local Storage Fallback (PostgreSQL Service Offline)'
            }
          >
            <Database size={12} />
            <span>{dbStatus?.postgresConnected ? 'PostgreSQL Connected' : 'Local Fallback'}</span>
          </div>

          <button className="nav-btn" onClick={onLogout} title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
