import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminEvents } from '../services/adminApi';
import { PageHeader, Field, Btn, Spinner } from '../components/Shared';
import './FormPage.css';

const CATEGORY_OPTIONS = [
  { value: 'gathering', label: 'Gathering' },
  { value: 'music',     label: 'Music' },
  { value: 'dance',     label: 'Dance' },
  { value: 'arts',      label: 'Arts' },
  { value: 'sports',    label: 'Sports' },
  { value: 'youth',     label: 'Youth' },
  { value: 'seniors',   label: 'Seniors' },
];

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

function parseDateISO(iso: string) {
  if (!iso) return { day: '', month: '', year: '' };
  const d = new Date(iso);
  return {
    day: String(d.getDate()),
    month: MONTH_NAMES[d.getMonth()],
    year: String(d.getFullYear()),
  };
}

interface ScheduleItem { time: string; item: string; }

const EMPTY_FORM = {
  title: '', categoryKey: 'gathering', dateISO: '', dateLabel: '',
  timeStart: '', timeEnd: '', location: '', address: '',
  capacity: '', price: 'Free', organiser: '',
  image: '', thumbImage: '', tags: '',
  shortDesc: '', fullDesc: '',
  featured: false,
  highlights: '',
};

export default function EventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([{ time: '', item: '' }]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    adminEvents.get(id!).then(res => {
      const ev = res.data;
      setForm({
        title: ev.title || '',
        categoryKey: ev.categoryKey || 'gathering',
        dateISO: ev.dateISO || '',
        dateLabel: ev.dateLabel || '',
        timeStart: ev.timeStart || '',
        timeEnd: ev.timeEnd || '',
        location: ev.location || '',
        address: ev.address || '',
        capacity: ev.capacity?.toString() || '',
        price: ev.price || 'Free',
        organiser: ev.organiser || '',
        image: ev.image || '',
        thumbImage: ev.thumbImage || '',
        tags: Array.isArray(ev.tags) ? ev.tags.join(', ') : '',
        shortDesc: ev.shortDesc || '',
        fullDesc: ev.fullDesc || '',
        featured: ev.featured ?? false,
        highlights: Array.isArray(ev.highlights) ? ev.highlights.join('\n') : '',
      });
      setSchedule(ev.schedule?.length ? ev.schedule : [{ time: '', item: '' }]);
    }).catch(() => navigate('/admin/events')).finally(() => setLoading(false));
  }, [id]);

  const set = (field: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setForm(f => {
      const updated: any = { ...f, [field]: val };
      // Auto-fill dateLabel, day, month, year when dateISO changes
      if (field === 'dateISO' && val) {
        const d = new Date(val);
        updated.dateLabel = `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      }
      return updated;
    });
  };

  const toggle = (field: string) => () => setForm(f => ({ ...f, [field]: !(f as any)[field] }));

  const setScheduleRow = (i: number, key: 'time' | 'item', val: string) => {
    setSchedule(s => s.map((row, idx) => idx === i ? { ...row, [key]: val } : row));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { day, month, year } = parseDateISO(form.dateISO);
      const payload = {
        ...form,
        category: CATEGORY_OPTIONS.find(c => c.value === form.categoryKey)?.label || form.categoryKey,
        capacity: Number(form.capacity) || 0,
        day, month, year,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        highlights: form.highlights.split('\n').map(h => h.trim()).filter(Boolean),
        schedule: schedule.filter(s => s.time && s.item),
      };
      if (isEdit) {
        await adminEvents.update(id!, payload);
      } else {
        await adminEvents.create(payload);
      }
      navigate('/admin/events');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="form-page">
      <PageHeader
        title={isEdit ? 'Edit Event' : 'New Event'}
        subtitle={isEdit ? 'Update event details below' : 'Fill in the details to create a new event'}
        action={<Btn variant="ghost" onClick={() => navigate('/admin/events')}>← Back</Btn>}
      />

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <div className="form-error">{error}</div>}

        {/* Basic Info */}
        <div className="form-section-label">Basic Information</div>
        <div className="form-grid-2">
          <Field label="Title" required>
            <input className="admin-input" value={form.title} onChange={set('title')} required placeholder="Event title" />
          </Field>
          <Field label="Category" required>
            <select className="admin-select" value={form.categoryKey} onChange={set('categoryKey')}>
              {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="form-grid-2">
          <Field label="Organiser" required>
            <input className="admin-input" value={form.organiser} onChange={set('organiser')} required placeholder="Organiser name" />
          </Field>
          <Field label="Price">
            <input className="admin-input" value={form.price} onChange={set('price')} placeholder="Free" />
          </Field>
        </div>

        {/* Date & Time */}
        <div className="form-section-label">Date & Time</div>
        <div className="form-grid-3">
          <Field label="Date" required>
            <input className="admin-input" type="date" value={form.dateISO} onChange={set('dateISO')} required />
          </Field>
          <Field label="Start Time" required>
            <input className="admin-input" type="time" value={form.timeStart} onChange={set('timeStart')} required />
          </Field>
          <Field label="End Time" required>
            <input className="admin-input" type="time" value={form.timeEnd} onChange={set('timeEnd')} required />
          </Field>
        </div>

        {/* Location */}
        <div className="form-section-label">Location</div>
        <div className="form-grid-2">
          <Field label="Venue Name" required>
            <input className="admin-input" value={form.location} onChange={set('location')} required placeholder="e.g. Community Hall" />
          </Field>
          <Field label="Capacity">
            <input className="admin-input" type="number" value={form.capacity} onChange={set('capacity')} placeholder="0 = unlimited" min={0} />
          </Field>
        </div>
        <Field label="Full Address" required>
          <input className="admin-input" value={form.address} onChange={set('address')} required placeholder="123 Main St, Manchester, M1 1AB" />
        </Field>

        {/* Images */}
        <div className="form-section-label">Images</div>
        <div className="form-grid-2">
          <Field label="Main Image URL" required hint="Full URL or /uploads/filename.jpg">
            <input className="admin-input" value={form.image} onChange={set('image')} required placeholder="/uploads/event.jpg" />
            {form.image && (
              <img
                src={form.image.startsWith('http') ? form.image : `http://localhost:5000${form.image}`}
                alt="preview" className="form-img-preview"
              />
            )}
          </Field>
          <Field label="Thumbnail Image URL" required hint="Smaller version for cards">
            <input className="admin-input" value={form.thumbImage} onChange={set('thumbImage')} required placeholder="/uploads/event-thumb.jpg" />
            {form.thumbImage && (
              <img
                src={form.thumbImage.startsWith('http') ? form.thumbImage : `http://localhost:5000${form.thumbImage}`}
                alt="thumb preview" className="form-img-preview"
              />
            )}
          </Field>
        </div>

        {/* Descriptions */}
        <div className="form-section-label">Descriptions</div>
        <Field label="Short Description" required hint="Shown on event cards">
          <textarea className="admin-textarea" value={form.shortDesc} onChange={set('shortDesc')} required rows={3} placeholder="Brief summary…" />
        </Field>
        <Field label="Full Description" required hint="Shown on the event detail page">
          <textarea className="admin-textarea" value={form.fullDesc} onChange={set('fullDesc')} required rows={8} placeholder="Full event details…" />
        </Field>

        {/* Tags */}
        <Field label="Tags" hint="Comma-separated">
          <input className="admin-input" value={form.tags} onChange={set('tags')} placeholder="music, community, 2025" />
        </Field>

        {/* Highlights */}
        <div className="form-section-label">Highlights</div>
        <Field label="Highlights" hint="One per line">
          <textarea className="admin-textarea" value={form.highlights} onChange={set('highlights')} rows={4} placeholder={"Live performances\nFood stalls\nFamily activities"} />
        </Field>

        {/* Schedule */}
        <div className="form-section-label">Schedule</div>
        <div className="schedule-list">
          {schedule.map((row, i) => (
            <div key={i} className="schedule-row">
              <input
                className="admin-input schedule-time"
                value={row.time}
                onChange={e => setScheduleRow(i, 'time', e.target.value)}
                placeholder="10:00 AM"
              />
              <input
                className="admin-input schedule-item"
                value={row.item}
                onChange={e => setScheduleRow(i, 'item', e.target.value)}
                placeholder="Opening ceremony"
              />
              <button
                type="button"
                className="schedule-remove"
                onClick={() => setSchedule(s => s.filter((_, idx) => idx !== i))}
              >×</button>
            </div>
          ))}
          <button
            type="button"
            className="schedule-add"
            onClick={() => setSchedule(s => [...s, { time: '', item: '' }])}
          >+ Add Schedule Item</button>
        </div>

        {/* Toggles */}
        <div className="form-toggles">
          <label className="admin-toggle">
            <input type="checkbox" checked={form.featured} onChange={toggle('featured')} />
            <span className="admin-toggle-label">Featured Event</span>
          </label>
        </div>

        <div className="form-footer">
          <Btn variant="ghost" onClick={() => navigate('/admin/events')}>Cancel</Btn>
          <Btn type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Event' : 'Create Event'}
          </Btn>
        </div>
      </form>
    </div>
  );
}