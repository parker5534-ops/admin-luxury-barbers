import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Toast from './components/Toast.jsx';
import { useToast } from './hooks/useToast.js';

// Pages
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ContentPage from './pages/ContentPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import BarbersPage from './pages/BarbersPage.jsx';
import TestimonialsPage from './pages/TestimonialsPage.jsx';
import FaqsPage from './pages/FaqsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const PAGE_MAP = {
  overview: DashboardPage,
  analytics: AnalyticsPage,
  content: ContentPage,
  services: ServicesPage,
  gallery: GalleryPage,
  team: BarbersPage,
  testimonials: TestimonialsPage,
  faqs: FaqsPage,
  contact: ContactPage,
  booking: BookingPage,
  leads: LeadsPage,
  settings: SettingsPage,
};

const PAGE_TITLES = {
  overview: 'Dashboard',
  analytics: 'Analytics',
  content: 'Website Content',
  services: 'Services',
  gallery: 'Gallery',
  team: 'Team',
  testimonials: 'Testimonials',
  faqs: 'FAQs',
  contact: 'Contact & Hours',
  booking: 'Booking Settings',
  leads: 'Leads',
  settings: 'Settings',
};

function AdminShell() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, show: showToast } = useToast();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!user) return <LoginPage />;

  const PageComponent = PAGE_MAP[page] || DashboardPage;

  return (
    <div className="admin-layout">
      {/* Mobile overlay — clicking it closes the sidebar */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        page={page}
        setPage={(p) => { setPage(p); setSidebarOpen(false); }}
        user={user}
        onLogout={logout}
        mobileOpen={sidebarOpen}
      />

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/*
              FIX: The original had style={{ display: 'none' }} hard-coded inline,
              which permanently hid this button even on mobile. Removed that inline
              style entirely. The admin.css now controls visibility via media query:
              hidden by default on desktop, shown on mobile (≤768px).
            */}
            <button
              className="btn-icon mobile-menu-btn"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidebarOpen}
            >
              ☰
            </button>
            <div className="topbar-title">{PAGE_TITLES[page] || 'Admin'}</div>
          </div>

          <div className="topbar-actions">
            <a
              href={import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173'}
              target="_blank"
              rel="noopener"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            >
              View Site ↗
            </a>
          </div>
        </div>

        <div className="admin-content">
          <PageComponent showToast={showToast} />
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminShell />
    </AuthProvider>
  );
}
