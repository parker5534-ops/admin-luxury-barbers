import React, { useEffect, useState } from 'react';
import { getBarbers, createBarber, updateBarber, deleteBarber, uploadBarberPhoto } from '../lib/api';
import { Modal } from './ServicesPage.jsx';

const BLANK = { name: '', title: '', bio: '', specialties: '', phone: '', instagram: '', photo_url: '', photo_public_id: '', is_active: true };

export default function BarbersPage({ showToast }) {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getBarbers().then(setBarbers).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setForm(BLANK); setPhotoPreview(null); setPhotoFile(null); setEditing('new'); };
  const openEdit = (b) => {
    setForm({ ...b, specialties: Array.isArray(b.specialties) ? b.specialties.join(', ') : (b.specialties || '') });
    setPhotoPreview(b.photo_url || null);
    setPhotoFile(null);
    setEditing(b);
  };
  const close = () => setEditing(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.name || !form.title) return showToast('Name and title required', 'error');
    setSaving(true);
    try {
      let photo_url = form.photo_url;
      let photo_public_id = form.photo_public_id;
      if (photoFile) {
        const up = await uploadBarberPhoto(photoFile);
        photo_url = up.url;
        photo_public_id = up.public_id;
      }
      const specialtiesArr = form.specialties
        ? form.specialties.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const payload = { ...form, specialties: specialtiesArr, photo_url, photo_public_id };

      if (editing === 'new') {
        const created = await createBarber(payload);
        setBarbers(b => [...b, created]);
      } else {
        const updated = await updateBarber(editing.id, payload);
        setBarbers(b => b.map(x => x.id === updated.id ? updated : x));
      }
      showToast('Barber saved!');
      close();
    } catch (err) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this barber?')) return;
    try {
      await deleteBarber(id);
      setBarbers(b => b.filter(x => x.id !== id));
      showToast('Deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  return (
    <div>
      <div className="section-hd">
        <div>
          <div className="section-hd-title">Team</div>
          <div className="section-hd-sub">{barbers.length} barber{barbers.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn-save" onClick={openNew}>+ Add Barber</button>
      </div>

      {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {barbers.map(b => (
            <div key={b.id} className="a-card" style={{ opacity: b.is_active ? 1 : 0.5 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {b.photo_url ? <img src={b.photo_url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '✂'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{b.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--teal)', marginBottom: 6 }}>{b.title}</div>
                  {b.specialties?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {b.specialties.map(sp => <span key={sp} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(57,198,214,0.1)', border: '1px solid rgba(57,198,214,0.2)', color: 'var(--teal)' }}>{sp}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                <button className="btn-icon" onClick={() => openEdit(b)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="btn-icon danger" onClick={() => remove(b.id)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
          {barbers.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}>No barbers yet.</div>}
        </div>
      )}

      {editing !== null && (
        <Modal title={editing === 'new' ? 'Add Barber' : 'Edit Barber'} onClose={close}>
          {/* Photo */}
          <div className="a-field">
            <label className="a-label">Profile Photo</label>
            <label style={{ display: 'block', border: '2px dashed var(--border-m)', borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer' }}>
              {photoPreview
                ? <img src={photoPreview} alt="Preview" style={{ maxHeight: 100, margin: '0 auto 8px', borderRadius: 8 }} />
                : <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '8px 0' }}>Click to upload photo</div>}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="a-2col">
            <div className="a-field"><label className="a-label">Full Name *</label><input className="a-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alfonso Arredondo" /></div>
            <div className="a-field"><label className="a-label">Title *</label><input className="a-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Master Barber" /></div>
          </div>
          <div className="a-field"><label className="a-label">Bio</label><textarea className="a-input" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} /></div>
          <div className="a-field"><label className="a-label">Specialties (comma-separated)</label><input className="a-input" value={form.specialties} onChange={e => set('specialties', e.target.value)} placeholder="Fades, Skin Fades, Beard Sculpting" /></div>
          <div className="a-2col">
            <div className="a-field"><label className="a-label">Phone</label><input className="a-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(832) 899-9191" /></div>
            <div className="a-field"><label className="a-label">Instagram</label><input className="a-input" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@handle" /></div>
          </div>
          <div className="toggle-wrap" style={{ marginBottom: 16 }}>
            <label className="toggle"><input type="checkbox" checked={!!form.is_active} onChange={e => set('is_active', e.target.checked)} /><span className="toggle-slider" /></label>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Visible on site</span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={close}>Cancel</button>
            <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
