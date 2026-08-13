import React from 'react';
import { Building2, LogOut, FileText, ListFilter, Database, User } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout, dbStatus }) {
  return (
    <header className="navbar no-print">
      <div className="navbar-brand">
        <Building2 size={24} />
        <span>HOSTEL MANAGEMENT REPORT SYSTEM</span>
      </div>

      {user && (
        <div className="navbar-links">
          <button
            className={`nav-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <FileText size={16} />
            <span>New Daily Report</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <ListFilter size={16} />
            <span>Report History</span>
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
