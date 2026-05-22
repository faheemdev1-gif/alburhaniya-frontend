import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const NAV = [
  { to: '/admin',           label: 'Dashboard', icon: '⊞', end: true },
  { to: '/admin/articles',  label: 'Articles',  icon: '✦' },
  { to: '/admin/events',    label: 'Events',    icon: '◈' },
  { to: '/admin/gallery',   label: 'Gallery',   icon: '▣' },
  { to: '/admin/users',     label: 'Users',     icon: '◉', adminOnly: true },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="al-root">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="al-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`al-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="al-sidebar-header">
          <div className="al-logo">AB</div>
          <div className="al-brand">
            <span className="al-brand-name">Al-Burhaniya</span>
            <span className="al-brand-role">Admin</span>
          </div>
        </div>

        <nav className="al-nav">
          {NAV.filter(n => !n.adminOnly || isAdmin).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `al-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="al-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="al-sidebar-footer">
          <div className="al-user-info">
            <div className="al-user-avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="al-user-details">
              <span className="al-user-name">{user?.name}</span>
              <span className="al-user-role">{user?.role}</span>
            </div>
          </div>
          <button className="al-logout-btn" onClick={handleLogout} title="Logout">⇥</button>
        </div>
      </aside>

      {/* Main */}
      <div className="al-main">
        <header className="al-topbar">
          <button className="al-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <a href="/" target="_blank" className="al-view-site">View Site ↗</a>
        </header>
        <main className="al-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}