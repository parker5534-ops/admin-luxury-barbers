import React, { useEffect, useState } from 'react';
import { getLeads, updateLead, deleteLead } from '../lib/api';

const STATUS_COLORS = { new: 'badge-blue', contacted: 'badge-green', closed: 'badge-muted' };

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function LeadsPage({ showToast }) {
  const [leads, setLeads] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    getLeads(params)
      .then(({ data, count }) => { setLeads(data || []); setCount(count || 0); })
      .catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [statusFilter]);

  const setStatus = async (lead, status) => {
    try {
      const updated = await updateLead(lead.id, { status });
      setLeads(l => l.map(x => x.id === updated.id ? updated : x));
    } catch { showToast('Update failed', 'error'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try { await deleteLead(id); setLeads(l => l.filter(x => x.id !== id)); showToast('Deleted'); }
    catch { showToast('Delete failed', 'error'); }
  };

  return (
    <div>
      <div className="section-hd">
        <div><div className="section-hd-title">Leads</div><div className="section-hd-sub">{count} contact form submission{count !== 1 ? 's' : ''}</div></div>
        <select className="a-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Leads</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
        <div className="a-card" style={{ padding: 0 }}>
          <table className="a-table">
            <thead><tr><th>Name</th><th>Contact</th><th>Message</th><th>When</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {leads.map(l => (
                <React.Fragment key={l.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(e => e === l.id ? null : l.id)}>
                    <td style={{ fontWeight: 600 }}>{l.name}</td>
                    <td style={{ color: 'var(--text-dim)' }}>
                      {l.email && <div><a href={`mailto:${l.email}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--blue)' }}>{l.email}</a></div>}
                      {l.phone && <div><a href={`tel:${l.phone}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--teal)' }}>{l.phone}</a></div>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.message || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{timeAgo(l.created_at)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="a-input" style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                        value={l.status} onChange={e => setStatus(l, e.target.value)}>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn-icon danger" onClick={() => remove(l.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </td>
                  </tr>
                  {expanded === l.id && l.message && (
                    <tr>
                      <td colSpan={6} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 16px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                          <strong style={{ color: '#fff' }}>Message:</strong> {l.message}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          {l.email && <a href={`mailto:${l.email}`} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>Reply via Email</a>}
                          {l.phone && <a href={`tel:${l.phone}`} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>Call</a>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {leads.length === 0 && <tr><td colSpan={6} className="empty-state">No leads yet. They'll appear here when customers submit the contact form.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
