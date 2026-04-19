import React, { useEffect, useState, useRef } from 'react';
import { getSettings, saveSettings } from '../lib/api';

export default function ContentPage({ showToast }) {
  const [fields, setFields] = useState({
    hero_headline: '',
    hero_subheadline: '',
    hero_bg_image: '',
    logo_url: '',
    hero_kicker_text: '',
    hero_location_text: '',
    services_section_title: '',
    promo_text: '',
    about_text: '',
    cancellation_policy: '',
    seo_title: '',
    seo_description: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const bgFileRef = useRef();

  useEffect(() => {
    getSettings().then(s => {
      setFields(f => ({
        ...f,
        hero_headline: s.hero_headline || '',
        hero_subheadline: s.hero_subheadline || '',
        hero_bg_image: s.hero_bg_image || '',
        logo_url: s.logo_url || '',
        hero_kicker_text: s.hero_kicker_text || '',
        hero_location_text: s.hero_location_text || '',
        services_section_title: s.services_section_title || '',
        promo_text: s.promo_text || '',
        about_text: s.about_text || '',
        cancellation_policy: s.cancellation_policy || '',
        seo_title: s.seo_title || '',
        seo_description: s.seo_description || '',
      }));
    }).catch(() => showToast('Failed to load settings', 'error'));
  }, []);

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await saveSettings(fields);
      showToast('Content saved!');
    } catch {
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Upload hero background image to Cloudinary via the existing /api/uploads/gallery endpoint
  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = localStorage.getItem('lbc_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/uploads/gallery`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      set('hero_bg_image', data.url);
      showToast('Background image uploaded!');
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingBg(false);
    }
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileRef = useRef();

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = localStorage.getItem('lbc_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/uploads/gallery`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      set('logo_url', data.url);
      showToast('Logo uploaded!');
    } catch (err) {
      showToast(err.message || 'Logo upload failed', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div>
      <div className="section-hd">
        <div>
          <div className="section-hd-title">Website Content</div>
          <div className="section-hd-sub">Edit text and settings shown on your public site</div>
        </div>
        <button className="btn-save" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>

      {/* ── Promo Banner ── */}
      <div className="a-card">
        <div className="a-card-title">Promo Banner</div>
        <div className="a-field">
          <label className="a-label">Banner Text</label>
          <input
            className="a-input"
            value={fields.promo_text}
            onChange={e => set('promo_text', e.target.value)}
            placeholder="Now accepting new clients — Book online 24/7 via Vagaro"
          />
          <div className="info-box">Shown at the very top of the site. Leave blank to hide the banner.</div>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <div className="a-card">
        <div className="a-card-title">Hero Section</div>
        <div className="a-field">
          <label className="a-label">Headline (line 1 — italic)</label>
          <input
            className="a-input"
            value={fields.hero_headline}
            onChange={e => set('hero_headline', e.target.value)}
            placeholder="Luxury Cuts."
          />
        </div>
        <div className="a-field">
          <label className="a-label">Sub-headline (line 2 — bold)</label>
          <input
            className="a-input"
            value={fields.hero_subheadline}
            onChange={e => set('hero_subheadline', e.target.value)}
            placeholder="Precision Grooming."
          />
        </div>


        <div className="a-field">
          <label className="a-label">Services Section Title</label>
          <input
            className="a-input"
            value={fields.services_section_title || ''}
            onChange={(e) => set('services_section_title', e.target.value)}
            placeholder="Premium Grooming Menu"
          />
        </div>

        <div className="a-field">
          <label className="a-label">Hero Eyebrow / Tagline</label>
          <input
            className="a-input"
            value={fields.hero_kicker_text || ''}
            onChange={(e) => set('hero_kicker_text', e.target.value)}
            placeholder="Premium Barbershop"
          />
        </div>

        <div className="a-field">
          <label className="a-label">Hero Location Text</label>
          <input
            className="a-input"
            value={fields.hero_location_text || ''}
            onChange={(e) => set('hero_location_text', e.target.value)}
            placeholder="Friendswood, TX"
          />
        </div>

        {/* Hero background image */}
        <div className="a-field">
          <label className="a-label">Background Image (optional)</label>

          <div className="a-field">
            <label className="a-label">Logo Image</label>

            {fields.logo_url && (
              <div style={{ marginBottom: 12, position: 'relative', width: '100%', maxWidth: 220, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-m)', background: '#0a0a0a' }}>
                <img src={fields.logo_url} alt="Logo preview" style={{ width: '100%', height: 140, objectFit: 'contain', display: 'block', padding: 12 }} />
                <button
                  onClick={() => set('logo_url', '')}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            )}

            <label style={{ display: 'block', border: '2px dashed var(--border-m)', borderRadius: 10, padding: '16px 20px', textAlign: 'center', cursor: uploadingLogo ? 'not-allowed' : 'pointer' }}>
              <input ref={logoFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={uploadingLogo} />
              {uploadingLogo
                ? <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Uploading…</span>
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {fields.logo_url ? 'Click to replace logo' : 'Click to upload a logo'}
                </span>
              }
            </label>

            <div className="info-box">Best result: transparent PNG or clean logo on dark background.</div>
          </div>

          {/* Preview */}
          {fields.hero_bg_image && (
            <div style={{ marginBottom: 12, position: 'relative', width: '100%', maxWidth: 360, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-m)' }}>
              <img src={fields.hero_bg_image} alt="Hero background preview" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
              <button
                onClick={() => set('hero_bg_image', '')}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          )}

          <label style={{ display: 'block', border: '2px dashed var(--border-m)', borderRadius: 10, padding: '16px 20px', textAlign: 'center', cursor: uploadingBg ? 'not-allowed' : 'pointer' }}>
            <input ref={bgFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} disabled={uploadingBg} />
            {uploadingBg
              ? <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Uploading…</span>
              : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {fields.hero_bg_image ? 'Click to replace image' : 'Click to upload a background photo'}
              </span>
            }
          </label>
          <div className="info-box">Recommended: high-res landscape photo (1920×1080 or larger). A dark overlay is applied automatically.</div>
        </div>

        {/* Or paste a URL */}
        <div className="a-field">
          <label className="a-label">Or paste an image URL</label>
          <input
            className="a-input"
            value={fields.hero_bg_image}
            onChange={e => set('hero_bg_image', e.target.value)}
            placeholder="https://res.cloudinary.com/…"
          />
        </div>
      </div>

      {/* ── About Section ── */}
      <div className="a-card">
        <div className="a-card-title">About Section</div>
        <div className="a-field">
          <label className="a-label">About Text</label>
          <textarea
            className="a-input"
            rows={5}
            value={fields.about_text}
            onChange={e => set('about_text', e.target.value)}
            placeholder="Tell your story..."
          />
        </div>
      </div>

      {/* ── Cancellation Policy ── */}
      <div className="a-card">
        <div className="a-card-title">Cancellation &amp; No-Show Policy</div>
        <div className="a-field">
          <label className="a-label">Policy Text</label>
          <textarea
            className="a-input"
            rows={4}
            value={fields.cancellation_policy}
            onChange={e => set('cancellation_policy', e.target.value)}
            placeholder="We require at least 1 hour notice for cancellations or rescheduling…"
          />
          <div className="info-box">Displayed at the bottom of the Services page.</div>
        </div>
      </div>

      {/* ── SEO ── */}
      <div className="a-card">
        <div className="a-card-title">SEO &amp; Meta Tags</div>
        <div className="a-field">
          <label className="a-label">Page Title</label>
          <input
            className="a-input"
            value={fields.seo_title}
            onChange={e => set('seo_title', e.target.value)}
            placeholder="Luxury Barber Culture | Premium Cuts in Friendswood, TX"
          />
          <div className="info-box">Shown in browser tabs and Google search results. Keep under 60 characters.</div>
        </div>
        <div className="a-field">
          <label className="a-label">Meta Description</label>
          <textarea
            className="a-input"
            rows={3}
            value={fields.seo_description}
            onChange={e => set('seo_description', e.target.value)}
            placeholder="Precision haircuts, beard sculpting, and top-tier grooming in Friendswood, TX. Book online 24/7."
          />
          <div className="info-box">Shown in Google search snippets. Keep under 155 characters.</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-save" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
