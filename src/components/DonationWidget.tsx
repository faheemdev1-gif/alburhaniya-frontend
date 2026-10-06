import { useId } from 'react';
import { useDonation } from '../context/DonationContext';
import { DONATION_PRESETS, formatDonation } from '../services/donationAmount';
import { imageUrl, useContent } from '../content';
import './DonationWidget.css';

export default function DonationWidget() {
  const donation = useDonation();
  const { branding } = useContent();
  const id = useId();
  const invalid = donation.selected === 'custom' && donation.amountPence === null;
  return <form className="donation-widget" aria-label="Choose your donation" aria-busy={donation.busy} onSubmit={e => { e.preventDefault(); void donation.checkout(); }}>
    <img className="donation-widget-logo" src={imageUrl(branding.logoInvert)} alt="Al-Burhaniya International" />
    <h3>How much would you like to donate today?</h3>
    <p className="donation-widget-intro">Your support helps our community programmes thrive.</p>
    <fieldset className="donation-widget-fields" disabled={donation.busy}>
      <legend>Donation amount <span>GBP £</span></legend>
      <div className="donation-widget-presets" role="group" aria-label="Suggested donation amounts">
        {DONATION_PRESETS.map(amount => <button key={amount} type="button" aria-pressed={donation.selected === amount} className={donation.selected === amount ? 'selected' : ''} onClick={() => donation.choose(amount)}>{formatDonation(amount)}</button>)}
      </div>
      <label className="visually-hidden" htmlFor={`${id}-custom`}>Custom donation amount in pounds</label>
      <input id={`${id}-custom`} className="donation-widget-custom" type="text" inputMode="decimal" autoComplete="off" placeholder="Enter custom amount" maxLength={9} value={donation.custom} onChange={e => donation.enterCustom(e.target.value)} aria-invalid={invalid} aria-describedby={`${id}-hint`} />
      <small id={`${id}-hint`} className="donation-widget-hint">One-time donation · £1–£10,000 · GBP</small>
      <div className="donation-widget-total" role="status" aria-live="polite" aria-atomic="true"><span>Your donation</span><strong>{donation.amountPence === null ? 'Enter a valid amount' : formatDonation(donation.amountPence)}</strong></div>
      <button className="donation-widget-submit" type="submit" disabled={donation.busy || donation.amountPence === null}>{donation.busy ? 'Opening secure checkout…' : donation.amountPence !== null ? `Donate ${formatDonation(donation.amountPence)}` : 'Donate'}</button>
    </fieldset>
    {donation.error && <p className="donation-widget-error" role="alert">{donation.error}</p>}
    <p className="donation-widget-secure"><i className="bi bi-shield-lock" aria-hidden="true" /> Secure payment with Stripe. Payment details are entered at checkout.</p>
  </form>;
}
