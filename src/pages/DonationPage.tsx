import DonationWidget from '../components/DonationWidget';

export default function DonationPage() {
  return <main className="container py-5" style={{ minHeight: '60vh' }}>
    <div className="row g-4 align-items-start">
      <div className="col-lg-6"><span className="section-eyebrow">Support Our Community</span><h1 className="section-heading">Make a <em>Donation</em></h1><p className="section-body">Your donation supports our community programmes, gatherings and activities. Choose a suggested amount or enter your own.</p><p>One-time donations in GBP. Continue to Stripe to enter your payment details securely.</p></div>
      <div className="col-lg-6" style={{ maxWidth: 600 }}><DonationWidget /></div>
    </div>
  </main>;
}
