import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../lib/api';

export default function BookingPage({ showToast }) {
  const [vagaro_url, setVagaroUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(s => setVagaroUrl(s.vagaro_url || '')).catch(() => showToast('Failed to load', 'error'));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await saveSettings({ vagaro_url });
      showToast('Booking URL saved!');
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="section-hd">
        <div><div className="section-hd-title">Booking Settings</div><div className="section-hd-sub">Controls every "Book Now" button on the site</div></div>
        <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>

      <div className="a-card">
        <div className="a-card-title">Vagaro Booking URL</div>
        <div className="a-field">
          <label className="a-label">Booking URL</label>
          <input className="a-input" value={vagaro_url} onChange={e => setVagaroUrl(e.target.value)} placeholder="https://www.vagaro.com/luxurybarberculture" />
        </div>
        <div className="info-box">
          Changing this URL updates <strong>every</strong> Book Now button across the entire public site instantly.
        </div>
        {vagaro_url && (
          <div style={{ marginTop: 14 }}>
            <a href={vagaro_url} target="_blank" rel="noopener" className="btn-secondary" style={{ fontSize: '0.82rem', display: 'inline-block' }}>
              Test Booking Link ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
