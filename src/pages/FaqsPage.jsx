import React, { useEffect, useState } from 'react';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../lib/api';
import { Modal } from './ServicesPage.jsx';

const BLANK = { question: '', answer: '', is_active: true };

export default function FaqsPage({ showToast }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const load = () => {
    setLoading(true);
    getFaqs().then(setFaqs).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setForm(BLANK); setEditing('new'); };
  const openEdit = (f) => { setForm({ ...f }); setEditing(f); };
  const close = () => setEditing(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.question || !form.answer) return showToast('Question and answer required', 'error');
    setSaving(true);
    try {
      if (editing === 'new') {
        const created = await createFaq({ ...form, sort_order: faqs.length + 1 });
        setFaqs(f => [...f, created]);
      } else {
        const updated = await updateFaq(editing.id, form);
        setFaqs(f => f.map(x => x.id === updated.id ? updated : x));
      }
      showToast('Saved!');
      close();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    try { await deleteFaq(id); setFaqs(f => f.filter(x => x.id !== id)); showToast('Deleted'); }
    catch { showToast('Delete failed', 'error'); }
  };

  const toggleActive = async (faq) => {
    try {
      const updated = await updateFaq(faq.id, { ...faq, is_active: !faq.is_active });
      setFaqs(f => f.map(x => x.id === updated.id ? updated : x));
    } catch { showToast('Update failed', 'error'); }
  };

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

    const updated = [...faqs];
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

    setFaqs(reordered);
    setDraggedId(null);
    setDragOverId(null);

    try {
      for (const item of reordered) {
        await updateFaq(item.id, {
          sort_order: item.sort_order,
        });
      }

      showToast('FAQ order updated!');
      await load();
    } catch (err) {
      console.error('FAQ drag reorder failed:', err);
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
        <div><div className="section-hd-title">FAQs</div><div className="section-hd-sub">{faqs.length} question{faqs.length !== 1 ? 's' : ''}</div></div>
        <button className="btn-save" onClick={openNew}>+ Add FAQ</button>
      </div>

      {loading ? <div className="loading-overlay"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="a-card"
              draggable
              onMouseDown={(e) => e.stopPropagation()}
              onDragStart={() => handleDragStart(faq.id)}
              onDragOver={(e) => handleDragOver(e, faq.id)}
              onDrop={() => handleDrop(faq.id)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: faq.is_active ? 1 : 0.5,
                border: dragOverId === faq.id ? '2px solid var(--accent, #8b5cf6)' : '2px solid transparent',
                cursor: 'grab',
                transform: draggedId === faq.id ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Q: {faq.question}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>A: {faq.answer}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}
                  onMouseDown={(e) => e.stopPropagation()}>
                  <label className="toggle" title="Toggle visibility">
                    <input type="checkbox" checked={!!faq.is_active} onChange={() => toggleActive(faq)} />
                    <span className="toggle-slider" />
                  </label>
                  <button className="btn-icon" onClick={() => openEdit(faq)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button className="btn-icon danger" onClick={() => remove(faq.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {faqs.length > 0 && (
            <div className="info-box">
              Drag and drop FAQ cards to reorder them.
            </div>
          )}
          {faqs.length === 0 && <div className="empty-state">No FAQs yet. Add your first one.</div>}
        </div>
      )}

      {editing !== null && (
        <Modal title={editing === 'new' ? 'Add FAQ' : 'Edit FAQ'} onClose={close}>
          <div className="a-field"><label className="a-label">Question *</label><input className="a-input" value={form.question} onChange={e => set('question', e.target.value)} placeholder="Do I need an appointment?" autoFocus /></div>
          <div className="a-field"><label className="a-label">Answer *</label><textarea className="a-input" rows={4} value={form.answer} onChange={e => set('answer', e.target.value)} placeholder="Your answer..." /></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn-secondary" onClick={close}>Cancel</button>
            <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
