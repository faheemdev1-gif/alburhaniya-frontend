import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import api from '../services/api';
import { DONATION_PRESETS, parseDonationAmount } from '../services/donationAmount';

type DonationContextValue = {
  selected: number | 'custom'; custom: string; amountPence: number | null; busy: boolean; error: string;
  choose: (amount: number) => void; enterCustom: (value: string) => void; checkout: () => Promise<void>;
};
function readSelection(): { selected: number | 'custom'; custom: string } {
  try {
    const stored = JSON.parse(sessionStorage.getItem('alburhaniya_donation_amount') || 'null');
    if (stored?.selected === 'custom' && typeof stored.custom === 'string' && stored.custom.length <= 9) return stored;
    if (DONATION_PRESETS.some(n => n === stored?.selected)) return { selected: stored.selected, custom: '' };
  } catch { /* Private browsing or unavailable storage must not block donations. */ }
  return { selected: 1000, custom: '' };
}
const DonationContext = createContext<DonationContextValue | null>(null);
export function DonationProvider({ children }: { children: ReactNode }) {
  const [{ selected, custom }, setSelection] = useState(readSelection);
  useEffect(() => {
    try { sessionStorage.setItem('alburhaniya_donation_amount', JSON.stringify({ selected, custom })); } catch { /* Optional persistence. */ }
  }, [selected, custom]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const attempt = useRef<{ amount: number; id: string } | null>(null);
  useEffect(() => {
    const resume = (event: PageTransitionEvent) => {
      if (event.persisted) { pending.current = false; attempt.current = null; setBusy(false); }
    };
    window.addEventListener('pageshow', resume);
    return () => window.removeEventListener('pageshow', resume);
  }, []);
  const amountPence = selected === 'custom' ? parseDonationAmount(custom) : selected;
  function choose(amount: number) {
    if (pending.current) return;
    setSelection({ selected: amount, custom: '' }); setError(''); attempt.current = null;
  }
  function enterCustom(value: string) {
    if (pending.current) return;
    setSelection({ selected: 'custom', custom: value }); setError(''); attempt.current = null;
  }
  async function checkout() {
    if (pending.current) return;
    if (amountPence === null) { setError('Enter an amount between £1.00 and £10,000.00, with no more than two decimal places.'); return; }
    pending.current = true; setBusy(true); setError('');
    let redirecting = false;
    try {
      if (!attempt.current || attempt.current.amount !== amountPence) attempt.current = { amount: amountPence, id: crypto.randomUUID() };
      const { data } = await api.post('/donations/checkout', { amountPence, requestId: attempt.current.id });
      const url = new URL(data.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.username || url.password || data.amountPence !== amountPence) throw new Error('Invalid checkout response');
      window.location.assign(url.href); redirecting = true;
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Donations are temporarily unavailable. Please try again later.' :
        err.response?.data?.message || 'We could not open secure checkout. Your selected amount has been kept; please try again.');
    } finally {
      // Keep controls locked until navigation. A failed request keeps its idempotency key for retry.
      if (!redirecting) { pending.current = false; setBusy(false); }
    }
  }
  return <DonationContext.Provider value={{ selected, custom, amountPence, busy, error, choose, enterCustom, checkout }}>{children}</DonationContext.Provider>;
}
export function useDonation() {
  const context = useContext(DonationContext);
  if (!context) throw new Error('DonationProvider is required');
  return context;
}
