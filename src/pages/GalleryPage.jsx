import React, { useEffect, useState, useRef } from 'react';
import { getGallery, uploadGalleryImage, createGalleryImage, deleteGalleryImage, updateGalleryImage, reorderGallery } from '../lib/api';

export default function GalleryPage({ showToast }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    getGallery()
      .then(setImages)
      .catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return showToast('Please select image files', 'error');
    setUploading(true);
    let uploaded = 0;

    for (const file of arr) {
      try {
        const { url, thumbnail_url, public_id } = await uploadGalleryImage(file);
        await createGalleryImage({ url, thumbnail_url, public_id });
        uploaded++;
      } catch {
        showToast(`Failed to upload ${file.name}`, 'error');
      }
    }

    await load();

    if (uploaded) showToast(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded!`);
    setUploading(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this image?')) return;
    try {
      await deleteGalleryImage(id);
      setImages(imgs => imgs.filter(i => i.id !== id));
      showToast('Deleted');
    } catch { showToast('Delete failed', 'error'); }
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

    const updated = [...images];
    const fromIndex = updated.findIndex(img => img.id === draggedId);
    const toIndex = updated.findIndex(img => img.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    const reordered = updated.map((img, index) => ({
      ...img,
      sort_order: index + 1,
    }));

    setImages(reordered);
    setDraggedId(null);
    setDragOverId(null);

    try {
      await reorderGallery(
        reordered.map(img => ({
          id: img.id,
          sort_order: img.sort_order,
        }))
      );

      showToast('Gallery order updated');
      await load();
    } catch (err) {
      console.error('Drag reorder failed:', err);
      showToast('Failed to save gallery order', 'error');
      await load();
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const toggleActive = async (img) => {
    try {
      const updated = await updateGalleryImage(img.id, { is_active: !img.is_active });
      setImages(imgs => imgs.map(i => i.id === updated.id ? updated : i));
    } catch { showToast('Update failed', 'error'); }
  };

  return (
    <div>
      <div className="section-hd">
        <div>
          <div className="section-hd-title">Gallery</div>
          <div className="section-hd-sub">{images.length} image{images.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Upload zone */}
      <div className="a-card">
        <div className="a-card-title">Upload Images</div>
        <label
          className={`upload-zone${drag ? ' drag' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        >
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} />
          {uploading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <div className="spinner" />
              <span style={{ color: 'var(--text-dim)' }}>Uploading…</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>📷</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop images here or click to browse</div>
              <div className="upload-hint">JPG, PNG, WebP — max 10MB each. Multiple files supported.</div>
            </>
          )}
        </label>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : images.length === 0 ? (
        <div className="empty-state">No images yet. Upload your first gallery photo above.</div>
      ) : (
        <div className="a-card">
          <div className="a-card-title">Uploaded Images ({images.length})</div>
          <div className="gallery-admin-grid">
            {images.map(img => (
              <div
                key={img.id}
                className="gallery-admin-item"
                draggable
                onDragStart={() => handleDragStart(img.id)}
                onDragOver={(e) => handleDragOver(e, img.id)}
                onDrop={() => handleDrop(img.id)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: img.is_active ? 1 : 0.4,
                  border: dragOverId === img.id ? '2px solid var(--accent, #8b5cf6)' : '2px solid transparent',
                  cursor: 'grab',
                }}
              >
                <img src={img.thumbnail_url || img.url} alt={img.caption || 'Gallery'} loading="lazy" />
                <div className="gallery-admin-item-overlay">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>

                    <button
                      className="btn-icon"
                      onClick={() => toggleActive(img)}
                      title={img.is_active ? 'Hide' : 'Show'}
                      style={{ color: img.is_active ? 'var(--green)' : 'var(--text-muted)' }}
                    >
                      {img.is_active ? '👁' : '🙈'}
                    </button>

                    <button className="btn-icon danger" onClick={() => remove(img.id)} title="Delete">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="info-box" style={{ marginTop: 14 }}>
            Drag and drop images to reorder them. Dimmed images are hidden from the public site. Click the eye icon to toggle visibility.
          </div>
        </div>
      )}
    </div>
  );
}
