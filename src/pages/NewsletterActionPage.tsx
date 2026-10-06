import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function NewsletterActionPage({ action }: { action: 'confirm' | 'unsubscribe' }) {
  // Fragments stay out of server access logs and HTTP referrers.
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const confirm = action === 'confirm';
  async function submit() {
    if (pending.current || !token) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const { data } = await api.post(`/newsletter/${action}`, { token });
      setMessage(data.message);
      window.history.replaceState(null, '', window.location.pathname);
    } catch (err: any) { setError(err.response?.data?.message || 'We could not complete your request. Please try again.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <main className="container py-5 newsletter-action" style={{ minHeight: '50vh', maxWidth: 720 }}>
    <h1 className="section-heading">{confirm ? 'Confirm your subscription' : 'Unsubscribe from our newsletter'}</h1>
    {message ? <p className="alert alert-success" role="status">{message}</p> : <>
      <p>{confirm ? 'Select the button below to receive Al-Burhaniya news, events and community updates.' : 'Select the button below to stop receiving Al-Burhaniya newsletter emails.'}</p>
      {!token && <p role="alert">This link is missing its token. Open the complete link from your email{confirm ? ', or subscribe again on our homepage' : ''}.</p>}
      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      <button className="btn btn-primary-main my-3" type="button" onClick={submit} disabled={busy || !token}>{busy ? 'Working…' : confirm ? 'Confirm subscription' : 'Unsubscribe'}</button>
    </>}
    <p><Link to="/">Back to homepage</Link></p>
  </main>;
}
