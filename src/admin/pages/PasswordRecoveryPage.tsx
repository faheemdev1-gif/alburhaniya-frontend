import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../../services/api';
import './Login.css';

export default function PasswordRecoveryPage({ action }: { action: 'request' | 'reset' }) {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [invalidLink, setInvalidLink] = useState(action === 'reset' && !/^[a-f0-9]{64}$/.test(token));
  const pending = useRef(false);
  const { logout } = useAuth();
  const reset = action === 'reset';

  useEffect(() => {
    // Keep the reset credential in memory only, and out of browser history.
    if (reset && window.location.hash) window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  }, [reset]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    setError('');
    if (reset && password !== confirmPassword) { setError('The passwords do not match.'); return; }
    if (reset && (password.length < 8 || new TextEncoder().encode(password).length > 72)) {
      setError('Use at least 8 characters and no more than 72 bytes.'); return;
    }
    pending.current = true; setBusy(true);
    try {
      const response = await api.post(`/auth/${reset ? 'reset-password' : 'forgot-password'}`, reset
        ? { token, newPassword: password, confirmPassword }
        : { email: email.trim().toLowerCase() }, { timeout: 15000 });
      setMessage(response.data.message);
      if (reset) { logout(); setPassword(''); setConfirmPassword(''); }
    } catch (err: any) {
      const status = err.response?.status;
      if (reset && status === 400 && /link.*(invalid|expired)/i.test(err.response?.data?.message || '')) setInvalidLink(true);
      setError(status === 404 ? 'Password recovery is temporarily unavailable. Please contact the site administrator.' :
        err.response?.data?.message || 'The request could not be completed. Please try again.');
    } finally { pending.current = false; setBusy(false); }
  }

  return (
    <div className="login-root">
      <div className="login-bg" aria-hidden="true"><div className="login-bg-circle c1" /><div className="login-bg-circle c2" /><div className="login-bg-grid" /></div>
      <div className="login-card">
        <div className="login-brand"><div className="login-logo">AB</div><div className="login-brand-text"><span className="login-brand-name">Al-Burhaniya</span><span className="login-brand-sub">Admin Portal</span></div></div>
        <h1 className="login-title">{reset ? 'Reset password' : 'Forgot password?'}</h1>
        <p className="login-desc">{reset ? 'Choose a new password for your admin account.' : 'Enter the email address you use to sign in to the admin panel.'}</p>
        {message ? <>
          <p className="login-success" role="status">{message}</p>
          {!reset && <p className="login-help">The link expires in 15 minutes. If you request another, use the most recent email.</p>}
        </> : invalidLink ? <>
          <p className="login-error" role="alert">This reset link is invalid or has expired. Request a new one.</p>
          <Link className="login-link" to="/admin/forgot-password">Request a new reset link</Link>
        </> : <form onSubmit={submit} className="login-form" aria-busy={busy}>
          {reset ? <>
            <div className="login-field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required disabled={busy} autoFocus aria-describedby="password-hint" /></div>
            <p id="password-hint" className="login-help">Use at least 8 characters. A long, unique password is best.</p>
            <div className="login-field"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required disabled={busy} /></div>
          </> : <div className="login-field"><label htmlFor="recovery-email">Account email</label><input id="recovery-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" maxLength={254} required disabled={busy} autoFocus /></div>}
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="login-btn" disabled={busy}>{busy ? (reset ? 'Resetting…' : 'Sending…') : (reset ? 'Reset password' : 'Send reset link')}</button>
        </form>}
        <Link className="login-link login-back" to="/admin/login">Back to sign in</Link>
      </div>
    </div>
  );
}
