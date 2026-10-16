import { Link } from 'react-router-dom';
import { useContent, imageUrl } from '../content';

function socialHref(value: string): string | undefined {
  try {
    const url = new URL(value.trim());
    if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch { /* Unconfigured or invalid social links stay hidden. */ }
}

export function Footer() {
  const { branding, contact, navigation } = useContent();
  // Only standalone public pages belong in the footer navigation.
  const explore = [
    { label: 'Home', href: '/' },
    { label: navigation.events, href: '/events' },
    { label: navigation.articles, href: '/articles' },
    { label: navigation.gallery, href: '/gallery' },
    { label: navigation.donate, href: '/donate' },
  ];
  const email = contact.email.trim();
  const emailHref = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? `mailto:${email}` : undefined;
  const phone = contact.phone.trim();
  const phoneNumber = phone.replace(/[\s().-]/g, '');
  const phoneHref = /^\+?\d{6,15}$/.test(phoneNumber) ? `tel:${phoneNumber}` : undefined;
  const socials = (['facebook', 'instagram', 'twitter', 'youtube', 'whatsapp'] as const)
    .flatMap(key => {
      const href = socialHref(contact[key]);
      return href ? [{ key, href }] : [];
    });

  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-top row gy-4">
          <div className="col-lg-4">
            <Link to="/" className="footer-brand" aria-label="Al Burhaniya International home">
              <span className="brand-emblem"><img alt="Al Burhaniya International" src={imageUrl(branding.logo)} width="100%" style={{ maxWidth: 250 }} /></span>
            </Link>
            <p className="footer-tagline">{branding.footerTagline}</p>
            <p className="footer-charity">{branding.footerRegistration}</p>
          </div>
          <nav className="col-12 col-md-6 col-lg-4" aria-label="Footer pages">
              <h2 className="footer-heading">{branding.footerExplore}</h2>
              <ul className="footer-links">{explore.map(link => (
                <li key={link.href}><Link to={link.href}>{link.label}</Link></li>
              ))}</ul>
            </nav>
          <div className="col-12 col-md-6 col-lg-4">
            <h2 className="footer-heading">Get in touch</h2>
            <address className="footer-contact footer-links">
              {contact.address.trim() && <span>{contact.address}</span>}
              {emailHref && <a href={emailHref}>{email}</a>}
              {phoneHref && <a href={phoneHref}>{phone}</a>}
            </address>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{branding.copyright}</span>
          {socials.length > 0 && <div className="social-links">{socials.map(({ key, href }) => (
            <a key={key} href={href} className="soc-link sm" aria-label={key === 'twitter' ? 'X (Twitter)' : key} target="_blank" rel="noopener noreferrer">
              <i aria-hidden="true" className={`bi bi-${key === 'twitter' ? 'twitter-x' : key}`} />
            </a>
          ))}</div>}
        </div>
      </div>
    </footer>
  );
}
