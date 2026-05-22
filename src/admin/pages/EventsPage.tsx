import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEvents } from '../services/adminApi';
import { PageHeader, Badge, Btn, Spinner, EmptyState, ConfirmModal } from '../components/Shared';

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      const res = await adminEvents.list(params);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [search, status]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminEvents.delete(deleteId);
      setEvents(prev => prev.filter(e => e._id !== deleteId));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="list-page">
      <PageHeader
        title="Events"
        subtitle={`${events.length} event${events.length !== 1 ? 's' : ''} total`}
        action={<Btn onClick={() => navigate('/admin/events/new')}>+ New Event</Btn>}
      />

      <div className="list-filters">
        <input
          className="admin-input list-search"
          placeholder="Search events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="list-tabs">
          {['all','upcoming','past'].map(s => (
            <button
              key={s}
              className={`list-tab ${status === s ? 'active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : events.length === 0 ? (
        <EmptyState icon="◈" title="No events found" body="Create your first event to get started." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id}>
                  <td>
                    <div className="table-title-cell">
                      <div className="table-thumb">
                        {ev.thumbImage || ev.image
                          ? <img src={(ev.thumbImage || ev.image).startsWith('http') ? (ev.thumbImage || ev.image) : `http://localhost:5000${ev.thumbImage || ev.image}`} alt="" />
                          : <span>◈</span>
                        }
                      </div>
                      <div>
                        <div className="table-primary">{ev.title}</div>
                        <div className="table-secondary">{ev.organiser}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-muted">{ev.dateLabel}</td>
                  <td className="table-muted">{ev.location}</td>
                  <td><Badge label={ev.categoryKey} /></td>
                  <td>
                    <Badge
                      label={ev.featured ? 'Featured' : ev.status}
                      variant={ev.featured ? 'warning' : ev.status === 'upcoming' ? 'info' : 'default'}
                    />
                  </td>
                  <td>
                    <div className="table-actions">
                      <Btn small variant="secondary" onClick={() => navigate(`/admin/events/${ev._id}`)}>Edit</Btn>
                      <Btn small variant="danger" onClick={() => setDeleteId(ev._id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Delete this event? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}