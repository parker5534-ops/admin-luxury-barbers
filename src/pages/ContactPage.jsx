import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../lib/api';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function ContactPage({ showToast }) {
  const [fields, setFields] = useState({
    phone: '', email: '', address: '',
    instagram_url: '', facebook_url: '', tiktok_url: '',
    hours_monday: 'Closed', hours_tuesday: '10:00 AM – 7:00 PM',
    hours_wednesday: '10:00 AM – 7:00 PM', hours_thursday: '10:00 AM – 7:00 PM',
    hours_friday: '10:00 AM – 7:00 PM', hours_saturday: '9:00 AM – 5:00 PM',
    hours_sunday: 'Closed',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(s => {
      setFields(f => ({ ...f, ...Object.fromEntries(Object.entries(s).filter(([k]) => k in f)) }));
    }).catch(() => showToast('Failed to load', 'error'));
  }, []);

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await saveSettings(fields);
      showToast('Contact info saved!');
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="section-hd">
        <div><div className="section-hd-title">Contact & Hours</div><div className="section-hd-sub">Business info, hours, and social links</div></div>
        <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>

      <div className="a-card">
        <div className="a-card-title">Business Info</div>
        <div className="a-field"><label className="a-label">Phone</label><input className="a-input" value={fields.phone} onChange={e => set('phone', e.target.value)} placeholder="(832) 899-9191" /></div>
        <div className="a-field"><label className="a-label">Email</label><input className="a-input" type="email" value={fields.email} onChange={e => set('email', e.target.value)} /></div>
        <div className="a-field"><label className="a-label">Address</label><input className="a-input" value={fields.address} onChange={e => set('address', e.target.value)} /></div>
      </div>

      <div className="a-card">
        <div className="a-card-title">Hours of Operation</div>
        {DAYS.map((d, i) => (
          <div key={d} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, marginBottom: 10, alignItems: 'center' }}>
            <label className="a-label" style={{ margin: 0 }}>{DAY_LABELS[i]}</label>
            <input className="a-input" value={fields['hours_' + d]} onChange={e => set('hours_' + d, e.target.value)} placeholder="Closed or e.g. 10:00 AM – 7:00 PM" />
          </div>
        ))}
        <div className="info-box">Type "Closed" for days the shop is not open.</div>
      </div>

      <div className="a-card">
        <div className="a-card-title">Social Media</div>
        <div className="a-field"><label className="a-label">Instagram URL</label><input className="a-input" value={fields.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/luxurybarberculture" /></div>
        <div className="a-field"><label className="a-label">Facebook URL</label><input className="a-input" value={fields.facebook_url} onChange={e => set('facebook_url', e.target.value)} placeholder="https://facebook.com/luxurybarberculture" /></div>
        <div className="a-field"><label className="a-label">TikTok URL</label><input className="a-input" value={fields.tiktok_url} onChange={e => set('tiktok_url', e.target.value)} placeholder="https://tiktok.com/@luxurybarberculture" /></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>
    </div>
  );
}
