import React, { useEffect, useState } from 'react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../lib/api';
import { Modal } from './ServicesPage.jsx';

const BLANK = { name: '', rating: 5, text: '', source: 'google', is_active: true };

function StarsInput({ value, onChange }) {
  return (
    <div className="stars-input">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" className={n <= value ? 'active' : ''} onClick={() => onChange(n)}>★</button>
      ))}
    </div>
  );
}

export default function TestimonialsPage({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getTestimonials().then(setItems).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setForm(BLANK); setEditing('new'); };
  const openEdit = (t) => { setForm({ ...t }); setEditing(t); };
  const close = () => setEditing(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.text) return showToast('Name and review text required', 'error');
    setSaving(true);
    try {
      if (editing === 'new') {
        const created = await createTestimonial(form);
        setItems(i => [...i, created]);
      } else {
        const updated = await updateTestimonial(editing.id, form);
        setItems(i => i.map(x => x.id === updated.id ? updated : x));
      }
      showToast('Saved!');
      close();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    try { await deleteTestimonial(id); setItems(i => i.filter(x => x.id !== id)); showToast('Deleted'); }
    catch { showToast('Delete failed', 'error'); }
  };

  const toggleActive = async (t) => {
    try {
      const updated = await updateTestimonial(t.id, { ...t, is_active: !t.is_active });
      setItems(i => i.map(x => x.id === updated.id ? updated : x));
    } catch { showToast('Update failed', 'error'); }
  };

  return (
    <div>
      <div className="section-hd">
        <div><div className="section-hd-title">Testimonials</div><div className="section-hd-sub">{items.length} review{items.length !== 1 ? 's' : ''}</div></div>
        <button className="btn-save" onClick={openNew}>+ Add Review</button>
      </div>

      {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
        <div className="a-card" style={{ padding: 0 }}>
          <table className="a-table">
            <thead><tr><th>Name</th><th>Rating</th><th>Review</th><th>Source</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} style={{ opacity: t.is_active ? 1 : 0.5 }}>
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{t.name}</td>
                  <td style={{ color: 'var(--gold)', whiteSpace: 'nowrap' }}>{'★'.repeat(t.rating)}</td>
                  <td style={{ color: 'var(--text-dim)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{t.text}"</td>
                  <td><span className="badge badge-muted">{t.source}</span></td>
                  <td><label className="toggle"><input type="checkbox" checked={!!t.is_active} onChange={() => toggleActive(t)} /><span className="toggle-slider" /></label></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => openEdit(t)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn-icon danger" onClick={() => remove(t.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="empty-state">No testimonials yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <Modal title={editing === 'new' ? 'Add Testimonial' : 'Edit Testimonial'} onClose={close}>
          <div className="a-field"><label className="a-label">Client Name *</label><input className="a-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Michael R." autoFocus /></div>
          <div className="a-field">
            <label className="a-label">Rating</label>
            <StarsInput value={form.rating} onChange={v => set('rating', v)} />
          </div>
          <div className="a-field"><label className="a-label">Review Text *</label><textarea className="a-input" rows={4} value={form.text} onChange={e => set('text', e.target.value)} placeholder="What did they say?" /></div>
          <div className="a-field">
            <label className="a-label">Source</label>
            <select className="a-input" value={form.source} onChange={e => set('source', e.target.value)}>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="yelp">Yelp</option>
              <option value="direct">Direct</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-secondary" onClick={close}>Cancel</button>
            <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
