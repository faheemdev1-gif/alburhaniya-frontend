import { useEffect, useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminArticles } from '../services/adminApi';
import { PageHeader, Field, Btn, Spinner } from '../components/Shared';
import api from '../../services/api';
import './FormPage.css';

const CATEGORY_OPTIONS = [
  { value: 'community', label: 'Community' },
  { value: 'youth',     label: 'Youth' },
  { value: 'culture',   label: 'Culture' },
  { value: 'sports',    label: 'Sports' },
  { value: 'seniors',   label: 'Seniors' },
  { value: 'arts',      label: 'Arts' },
];

const CATEGORY_LABELS: Record<string, string> = {
  community: 'Community', youth: 'Youth', culture: 'Culture',
  sports: 'Sports', seniors: 'Seniors', arts: 'Arts',
};

const EMPTY = {
  title: '', categoryKey: 'community', dateISO: '', author: '',
  authorRole: '', authorAvatar: '', readTime: '5 min read',
  excerpt: '', image: '', content: '', tags: '',
  published: true, featured: false,
};

export default function ArticleFormPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form,        setForm]        = useState(EMPTY);
  const [loading,     setLoading]     = useState(isEdit);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');

  // ── Load existing article (edit mode) ──────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    adminArticles.get(id!).then(res => {
      const a = res.data;
      setForm({
        title:        a.title        || '',
        categoryKey:  a.categoryKey  || 'community',
        dateISO:      a.dateISO      || '',
        author:       a.author       || '',
        authorRole:   a.authorRole   || '',
        authorAvatar: a.authorAvatar || '',
        readTime:     a.readTime     || '5 min read',
        excerpt:      a.excerpt      || '',
        image:        a.image        || '',
        content:      a.content      || '',
        tags:         Array.isArray(a.tags) ? a.tags.join(', ') : '',
        published:    a.published    ?? true,
        featured:     a.featured     ?? false,
      });
    }).catch(() => navigate('/admin/articles')).finally(() => setLoading(false));
  }, [id]);

  // ── Field helpers ──────────────────────────────────────────────
  const set = (field: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const toggle = (field: string) => () =>
    setForm(f => ({ ...f, [field]: !(f as any)[field] }));

  // ── Image upload ───────────────────────────────────────────────
  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPEG, PNG, GIF, or WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      // Title and category are required by the gallery endpoint
      formData.append('title',    form.title || file.name.replace(/\.[^.]+$/, ''));
      formData.append('category', 'general');

      const { data } = await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Auto-fill the image URL field with what the server returned
      setForm(f => ({ ...f, image: data.imageUrl }));
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        category: CATEGORY_LABELS[form.categoryKey] || form.categoryKey,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        await adminArticles.update(id!, payload);
      } else {
        await adminArticles.create(payload);
      }
      navigate('/admin/articles');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="form-page">
      <PageHeader
        title={isEdit ? 'Edit Article' : 'New Article'}
        subtitle={isEdit ? 'Update the article details below' : 'Fill in the details to create a new article'}
        action={
          <Btn variant="ghost" onClick={() => navigate('/admin/articles')}>← Back</Btn>
        }
      />

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid-2">
          <Field label="Title" required>
            <input
              className="admin-input"
              value={form.title}
              onChange={set('title')}
              required
              placeholder="Article title"
            />
          </Field>
          <Field label="Category" required>
            <select className="admin-select" value={form.categoryKey} onChange={set('categoryKey')}>
              {CATEGORY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="form-grid-2">
          <Field label="Date" required>
            <input
              className="admin-input"
              type="date"
              value={form.dateISO}
              onChange={set('dateISO')}
              required
            />
          </Field>
          <Field label="Read Time">
            <input
              className="admin-input"
              value={form.readTime}
              onChange={set('readTime')}
              placeholder="5 min read"
            />
          </Field>
        </div>

        <div className="form-grid-2">
          <Field label="Author" required>
            <input
              className="admin-input"
              value={form.author}
              onChange={set('author')}
              required
              placeholder="Author name"
            />
          </Field>
          <Field label="Author Role">
            <input
              className="admin-input"
              value={form.authorRole}
              onChange={set('authorRole')}
              placeholder="e.g. Editor"
            />
          </Field>
        </div>

        <Field label="Author Avatar URL">
          <input
            className="admin-input"
            value={form.authorAvatar}
            onChange={set('authorAvatar')}
            placeholder="https://… or /uploads/avatar.jpg"
          />
        </Field>

        {/* ── Cover Image ─────────────────────────────────────── */}
        <Field
          label="Cover Image"
          required
          hint="Upload a file or paste a URL directly below"
        >
          {/* Upload button */}
          <div className="image-upload-row">
            <button
              type="button"
              className="image-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <><span className="upload-spinner" /> Uploading…</>
                : <><UploadIcon /> Upload Image</>}
            </button>

            <span className="image-upload-or">or</span>

            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            {/* Manual URL input */}
            <input
              className="admin-input image-url-input"
              value={form.image}
              onChange={set('image')}
              required
              placeholder="https://… or /uploads/image.jpg"
            />
          </div>

          {/* Upload error */}
          {uploadError && (
            <p className="upload-error-msg">{uploadError}</p>
          )}

          {/* Image preview */}
          {form.image && (
            <div className="form-img-preview-wrap">
              <img
                src={form.image.startsWith('http') ? form.image : `http://localhost:5000${form.image}`}
                alt="Cover preview"
                className="form-img-preview"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <button
                type="button"
                className="image-clear-btn"
                onClick={() => setForm(f => ({ ...f, image: '' }))}
                title="Remove image"
              >
                ✕ Remove
              </button>
            </div>
          )}
        </Field>

        <Field label="Tags" hint="Comma-separated, e.g. community, events, 2025">
          <input
            className="admin-input"
            value={form.tags}
            onChange={set('tags')}
            placeholder="tag1, tag2, tag3"
          />
        </Field>

        <Field label="Excerpt" required>
          <textarea
            className="admin-textarea"
            value={form.excerpt}
            onChange={set('excerpt')}
            required
            placeholder="Short summary shown in listings…"
            rows={3}
          />
        </Field>

        <Field label="Content" required hint="Full article body — HTML or plain text">
          <textarea
            className="admin-textarea"
            value={form.content}
            onChange={set('content')}
            required
            placeholder="Full article content…"
            rows={14}
          />
        </Field>

        <div className="form-toggles">
          <label className="admin-toggle">
            <input type="checkbox" checked={form.published} onChange={toggle('published')} />
            <span className="admin-toggle-label">Published (visible on site)</span>
          </label>
          <label className="admin-toggle">
            <input type="checkbox" checked={form.featured} onChange={toggle('featured')} />
            <span className="admin-toggle-label">Featured (only one article can be featured at a time)</span>
          </label>
        </div>

        <div className="form-footer">
          <Btn variant="ghost" onClick={() => navigate('/admin/articles')}>Cancel</Btn>
          <Btn type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Article' : 'Create Article'}
          </Btn>
        </div>
      </form>
    </div>
  );
}

// ── Inline SVG icon (no extra dependency) ────────────────────────
function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginRight: 6 }}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}