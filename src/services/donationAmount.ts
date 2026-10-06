export const DONATION_PRESETS = [1000, 2500, 5000, 10000, 25000, 50000] as const;
export const MIN_DONATION_PENCE = 100;
export const MAX_DONATION_PENCE = 1_000_000;
export const formatDonation = (pence: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);

// Work in integer pence; do not round fractions into a different donation.
export function parseDonationAmount(value: string): number | null {
  const text = value.trim();
  if (!/^\d{1,5}(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const pence = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(pence) && pence >= MIN_DONATION_PENCE && pence <= MAX_DONATION_PENCE ? pence : null;
}
