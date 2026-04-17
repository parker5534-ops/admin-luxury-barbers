import React, { useEffect, useState } from 'react';
import { getAnalytics, getLeads } from '../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(7), getLeads({ limit: 5 })])
      .then(([analytics, leadsData]) => {
        setStats(analytics);
        setLeads(leadsData.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Good {getGreeting()}, Alfonso 👋</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          {dayName}, {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Book Clicks (7d)</div>
          <div className="stat-value" style={{ background: 'linear-gradient(90deg,#39C6D6,#4A7CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {stats?.book_clicks ?? '—'}
          </div>
          <div className="stat-sub">Vagaro button taps</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Call Clicks (7d)</div>
          <div className="stat-value">{stats?.call_clicks ?? '—'}</div>
          <div className="stat-sub">Phone taps</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Form Submits (7d)</div>
          <div className="stat-value">{stats?.form_submits ?? '—'}</div>
          <div className="stat-sub">Contact messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Events (7d)</div>
          <div className="stat-value">{stats?.total_events ?? '—'}</div>
          <div className="stat-sub">All tracked actions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Instagram Clicks (7d)</div>
          <div className="stat-value">{stats?.instagram_clicks ?? '—'}</div>
          <div className="stat-sub">IG link taps</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New Leads (7d)</div>
          <div className="stat-value">{stats?.leads_count ?? '—'}</div>
          <div className="stat-sub">Contact form messages</div>
        </div>
      </div>

      {/* Recent Leads */}
      {leads.length > 0 && (
        <div className="a-card" style={{ marginTop: 8 }}>
          <div className="a-card-title">Recent Leads</div>
          <table className="a-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Message</th>
                <th>When</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.name}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{l.email || l.phone || '—'}</td>
                  <td style={{ color: 'var(--text-dim)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.message || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(l.created_at)}</td>
                  <td><span className={`badge badge-${l.status === 'new' ? 'blue' : 'green'}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick links */}
      <div className="a-card" style={{ marginTop: 16 }}>
        <div className="a-card-title">Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="https://www.vagaro.com/luxurybarberculture" target="_blank" rel="noopener" className="btn-secondary" style={{ fontSize: '0.82rem' }}>Open Vagaro ↗</a>
          <a href="https://instagram.com/luxurybarberculture" target="_blank" rel="noopener" className="btn-secondary" style={{ fontSize: '0.82rem' }}>Instagram ↗</a>
          <a href={`${import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173'}`} target="_blank" rel="noopener" className="btn-secondary" style={{ fontSize: '0.82rem' }}>View Website ↗</a>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
