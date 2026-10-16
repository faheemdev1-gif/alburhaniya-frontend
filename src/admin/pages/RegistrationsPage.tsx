import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { PageHeader, Btn, Spinner, EmptyState } from '../components/Shared';
import './SubscribersPage.css';
import './MessagesPage.css';

type Registration = { _id: string; firstName: string; lastName: string; email: string; phone: string; notes: string; places: number; createdAt: string; organiserNotificationStatus: string; confirmationNotificationStatus: string };
export default function RegistrationsPage() {
  const { id } = useParams();
  const [rows, setRows] = useState<Registration[]>([]);
  const [title, setTitle] = useState('Event registrations');
  const [page, setPage] = useState(1), [total, setTotal] = useState(0), [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true), [working, setWorking] = useState(false), [configured, setConfigured] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    api.get(`/events/${id}/registrations`, { params: { page } }).then(({ data }) => {
      if (active) { setRows(data.registrations); setTitle(data.event.title); setTotal(data.total); setConfigured(data.emailConfigured); }
    }).catch(err => { if (active) { setRows([]); setError(err.response?.data?.message || 'Registrations could not be loaded.'); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, page, reload]);
  async function retry(row: Registration) {
    if (working) return;
    setWorking(true); setError(''); setNotice('');
    try { const { data } = await api.post(`/events/${id}/registrations/${row._id}/notify`); setNotice(data.message); setReload(n => n + 1); }
    catch (err: any) { setError(err.response?.data?.message || 'Email retry failed.'); }
    finally { setWorking(false); }
  }
  return <div><PageHeader title={title} subtitle="Saved event registrations and email status" action={<Btn variant="secondary" disabled={loading || working} onClick={() => setReload(n => n + 1)}>Refresh</Btn>} />
    <p><Link to="/admin/events">← Back to events</Link></p>
    {!loading && !configured && <p className="messages-note">Registrations are saved. Configure backend SMTP settings to send organiser and attendee emails.</p>}
    {error && <p role="alert" className="messages-note">{error}</p>}{notice && <p role="status" className="messages-note">{notice}</p>}
    {loading ? <Spinner /> : rows.length === 0 ? <EmptyState icon="◈" title="No registrations" body="Saved registrations will appear here." /> : <div className="subscriber-table-wrap"><table className="subscriber-table"><thead><tr><th>Attendee</th><th>Places / received</th><th>Notes</th><th>Email status</th></tr></thead><tbody>{rows.map(row => <tr key={row._id}>
      <td>{row.firstName} {row.lastName}<small>{row.email}</small><small>{row.phone || 'No phone supplied'}</small><small>Ref: {row._id}</small></td><td>{row.places}<small>{new Date(row.createdAt).toLocaleString()}</small></td><td style={{ whiteSpace: 'pre-wrap' }}>{row.notes || '—'}</td><td><small>Organiser: {row.organiserNotificationStatus}</small><small>Attendee: {row.confirmationNotificationStatus}</small>{(row.organiserNotificationStatus !== 'sent' || row.confirmationNotificationStatus !== 'sent') && <Btn small disabled={working || !configured} onClick={() => retry(row)}>Retry emails</Btn>}</td>
    </tr>)}</tbody></table></div>}
    <p className="subscriber-help">“Sent” means the mail server accepted the email. Check the inbox and spam folder for delivery.</p>
    <div className="messages-pagination"><Btn small disabled={page === 1 || loading || working} onClick={() => setPage(n => n - 1)}>Previous</Btn><span>Page {page} · {total} registrations</span><Btn small disabled={page * 25 >= total || loading || working} onClick={() => setPage(n => n + 1)}>Next</Btn></div>
  </div>;
}
