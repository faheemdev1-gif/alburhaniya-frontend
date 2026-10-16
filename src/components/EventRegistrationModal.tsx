import { useEffect, useRef, useState, type FormEvent } from 'react';
import { registerForEvent, type ApiEvent, type RegistrationReceipt } from '../services/eventService';

export default function EventRegistrationModal({ event, onClose, onRegistered }: {
  event: ApiEvent; onClose: () => void; onRegistered: (receipt: RegistrationReceipt) => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const locked = useRef(false);
  const attempt = useRef<{ data: string; id: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLInputElement>('input')?.focus();
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked.current) onClose();
      if (e.key !== 'Tab') return;
      const fields = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)') || []).filter(el => el.tabIndex >= 0);
      const first = fields[0], last = fields.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keyboard); previous?.focus(); };
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked.current) return;
    const form = new FormData(e.currentTarget);
    const data = { firstName: String(form.get('firstName') || ''), lastName: String(form.get('lastName') || ''),
      email: String(form.get('email') || ''), phone: String(form.get('phone') || ''), notes: String(form.get('notes') || ''),
      places: Number(form.get('places')), website: String(form.get('website') || '') };
    const signature = JSON.stringify(data);
    if (attempt.current?.data !== signature) attempt.current = { data: signature, id: crypto.randomUUID() };
    locked.current = true; setBusy(true); setError('');
    try {
      const result = await registerForEvent(event._id, { ...data, submissionId: attempt.current!.id });
      setReceipt(result); onRegistered(result);
    } catch (err: any) { setError(err.response?.data?.message || 'We could not save your registration. Please try again; your form has been kept.'); }
    finally { locked.current = false; setBusy(false); }
  }
  return <div className="ev-modal-backdrop" onClick={() => { if (!locked.current) onClose(); }}>
    <div className="ev-modal-content" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="event-register-title" onClick={e => e.stopPropagation()}>
      <div className="ev-modal-header"><h5 className="modal-title" id="event-register-title">Register for Event</h5><button className="ev-modal-close" disabled={busy} aria-label="Close registration" onClick={onClose}><span aria-hidden="true">×</span></button></div>
      <div className="ev-modal-body">
        {receipt ? <div className="ev-modal-success" role="status"><div className="success-icon"><i className="bi bi-check-circle-fill" /></div><h4>You're registered!</h4><p>Your place(s) are saved for {event.title}.</p><p>Registration reference: <strong>{receipt.reference}</strong></p><p>Keep this reference for questions or changes.</p><button className="btn btn-primary-main mt-2" onClick={onClose}>Close</button></div> : <>
          <p className="ev-modal-event-title">{event.title}</p>
          {event.price.toLowerCase() !== 'free' && <p>Event price: {event.price}. This form reserves places; contact the organiser about payment.</p>}
          <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy} style={{ border: 0, padding: 0 }}><legend className="visually-hidden">Attendee details</legend><div className="row g-3">
            <div className="col-6"><label className="ev-form-label" htmlFor="registration-first">First Name</label><input id="registration-first" name="firstName" className="form-control ev-form-input" autoComplete="given-name" maxLength={80} required /></div>
            <div className="col-6"><label className="ev-form-label" htmlFor="registration-last">Last Name</label><input id="registration-last" name="lastName" className="form-control ev-form-input" autoComplete="family-name" maxLength={80} required /></div>
            <div className="col-12"><label className="ev-form-label" htmlFor="registration-email">Email Address</label><input id="registration-email" name="email" type="email" className="form-control ev-form-input" autoComplete="email" maxLength={254} required /></div>
            <div className="col-12"><label className="ev-form-label" htmlFor="registration-phone">Phone (optional)</label><input id="registration-phone" name="phone" type="tel" className="form-control ev-form-input" autoComplete="tel" maxLength={40} /></div>
            <div className="col-12"><label className="ev-form-label" htmlFor="registration-places">Number of places</label><select id="registration-places" name="places" className="form-select ev-form-input">{Array.from({ length: Math.min(4, Math.max(1, event.capacity - event.registered)) }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></div>
            <div className="col-12"><label className="ev-form-label" htmlFor="registration-notes">Anything we should know? (optional)</label><textarea id="registration-notes" name="notes" className="form-control ev-form-input" rows={3} maxLength={2000} /></div>
            <div className="visually-hidden" aria-hidden="true"><label htmlFor="registration-website">Website</label><input id="registration-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          </div><p className="ev-reg-note">Your details will be used to manage this event registration.</p><div className="ev-modal-actions mt-3"><button type="submit" className="btn-register-submit w-100">{busy ? 'Saving registration…' : 'Confirm Registration'}</button></div></fieldset>
          {error && <p className="mt-3" role="alert">{error}</p>}</form>
        </>}
      </div>
    </div>
  </div>;
}
