// ═══════════════════════════════════════════════════════════════
//  src/pages/EventDetailPage.tsx — API-driven version
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchEventById,
  fetchRelatedEvents,
  type ApiEvent,
} from '../services/eventService';
import '../articles.css';
import './EventsPage.css';

// ── Helpers ──────────────────────────────────────────────────────
function getCapacityPercent(ev: ApiEvent): number {
  if (!ev.capacity || !ev.registered) return 0;
  return Math.min(100, Math.round((ev.registered / ev.capacity) * 100));
}
function getSpotsLeft(ev: ApiEvent): number {
  return Math.max(0, ev.capacity - ev.registered);
}
const imgSrc = (url: string) =>
  !url ? '' : url.startsWith('http') ? url
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;

// ── Category badge ───────────────────────────────────────────────
function CatBadge({ cat, size = 'lg' }: { cat: string; size?: 'lg' | 'sm' }) {
  const label = cat.charAt(0).toUpperCase() + cat.slice(1);
  return <span className={`${size === 'lg' ? 'ehb-cat' : 'ev-gc-cat'} ${cat}`}>{label}</span>;
}

// ── Registration Modal ───────────────────────────────────────────
function RegisterModal({
  event, show, onClose,
}: { event: ApiEvent; show: boolean; onClose: () => void; }) {
  const [submitted, setSubmitted] = useState(false);

  if (!show) return null;

  return (
    <div className="ev-modal-backdrop" onClick={onClose}>
      <div className="ev-modal-content" onClick={e => e.stopPropagation()}>
        <div className="ev-modal-header">
          <h5 className="modal-title">Register for Event</h5>
          <button className="ev-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="ev-modal-body">
          {submitted ? (
            <div className="ev-modal-success">
              <div className="success-icon"><i className="bi bi-check-circle-fill" /></div>
              <h4>You're registered!</h4>
              <p>We've noted your place. A confirmation email will be sent shortly. See you there!</p>
              <button className="btn btn-primary-main mt-2" onClick={onClose}>Close</button>
            </div>
          ) : (
            <>
              <p className="ev-modal-event-title">{event.title}</p>
              <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="ev-form-label">First Name</label>
                    <input type="text" className="form-control ev-form-input" placeholder="Jane" required />
                  </div>
                  <div className="col-6">
                    <label className="ev-form-label">Last Name</label>
                    <input type="text" className="form-control ev-form-input" placeholder="Smith" required />
                  </div>
                  <div className="col-12">
                    <label className="ev-form-label">Email Address</label>
                    <input type="email" className="form-control ev-form-input" placeholder="jane@example.com" required />
                  </div>
                  <div className="col-12">
                    <label className="ev-form-label">Phone (optional)</label>
                    <input type="tel" className="form-control ev-form-input" placeholder="+44 7700 000000" />
                  </div>
                  <div className="col-12">
                    <label className="ev-form-label">Number of places</label>
                    <select className="form-select ev-form-input">
                      <option>1</option><option>2</option><option>3</option><option>4</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="ev-form-label">Anything we should know?</label>
                    <textarea className="form-control ev-form-input" rows={3} placeholder="Optional…" />
                  </div>
                </div>
                <div className="ev-modal-actions mt-3">
                  <button type="submit" className="btn-register-submit w-100">
                    <i className="bi bi-check-circle me-2" />Confirm Registration
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Related event card ───────────────────────────────────────────
function RelatedCard({ event }: { event: ApiEvent }) {
  const isPaid = event.price !== 'Free';
  return (
    <Link className="ev-grid-card" to={`/events/${event.slug}`}>
      <div className="ev-gc-image">
        <img src={imgSrc(event.thumbImage || event.image)} alt={event.title} loading="lazy" />
        <div className="ev-gc-date">
          <span className="ev-d">{event.day}</span>
          <span className="ev-m">{event.month}</span>
        </div>
        <span className={`ev-gc-cat ${event.categoryKey}`}>
          {event.categoryKey.charAt(0).toUpperCase() + event.categoryKey.slice(1)}
        </span>
      </div>
      <div className="ev-gc-body">
        <h3 className="ev-gc-title">{event.title}</h3>
        <div className="ev-gc-meta">
          <span><i className="bi bi-clock" />{event.timeStart} – {event.timeEnd}</span>
          <span><i className="bi bi-geo-alt" />{event.location}</span>
        </div>
      </div>
      <div className="ev-gc-footer">
        <span className={`ev-gc-price ${isPaid ? 'paid' : ''}`}>{event.price}</span>
        <div className="ev-gc-go"><i className="bi bi-arrow-right" /></div>
      </div>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════════════════════
export default function EventDetailPage() {
  const { slug }  = useParams<{ slug: string }>();  // route uses :slug
  const [event,   setEvent]   = useState<ApiEvent | null>(null);
  const [related, setRelated] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nlDone,    setNlDone]    = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [readPct,   setReadPct]   = useState(0);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setReadPct(Math.min(100, pct));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to top on slug change
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Fetch event by slug (backend handles both slug and _id)
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetchEventById(slug)
      .then((ev) => {
        setEvent(ev);
        return fetchRelatedEvents(ev._id);
      })
      .then(setRelated)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="inner-page">
        <div className="not-found-state container">
          <div className="nf-icon" style={{ opacity: 0.4 }}><i className="bi bi-arrow-repeat" /></div>
          <h2>Loading event…</h2>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────
  if (notFound || !event) {
    return (
      <div className="inner-page">
        <div className="not-found-state container">
          <div className="nf-icon"><i className="bi bi-calendar-x" /></div>
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events" className="btn btn-primary-main">Back to Events</Link>
        </div>
      </div>
    );
  }

  const pct       = getCapacityPercent(event);
  const spots     = getSpotsLeft(event);
  const isPaid    = event.price !== 'Free';
  const isSoldOut = spots === 0 && event.capacity > 0;
  const isPast    = event.status === 'past';

  return (
    <div className="inner-page">

      {/* Reading progress */}
      <div className="reading-progress-bar" style={{ width: `${readPct}%` }} />

      {/* ── EVENT HERO ──────────────────────────────── */}
      <section className="event-hero">
        <div className="event-hero-img">
          <img src={imgSrc(event.image)} alt={event.title} />
        </div>
        <div className="event-hero-overlay" />
        <div className="container event-hero-content">
          <div className="event-hero-badges">
            <CatBadge cat={event.categoryKey} />
            {event.featured && <span className="ehb-featured">★ Featured</span>}
            {isPast && <span className="ehb-cat seniors">Past Event</span>}
          </div>
          <h1 className="event-hero-title">{event.title}</h1>
          <div className="event-hero-meta">
            <div className="ehm-item"><i className="bi bi-calendar3" /><strong>{event.dateLabel}</strong></div>
            <div className="ehm-item"><i className="bi bi-clock" />{event.timeStart} – {event.timeEnd}</div>
            <div className="ehm-item"><i className="bi bi-geo-alt" />{event.location}</div>
            <div className="ehm-item"><i className="bi bi-tag" />{event.price}</div>
          </div>
        </div>
        <div className="event-hero-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#FBF7F2" />
          </svg>
        </div>
      </section>

      {/* ── BODY ────────────────────────────────────── */}
      <section className="event-detail-section">
        <div className="container">
          <div className="row">

            {/* ── MAIN COLUMN ──────────────────────── */}
            <div className="col-lg-8">
              <nav aria-label="breadcrumb" className="ev-detail-breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/"><i className="bi bi-house me-1" />Home</Link></li>
                  <li className="breadcrumb-item"><Link to="/events">Events</Link></li>
                  <li className="breadcrumb-item active">{event.title}</li>
                </ol>
              </nav>

              <div className="ev-detail-tags">
                {event.tags.map(tag => (
                  <span key={tag} className="ev-tag-pill">#{tag}</span>
                ))}
              </div>

              <div className="ev-about-block">
                <span className="ev-section-label">About This Event</span>
                <div className="ev-body-text" dangerouslySetInnerHTML={{ __html: event.fullDesc }} />
              </div>

              {event.schedule.length > 0 && (
                <div className="ev-schedule-block">
                  <span className="ev-section-label">Event Schedule</span>
                  <div className="ev-schedule-list">
                    {event.schedule.map((s, i) => (
                      <div key={i} className="ev-schedule-item">
                        <span className="ev-sch-time">{s.time}</span>
                        <div className="ev-sch-dot" />
                        <span className="ev-sch-item-text">{s.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.highlights.length > 0 && (
                <div className="ev-highlights-block">
                  <span className="ev-section-label">Highlights</span>
                  <div className="ev-highlights-grid">
                    {event.highlights.map((h, i) => (
                      <div key={i} className="ev-highlight-item">
                        <i className="bi bi-check-circle-fill" />{h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ev-share-row">
                <span>Share this event:</span>
                <button className="share-btn twitter" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}>
                  <i className="bi bi-twitter-x" /> Twitter
                </button>
                <button className="share-btn facebook" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>
                  <i className="bi bi-facebook" /> Facebook
                </button>
                <button className="share-btn whatsapp" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(event.title + ' ' + window.location.href)}`, '_blank')}>
                  <i className="bi bi-whatsapp" /> WhatsApp
                </button>
                <button className="share-btn copy-link" onClick={copyLink}>
                  <i className={`bi ${copied ? 'bi-check2' : 'bi-link-45deg'}`} />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* ── SIDEBAR ──────────────────────────── */}
            <div className="col-lg-4">
              <aside className="event-sidebar">
                <div className="ev-reg-card">
                  <div className="ev-reg-card-header">
                    <h4>{isPast ? 'This Event Has Passed' : isSoldOut ? 'Sold Out' : 'Register Now'}</h4>
                    <span className={`ev-price-display ${isPaid ? 'paid' : ''}`}>{event.price}</span>
                  </div>
                  {pct > 0 && (
                    <div className="ev-sidebar-cap">
                      <div className="ev-sidebar-cap-top">
                        <span>{event.registered} of {event.capacity} registered</span>
                        <span className="spots-left">{spots} spots left</span>
                      </div>
                      <div className="ev-sidebar-cap-bar">
                        <div className="ev-sidebar-cap-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                  <button
                    className="btn-register-main"
                    disabled={isPast || isSoldOut}
                    onClick={() => setShowModal(true)}
                  >
                    {isPast
                      ? <><i className="bi bi-clock-history me-2" />Event Passed</>
                      : isSoldOut
                      ? <><i className="bi bi-x-circle me-2" />Sold Out</>
                      : <><i className="bi bi-calendar-check me-2" />Register Free Place</>}
                  </button>
                  {!isPast && !isSoldOut && (
                    <p className="ev-reg-note">
                      <i className="bi bi-shield-check" /> Free cancellation up to 48 hours before
                    </p>
                  )}
                </div>

                <div className="ev-info-widget">
                  <p className="ev-info-widget-title">Event Details</p>
                  <div className="ev-info-list">
                    <div className="ev-info-item"><div className="ev-info-item-icon"><i className="bi bi-calendar3" /></div><div className="ev-info-item-body"><strong>Date</strong><span>{event.dateLabel}</span></div></div>
                    <div className="ev-info-item"><div className="ev-info-item-icon"><i className="bi bi-clock" /></div><div className="ev-info-item-body"><strong>Time</strong><span>{event.timeStart} – {event.timeEnd}</span></div></div>
                    <div className="ev-info-item"><div className="ev-info-item-icon"><i className="bi bi-geo-alt" /></div><div className="ev-info-item-body"><strong>Venue</strong><span>{event.location}</span></div></div>
                    <div className="ev-info-item"><div className="ev-info-item-icon"><i className="bi bi-pin-map" /></div><div className="ev-info-item-body"><strong>Address</strong><span>{event.address}</span></div></div>
                    <div className="ev-info-item"><div className="ev-info-item-icon"><i className="bi bi-tag" /></div><div className="ev-info-item-body"><strong>Price</strong><span>{event.price}</span></div></div>
                    <div className="ev-info-item"><div className="ev-info-item-icon"><i className="bi bi-people" /></div><div className="ev-info-item-body"><strong>Capacity</strong><span>{event.capacity} places</span></div></div>
                  </div>
                </div>

                <div className="ev-organiser-widget">
                  <p className="ev-info-widget-title">Organised By</p>
                  <p className="ev-org-name">{event.organiser}</p>
                  <p className="ev-org-note">
                    Questions? <Link to="/#contact" style={{ color: 'var(--clr-gold)' }}>Contact us →</Link>
                  </p>
                </div>

                <div className="donate-widget">
                  <i className="bi bi-heart-fill" />
                  <h4>Support Our Events</h4>
                  <p>Our events are only possible thanks to donations and volunteers.</p>
                  <Link to="/#donate" className="btn-donate-widget">
                    <i className="bi bi-heart me-1" /> Make a Donation
                  </Link>
                </div>
              </aside>
            </div>

          </div>
        </div>
      </section>

      {/* ── RELATED EVENTS ────────────────────────── */}
      {related.length > 0 && (
        <section className="section-related-events">
          <div className="container">
            <div className="row align-items-end mb-4">
              <div className="col">
                <span className="section-eyebrow">Don't Stop There</span>
                <h2 className="section-heading">More <em>Events</em> You Might Like</h2>
              </div>
              <div className="col-auto">
                <Link to="/events" className="link-arrow">All Events <i className="bi bi-arrow-right" /></Link>
              </div>
            </div>
            <div className="related-events-grid">
              {related.map(ev => <RelatedCard key={ev._id} event={ev} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ────────────────────────────── */}
      <section className="section-newsletter">
        <div className="container">
          <div className="newsletter-band reveal-up">
            <div className="nl-icon"><i className="bi bi-calendar-check" /></div>
            <div className="nl-text">
              <h3>Never Miss an Event</h3>
              <p>Subscribe and get our monthly events newsletter delivered straight to your inbox.</p>
            </div>
            {nlDone ? (
              <p className="nl-success"><i className="bi bi-check-circle-fill me-2" />You're subscribed!</p>
            ) : (
              <form className="nl-form" onSubmit={e => { e.preventDefault(); setNlDone(true); }}>
                <input type="email" placeholder="Your email address" required />
                <button type="submit">Subscribe <i className="bi bi-arrow-right" /></button>
              </form>
            )}
          </div>
        </div>
      </section>

      <RegisterModal event={event} show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}