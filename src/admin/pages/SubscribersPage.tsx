import { useEffect, useRef, useState, type FormEvent } from 'react';
import api from '../../services/api';
import { PageHeader, Btn, Spinner, EmptyState } from '../components/Shared';
import './MessagesPage.css';
import './SubscribersPage.css';

type Subscriber = { _id: string; email: string; status: string; notificationStatus: string; createdAt: string; requestedAt?: string; confirmedAt?: string };
export default function SubscribersPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [remove, setRemove] = useState<Subscriber | null>(null);
  useEffect(() => {
    let active = true; setLoading(true); setError(''); setRows([]); setTotal(0); setConfigured(null);
    api.get('/newsletter', { params: { status, search, page } }).then(({ data }) => {
      if (active) { setRows(data.subscribers); setTotal(data.total); setConfigured(data.emailConfigured); }
    }).catch(err => { if (active) setError(err.response?.data?.message || 'Subscribers could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, search, page, reload]);
  async function change(row: Subscriber, action: 'resend' | 'unsubscribe') {
    if (pending.current) return;
    pending.current = true; setWorking(true); setError(''); setNotice('');
    try {
      const { data } = await api.post(`/newsletter/${row._id}/${action}`);
      setNotice(data.message); setRemove(null); setReload(n => n + 1);
    } catch (err: any) { setError(err.response?.data?.message || 'The subscriber could not be updated.'); setRemove(null); }
    finally { pending.current = false; setWorking(false); }
  }
  async function exportCsv() {
    if (pending.current) return;
    pending.current = true; setWorking(true); setError('');
    try {
      const { data } = await api.get('/newsletter/export', { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a'); a.href = url; a.download = 'newsletter-subscribers.csv'; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('Subscribers could not be exported. Please try again.'); }
    finally { pending.current = false; setWorking(false); }
  }
  function find(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setSearch(draft.trim()); setPage(1); }
  return <div>
    <PageHeader title="Subscribers" subtitle="Newsletter sign-ups. Only confirmed subscribers are included in exports." action={<div className="subscriber-actions"><Btn variant="secondary" onClick={() => setReload(n => n + 1)} disabled={loading || working}>Refresh</Btn><Btn onClick={exportCsv} disabled={loading || working}>Export confirmed CSV</Btn></div>} />
    {configured === false && <p className="messages-note">Sign-ups are saved as pending. Configure backend SMTP settings, then resend confirmation emails. Pending addresses are excluded from exports.</p>}
    <p className="subscriber-help">Confirmation links expire after 48 hours. Resends have a one-minute cooldown. Send newsletters using your mailing service and include an unsubscribe link; this page manages sign-ups.</p>
    {error && <p className="messages-note" role="alert">{error}</p>}
    {notice && <p className="messages-note" role="status">{notice}</p>}
    <div className="subscriber-toolbar">
      <label>Status <select className="admin-input" value={status} disabled={working} onChange={e => { setStatus(e.target.value); setPage(1); }}>{['all', 'pending', 'confirmed', 'unsubscribed'].map(s => <option key={s} value={s}>{s}</option>)}</select></label>
      <form onSubmit={find}><label className="visually-hidden" htmlFor="subscriber-search">Search subscriber emails</label><input className="admin-input" id="subscriber-search" placeholder="Search email addresses" maxLength={254} value={draft} disabled={working} onChange={e => setDraft(e.target.value)} /><Btn type="submit" variant="secondary" disabled={loading || working}>Search</Btn></form>
    </div>
    {loading ? <Spinner /> : rows.length === 0 ? <EmptyState icon="✉" title={error ? 'Subscribers unavailable' : 'No subscribers found'} body={error ? 'Use Refresh to try again.' : 'Newsletter sign-ups will appear here.'} /> :
      <div className="subscriber-table-wrap"><table className="subscriber-table"><thead><tr><th scope="col">Email</th><th scope="col">Status</th><th scope="col">Requested / confirmed</th><th scope="col">Actions</th></tr></thead><tbody>{rows.map(row => <tr key={row._id}>
        <td>{row.email}<small>Email: {row.notificationStatus === 'sent' ? 'accepted by mail server' : row.notificationStatus}</small></td>
        <td>{row.status}</td><td>{new Date(row.requestedAt || row.createdAt).toLocaleDateString()}{row.confirmedAt && <small>Confirmed {new Date(row.confirmedAt).toLocaleDateString()}</small>}</td>
        <td><div className="subscriber-actions">{row.status === 'pending' && <Btn small disabled={working || !configured} onClick={() => change(row, 'resend')}>Resend confirmation</Btn>}{row.status !== 'unsubscribed' && <Btn small variant="danger" disabled={working} onClick={() => setRemove(row)}>Unsubscribe</Btn>}</div></td>
      </tr>)}</tbody></table></div>}
    <div className="messages-pagination"><Btn small disabled={page === 1 || loading || working} onClick={() => setPage(p => p - 1)}>Previous</Btn><span>Page {page} · {total} subscribers</span><Btn small disabled={page * 25 >= total || loading || working} onClick={() => setPage(p => p + 1)}>Next</Btn></div>
    {remove && <div className="modal-backdrop"><div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="unsubscribe-title"><p className="modal-msg" id="unsubscribe-title">Unsubscribe {remove.email} from the newsletter?</p><div className="modal-actions"><Btn variant="ghost" disabled={working} onClick={() => setRemove(null)}>Cancel</Btn><Btn variant="danger" disabled={working} onClick={() => change(remove, 'unsubscribe')}>{working ? 'Working…' : 'Unsubscribe'}</Btn></div></div></div>}
  </div>;
}
