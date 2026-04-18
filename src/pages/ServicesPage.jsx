import React, { useEffect, useState } from 'react';
import { getServices, createService, updateService, deleteService } from '../lib/api';

const BLANK = { name: '', price: '', duration: '', description: '', category: 'haircut', is_active: true };

export default function ServicesPage({ showToast }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | service object
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const load = () => {
    setLoading(true);
    getServices().then(setServices).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setForm(BLANK); setEditing('new'); };
  const openEdit = (s) => { setForm({ ...s }); setEditing(s); };
  const close = () => setEditing(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.price) return showToast('Name and price required', 'error');
    setSaving(true);
    try {
      if (editing === 'new') {
        const created = await createService(form);
        setServices(s => [...s, created]);
      } else {
        const updated = await updateService(editing.id, form);
        setServices(s => s.map(x => x.id === updated.id ? updated : x));
      }
      showToast('Service saved!');
      close();
    } catch {
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      setServices(s => s.filter(x => x.id !== id));
      showToast('Deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  const toggleActive = async (svc) => {
    try {
      const updated = await updateService(svc.id, { ...svc, is_active: !svc.is_active });
      setServices(s => s.map(x => x.id === updated.id ? updated : x));
    } catch { showToast('Update failed', 'error'); }
  };

  const sortedServices = [...services].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const handleDragStart = (id) => {
    setDraggedId(id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragOverId !== id) setDragOverId(id);
  };

  const handleDrop = async (targetId) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const updated = [...sortedServices];
    const fromIndex = updated.findIndex(item => item.id === draggedId);
    const toIndex = updated.findIndex(item => item.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    const reordered = updated.map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    setServices(reordered);
    setDraggedId(null);
    setDragOverId(null);

    try {
      for (const item of reordered) {
        await updateService(item.id, item);
      }

      showToast('Service order updated!');
      await load();
    } catch (err) {
      console.error('Drag reorder failed:', err);
      showToast('Failed to reorder', 'error');
      await load();
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div>
      <div className="section-hd">
        <div>
          <div className="section-hd-title">Services</div>
          <div className="section-hd-sub">{services.length} service{services.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn-save" onClick={openNew}>+ Add Service</button>
      </div>

      {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
        <div className="a-card" style={{ padding: 0 }}>
          <table className="a-table">
            <thead>
              <tr><th>Service</th><th>Price</th><th>Duration</th><th>Category</th><th>Active</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sortedServices.map((s) => (
                <tr
                  key={s.id}
                  draggable
                  onDragStart={() => handleDragStart(s.id)}
                  onDragOver={(e) => handleDragOver(e, s.id)}
                  onDrop={() => handleDrop(s.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    border: dragOverId === s.id ? '2px solid var(--accent, #8b5cf6)' : undefined,
                    cursor: 'grab',
                  }}
                >
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    {s.description && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          marginTop: 2,
                          maxWidth: 260,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.description}
                      </div>
                    )}
                  </td>

                  <td style={{ fontWeight: 700, color: 'var(--teal)' }}>{s.price}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{s.duration || '—'}</td>
                  <td>
                    <span className="badge badge-muted">{s.category}</span>
                  </td>

                  <td>
                    <label className="toggle" title={s.is_active ? 'Active' : 'Hidden'}>
                      <input
                        type="checkbox"
                        checked={!!s.is_active}
                        onChange={() => toggleActive(s)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => openEdit(s)} title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button className="btn-icon danger" onClick={() => remove(s.id)} title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No services yet — add your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {editing !== null && (
        <Modal title={editing === 'new' ? 'Add Service' : 'Edit Service'} onClose={close}>
          <div className="a-field"><label className="a-label">Name *</label><input className="a-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Haircut" autoFocus /></div>
          <div className="a-2col">
            <div className="a-field"><label className="a-label">Price *</label><input className="a-input" value={form.price} onChange={e => set('price', e.target.value)} placeholder="$45" /></div>
            <div className="a-field"><label className="a-label">Duration</label><input className="a-input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="45 min" /></div>
          </div>
          <div className="a-field">
            <label className="a-label">Category</label>
            <select className="a-input" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="haircut">Haircut</option>
              <option value="beard">Beard</option>
              <option value="combo">Combo</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="a-field"><label className="a-label">Description</label><textarea className="a-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description..." /></div>
          <div className="toggle-wrap" style={{ marginBottom: 14 }}>
            <label className="toggle"><input type="checkbox" checked={!!form.is_active} onChange={e => set('is_active', e.target.checked)} /><span className="toggle-slider" /></label>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Active (visible on site)</span>
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

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#0e0e0e', border: '1px solid var(--border-m)', borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: '1.3rem', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export { Modal };
