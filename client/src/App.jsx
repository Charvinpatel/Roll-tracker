import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Dispatches from './pages/Dispatches';
import Returns from './pages/Returns';
import StockSettings from './pages/StockSettings';
import { Toaster } from 'react-hot-toast';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/vendors', label: 'Vendors', icon: '🏪' },
  { to: '/dispatches', label: 'Dispatches', icon: '📦' },
  { to: '/returns', label: 'Returns', icon: '↩️' },
  { to: '/stock', label: 'Inventory Overview', icon: '📋' },
];

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <Toaster position="top-right" />
      {/* Mobile Topbar */}
      <header className="topbar">
        <div className="topbar-logo">RollTrack</div>
        <button className="ham" onClick={() => setMenuOpen(true)}>☰</button>
      </header>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <div className={`overlay ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="logo">
          <h1>RollTrack</h1>
          <span>Inventory System</span>
        </div>
        <nav className="nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/dispatches" element={<Dispatches />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/stock" element={<StockSettings />} />
        </Routes>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bnav">
        {NAV.map(n => (
          <div key={n.to} className={`bn ${location.pathname === n.to ? 'active' : ''}`} onClick={() => navigate(n.to)}>
            <span className="bi">{n.icon}</span>
            <span>{n.label.split(' ')[0]}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
