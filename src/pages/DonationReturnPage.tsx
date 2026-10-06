import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { formatDonation } from '../services/donationAmount';

export default function DonationReturnPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const cancelled = params.get('cancelled') === '1';
  const [result, setResult] = useState<{ status: string; amountPence: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!cancelled && Boolean(sessionId));
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setResult(null); setError(''); setLoading(false);
    if (cancelled || !sessionId) return;
    setLoading(true);
    api.get(`/donations/session/${encodeURIComponent(sessionId)}`).then(({ data }) => { if (active) setResult(data); })
      .catch((err: any) => { if (active) setError(err.response?.data?.message || 'We could not check the payment status. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [sessionId, cancelled, retry]);
  return <main className="container py-5" style={{ maxWidth: 720, minHeight: '50vh' }}>
    <h1 className="section-heading">{result?.status === 'paid' ? 'Thank you for your support' : cancelled ? 'Checkout cancelled' : 'Your donation'}</h1>
    {cancelled ? <p>You left checkout. No payment is confirmed here. You can choose an amount and try again.</p> : loading ? <p role="status">Checking your payment with Stripe…</p> : error ? <p role="alert">{error}</p> : result ?
      <p role="status">{result.status === 'paid' ? `Stripe has confirmed your ${formatDonation(result.amountPence)} donation. Thank you for supporting our community.` : result.status === 'expired' ? 'This checkout session has expired. You can start a new donation.' : 'Your payment is not confirmed yet. Check its status again before starting another donation.'}</p> : <p>There is no checkout session to check. Return to the donation form to get started.</p>}
    {!cancelled && sessionId && result?.status !== 'paid' && result?.status !== 'expired' && <button type="button" className="btn btn-primary-main my-3" disabled={loading} onClick={() => setRetry(n => n + 1)}>Check payment status</button>}
    <p><a href="/#donate">Back to donation form</a></p>
  </main>;
}
