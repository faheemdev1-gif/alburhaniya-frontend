import { useRef, useState, type FormEvent } from 'react';
import api from '../../services/api';

export default function NewsletterForm() {
  const pending = useRef(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    pending.current = true; setSending(true); setMessage(''); setError('');
    try {
      const result = await api.post('/newsletter/subscribe', { email: data.get('email'), website: data.get('website') });
      setMessage(result.data.message);
      if (result.data.confirmationAvailable) form.reset();
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Newsletter sign-up is temporarily unavailable. Please try again later.' :
        err.response?.data?.message || 'We could not complete your subscription. Please try again; your email address has been kept.');
    } finally { pending.current = false; setSending(false); }
  }
  return <form className="nl-form" onSubmit={subscribe} aria-busy={sending} aria-label="Newsletter sign-up">
    <fieldset className="nl-inputs" disabled={sending}>
      <legend className="visually-hidden">Subscribe to our newsletter</legend>
      <label htmlFor="newsletter-email" className="visually-hidden">Newsletter email address</label>
      <input id="newsletter-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="Your email address" required aria-describedby="newsletter-consent newsletter-result" />
      <div className="visually-hidden" aria-hidden="true"><label htmlFor="newsletter-website">Website</label><input id="newsletter-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <button type="submit">{sending ? 'Subscribing…' : 'Subscribe'} <i className="bi bi-arrow-right" aria-hidden="true" /></button>
    </fieldset>
    <small id="newsletter-consent" className="nl-consent">By subscribing, you agree to receive our news, events and community updates. Confirm by email; unsubscribe at any time.</small>
    <div id="newsletter-result">{message && <p className="nl-feedback" role="status">{message}</p>}{error && <p className="nl-feedback" role="alert">{error}</p>}</div>
  </form>;
}
