import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings, changePassword } from '../lib/api';

export default function SettingsPage({ showToast }) {
  const [fields, setFields] = useState({ business_name: '', ga4_id: '', meta_pixel_id: '' });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    getSettings().then(s => {
      setFields({ business_name: s.business_name || '', ga4_id: s.ga4_id || '', meta_pixel_id: s.meta_pixel_id || '' });
    }).catch(() => showToast('Failed to load', 'error'));
  }, []);

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await saveSettings(fields); showToast('Settings saved!'); }
    catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const savePw = async () => {
    if (!pw.current || !pw.next) return showToast('Fill in all password fields', 'error');
    if (pw.next !== pw.confirm) return showToast('New passwords do not match', 'error');
    if (pw.next.length < 8) return showToast('Password must be at least 8 characters', 'error');
    setSavingPw(true);
    try {
      await changePassword(pw.current, pw.next);
      showToast('Password changed!');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) { showToast(err.message || 'Change failed', 'error'); }
    finally { setSavingPw(false); }
  };

  return (
    <div>
      <div className="section-hd">
        <div><div className="section-hd-title">Settings</div><div className="section-hd-sub">Business config and analytics</div></div>
        <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>

      <div className="a-card">
        <div className="a-card-title">Business</div>
        <div className="a-field">
          <label className="a-label">Business Name</label>
          <input className="a-input" value={fields.business_name} onChange={e => set('business_name', e.target.value)} />
        </div>
      </div>

      <div className="a-card">
        <div className="a-card-title">Analytics IDs</div>
        <div className="a-field">
          <label className="a-label">Google Analytics 4 ID</label>
          <input className="a-input" value={fields.ga4_id} onChange={e => set('ga4_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
        </div>
        <div className="a-field">
          <label className="a-label">Meta Pixel ID</label>
          <input className="a-input" value={fields.meta_pixel_id} onChange={e => set('meta_pixel_id', e.target.value)} placeholder="000000000000000" />
        </div>
        <div className="info-box">
          To use Google Analytics: add your GA4 measurement ID above, then add the GA4 script tag to your public site's <code>index.html</code>.<br />
          Meta Pixel: same process — add the pixel ID and insert the Pixel base code into <code>index.html</code>.
        </div>
      </div>

      <div className="a-card">
        <div className="a-card-title">Change Password</div>
        <div className="a-field"><label className="a-label">Current Password</label><input className="a-input" type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" /></div>
        <div className="a-field"><label className="a-label">New Password</label><input className="a-input" type="password" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} placeholder="Min. 8 characters" /></div>
        <div className="a-field"><label className="a-label">Confirm New Password</label><input className="a-input" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" /></div>
        <button className="btn-save" onClick={savePw} disabled={savingPw}>{savingPw ? 'Changing…' : 'Change Password'}</button>
      </div>
    </div>
  );
}
