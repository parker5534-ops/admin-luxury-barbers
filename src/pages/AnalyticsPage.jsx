import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../lib/api';

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalytics(days)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div>
      <div className="section-hd">
        <div>
          <div className="section-hd-title">Analytics Overview</div>
          <div className="section-hd-sub">Tracked events from your public website</div>
        </div>
        <select className="a-input" style={{ width: 'auto' }} value={days} onChange={e => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : (
        <>
          <div className="stat-grid">
            {[
              { label: 'Book Now Clicks', value: stats?.book_clicks ?? 0, sub: 'Vagaro button' },
              { label: 'Call Clicks', value: stats?.call_clicks ?? 0, sub: 'Phone taps' },
              { label: 'Instagram Clicks', value: stats?.instagram_clicks ?? 0, sub: 'IG link taps' },
              { label: 'Form Submits', value: stats?.form_submits ?? 0, sub: 'Contact messages' },
              { label: 'Total Events', value: stats?.total_events ?? 0, sub: `Last ${days} days` },
              { label: 'New Leads', value: stats?.leads_count ?? 0, sub: `Last ${days} days` },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ background: 'linear-gradient(90deg,#39C6D6,#4A7CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {stats?.by_type && Object.keys(stats.by_type).length > 0 && (
            <div className="a-card" style={{ marginTop: 8 }}>
              <div className="a-card-title">Events by Type</div>
              <table className="a-table">
                <thead>
                  <tr><th>Event</th><th>Count</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {Object.entries(stats.by_type)
                    .sort(([,a],[,b]) => b - a)
                    .map(([type, count]) => (
                      <tr key={type}>
                        <td>{type.replace(/_/g, ' ')}</td>
                        <td style={{ fontWeight: 600 }}>{count}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3 }}>
                              <div style={{ width: `${Math.round((count / stats.total_events) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#39C6D6,#4A7CFF)', borderRadius: 3 }} />
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', width: 36, textAlign: 'right' }}>
                              {Math.round((count / stats.total_events) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="info-box" style={{ marginTop: 16 }}>
            💡 For deeper analytics, connect your Google Analytics 4 ID in <strong>Settings</strong>. GA4 will track sessions, demographics, and traffic sources automatically.
          </div>
        </>
      )}
    </div>
  );
}
