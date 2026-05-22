import { useEffect, useState, useRef } from 'react';
import { adminGallery } from '../services/adminApi';
import { PageHeader, Badge, Btn, Spinner, EmptyState, ConfirmModal, Field } from '../components/Shared';
import './GalleryPage.css';

const CATEGORIES = ['gatherings','music','sports','arts','dance','general'];
const SIZES = ['normal','tall','wide'];

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await adminGallery.list();
      setItems(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminGallery.delete(deleteId);
      setItems(prev => prev.filter(i => i._id !== deleteId));
    } finally { setDeleteId(null); }
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div className="gallery-page">
      <PageHeader
        title="Gallery"
        subtitle={`${items.length} photo${items.length !== 1 ? 's' : ''}`}
        action={<Btn onClick={() => setShowUpload(true)}>+ Upload Photo</Btn>}
      />

      {/* Filter tabs */}
      <div className="list-filters">
        <div className="list-tabs">
          {['all', ...CATEGORIES].map(c => (
            <button
              key={c}
              className={`list-tab ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="▣" title="No photos yet" body="Upload your first photo to get started." />
      ) : (
        <div className="gallery-grid">
          {filtered.map(item => (
            <div key={item._id} className={`gallery-card size-${item.size || 'normal'}`}>
              <img
                src={item.imageUrl?.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
                alt={item.title}
              />
              <div className="gallery-card-overlay">
                <div className="gallery-card-info">
                  <span className="gallery-card-title">{item.title}</span>
                  <Badge label={item.category} />
                </div>
                <button
                  className="gallery-delete-btn"
                  onClick={() => setDeleteId(item._id)}
                  title="Delete"
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Delete this photo? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); fetchItems(); }}
        />
      )}
    </div>
  );
}

/* ── Upload Modal ── */
function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [size, setSize] = useState('normal');
  const [order, setOrder] = useState('0');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select an image'); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', title);
      fd.append('category', category);
      fd.append('size', size);
      fd.append('order', order);
      await adminGallery.create(fd);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box upload-modal">
        <div className="upload-modal-header">
          <h2>Upload Photo</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {error && <div className="form-error">{error}</div>}

          {/* Drop zone */}
          <div
            className={`upload-drop ${preview ? 'has-preview' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            {preview
              ? <img src={preview} alt="preview" className="upload-preview-img" />
              : (
                <div className="upload-drop-inner">
                  <span className="upload-drop-icon">▣</span>
                  <span>Click to select an image</span>
                  <span className="upload-drop-hint">JPG, PNG, WebP — max 10MB</span>
                </div>
              )
            }
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>

          <Field label="Title" required>
            <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Photo title" />
          </Field>

          <div className="form-grid-2">
            <Field label="Category">
              <select className="admin-select" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Display Size" hint="Controls grid layout">
              <select className="admin-select" value={size} onChange={e => setSize(e.target.value)}>
                {SIZES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Display Order" hint="Lower = shows first">
            <input className="admin-input" type="number" value={order} onChange={e => setOrder(e.target.value)} min={0} />
          </Field>

          <div className="form-footer">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" disabled={saving || !file}>
              {saving ? 'Uploading…' : 'Upload Photo'}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}