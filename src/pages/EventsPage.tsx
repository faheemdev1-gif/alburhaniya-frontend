// ═══════════════════════════════════════════════════════════════
//  src/pages/EventsPage.tsx — API-driven version
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchEvents,
  fetchFeaturedEvent,
  type ApiEvent,
} from '../services/eventService';
import '../articles.css';
import './EventsPage.css';
import { Reveal } from '../components/Reveal';

// ── Types ────────────────────────────────────────────────────────
type Tab  = 'upcoming' | 'past';
type View = 'grid' | 'list';

interface FilterCat { key: string; label: string; icon: string; }

// ── Constants ────────────────────────────────────────────────────
const CATEGORIES: FilterCat[] = [
  { key: 'all',       label: 'All',        icon: '' },
  { key: 'gathering', label: 'Gatherings', icon: 'bi-people' },
  { key: 'music',     label: 'Music',      icon: 'bi-music-note' },
  { key: 'dance',     label: 'Dance',      icon: 'bi-activity' },
  { key: 'arts',      label: 'Arts',       icon: 'bi-brush' },
  { key: 'sports',    label: 'Sports',     icon: 'bi-trophy' },
  { key: 'youth',     label: 'Youth',      icon: 'bi-mortarboard' },
  { key: 'seniors',   label: 'Seniors',    icon: 'bi-heart-pulse' },
];

// ── Helpers (replicate data/events.ts helpers using ApiEvent) ────
function getCapacityPercent(ev: ApiEvent): number {
  if (!ev.capacity || !ev.registered) return 0;
  return Math.min(100, Math.round((ev.registered / ev.capacity) * 100));
}
function getSpotsLeft(ev: ApiEvent): number {
  return Math.max(0, ev.capacity - ev.registered);
}
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
function getMonthLabel(dateISO: string): string {
  const d = new Date(dateISO);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Image helper ─────────────────────────────────────────────────
const imgSrc = (url: string) =>
  !url ? '' : url.startsWith('http') ? url
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;

// ── Category badge ───────────────────────────────────────────────
function CatBadge({ cat, className = '' }: { cat: string; className?: string }) {
  return (
    <span className={`ev-gc-cat ${cat} ${className}`}>
      {cat.charAt(0).toUpperCase() + cat.slice(1)}
    </span>
  );
}

// ── Capacity bar ─────────────────────────────────────────────────
function CapBar({ event, variant = 'card' }: { event: ApiEvent; variant?: 'card' | 'featured' }) {
  const pct   = getCapacityPercent(event);
  const spots = getSpotsLeft(event);
  if (!pct) return null;

  if (variant === 'featured') {
    return (
      <div className="efc-capacity">
        <div className="efc-cap-label">
          <span>{event.registered} registered</span>
          <strong>{spots} spots left</strong>
        </div>
        <div className="efc-cap-bar">
          <div className="efc-cap-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }
  return (
    <div className="ev-gc-cap">
      <div className="ev-gc-cap-top">
        <span>{event.registered} going</span>
        <span className="spots">{spots} spots left</span>
      </div>
      <div className="ev-gc-cap-bar">
        <div className="ev-gc-cap-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Featured event banner ────────────────────────────────────────
function FeaturedEvent({ upcoming }: { upcoming: ApiEvent[] }) {
  const [featured, setFeatured] = useState<ApiEvent | null>(null);

  useEffect(() => {
    fetchFeaturedEvent()
      .then((ev) => {
        // If API returns null, fall back to first upcoming event
        setFeatured(ev ?? upcoming[0] ?? null);
      })
      .catch(() => setFeatured(upcoming[0] ?? null));
  }, [upcoming]);

  if (!featured) return null;

  return (
    <section className="section-ev-featured">
      <div className="container">
        <Reveal className="reveal-up">
          <Link className="ev-featured-card" to={`/events/${featured.slug}`}>
            <div className="efc-image">
              <img src={imgSrc(featured.image)} alt={featured.title} loading="lazy" />
            </div>
            <div className="efc-body">
              <div className="efc-top">
                <span className="efc-star-badge">★ Featured Event</span>
                <span className="efc-date-block">
                  <i className="bi bi-calendar3" /> {featured.dateLabel}
                </span>
              </div>
              <h2 className="efc-title">{featured.title}</h2>
              <p className="efc-desc">{featured.shortDesc}</p>
              <div className="efc-meta">
                <div className="efc-meta-item"><i className="bi bi-clock" />{featured.timeStart} – {featured.timeEnd}</div>
                <div className="efc-meta-item"><i className="bi bi-geo-alt" />{featured.location}</div>
                <div className="efc-meta-item"><i className="bi bi-tag" />{featured.price}</div>
              </div>
              <CapBar event={featured} variant="featured" />
              <span className="btn-ev-featured">
                View &amp; Register <i className="bi bi-arrow-right ms-1" />
              </span>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ── Grid card ────────────────────────────────────────────────────
function GridCard({ event }: { event: ApiEvent }) {
  const isPaid = event.price !== 'Free';
  return (
    <Link
      className={`ev-grid-card ${event.status === 'past' ? 'past-ev' : ''}`}
      to={`/events/${event.slug}`}
    >
      <div className="ev-gc-image">
        <img src={imgSrc(event.thumbImage || event.image)} alt={event.title} loading="lazy" />
        <div className="ev-gc-date">
          <span className="ev-d">{event.day}</span>
          <span className="ev-m">{event.month}</span>
        </div>
        <CatBadge cat={event.categoryKey} />
      </div>
      <div className="ev-gc-body">
        <h3 className="ev-gc-title">
          {event.title}
          {event.status === 'past' && <span className="past-label">Past</span>}
        </h3>
        <div className="ev-gc-meta">
          <span><i className="bi bi-clock" />{event.timeStart} – {event.timeEnd}</span>
          <span><i className="bi bi-geo-alt" />{event.location}</span>
        </div>
        {event.status === 'upcoming' && <CapBar event={event} />}
      </div>
      <div className="ev-gc-footer">
        <span className={`ev-gc-price ${isPaid ? 'paid' : ''}`}>{event.price}</span>
        <div className="ev-gc-go"><i className="bi bi-arrow-right" /></div>
      </div>
    </Link>
  );
}

// ── List item ────────────────────────────────────────────────────
function ListItem({ event }: { event: ApiEvent }) {
  const isPaid = event.price !== 'Free';
  return (
    <Link
      className={`ev-list-item ${event.status === 'past' ? 'past-ev' : ''}`}
      to={`/events/${event.slug}`}
    >
      <div className="ev-li-date">
        <span className="ev-d">{event.day}</span>
        <span className="ev-m">{event.month?.slice(0, 3)} '{event.year?.slice(2)}</span>
      </div>
      <div className="ev-li-info">
        <span className={`li-cat ${event.categoryKey}`}>{event.category}</span>
        <h4>
          {event.title}
          {event.status === 'past' && <span className="past-label">Past</span>}
        </h4>
        <div className="ev-li-meta">
          <span><i className="bi bi-clock" />{event.timeStart} – {event.timeEnd}</span>
          <span><i className="bi bi-geo-alt" />{event.location}</span>
          <span><i className="bi bi-people" />{event.registered} registered</span>
        </div>
      </div>
      <div className="ev-li-action">
        <span className={`ev-li-price ${isPaid ? 'paid' : ''}`}>{event.price}</span>
        <button className="btn-ev-list" onClick={e => e.preventDefault()}>
          View <i className="bi bi-arrow-right" />
        </button>
      </div>
    </Link>
  );
}

// ── Month divider ────────────────────────────────────────────────
function MonthDivider({ label }: { label: string }) {
  return (
    <div className="month-divider">
      <span className="month-divider-label">{label}</span>
      <div className="month-divider-line" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Main Page Component
// ════════════════════════════════════════════════════════════════
export default function EventsPage() {
  const [tab,      setTab]      = useState<Tab>('upcoming');
  const [cat,      setCat]      = useState<string>('all');
  const [search,   setSearch]   = useState('');
  const [view,     setView]     = useState<View>('grid');
  const [nlDone,   setNlDone]   = useState(false);
  const [upcoming, setUpcoming] = useState<ApiEvent[]>([]);
  const [past,     setPast]     = useState<ApiEvent[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Fetch both pools in parallel
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchEvents({ status: 'upcoming', limit: 100 }),
      fetchEvents({ status: 'past',     limit: 100 }),
    ])
      .then(([upRes, pastRes]) => {
        setUpcoming(upRes.events);
        setPast(pastRes.events);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Client-side filter + search (same logic as original)
  const filtered = useMemo(() => {
    const pool = tab === 'upcoming' ? upcoming : past;
    const q    = search.toLowerCase().trim();
    return pool.filter(ev => {
      const catOk    = cat === 'all' || ev.categoryKey === cat;
      const searchOk = !q
        || ev.title.toLowerCase().includes(q)
        || ev.category.toLowerCase().includes(q)
        || ev.location.toLowerCase().includes(q)
        || ev.tags.some(t => t.toLowerCase().includes(q));
      return catOk && searchOk;
    });
  }, [tab, cat, search, upcoming, past]);

  const hasFilter = cat !== 'all' || search !== '';
  function clearAll() { setCat('all'); setSearch(''); }

  // Render events with month dividers (identical logic to original)
  function renderWithDividers() {
    if (tab === 'past') {
      return filtered.map(ev =>
        view === 'grid'
          ? <GridCard key={ev._id} event={ev} />
          : <ListItem key={ev._id} event={ev} />
      );
    }
    const nodes: React.ReactNode[] = [];
    let lastMonth = '';
    filtered.forEach(ev => {
      const mLabel = getMonthLabel(ev.dateISO);
      if (mLabel !== lastMonth) {
        if (view === 'grid') {
          nodes.push(
            <div key={`div-${mLabel}`} className="month-divider-grid-span">
              <MonthDivider label={mLabel} />
            </div>
          );
        } else {
          nodes.push(<MonthDivider key={`div-${mLabel}`} label={mLabel} />);
        }
        lastMonth = mLabel;
      }
      nodes.push(
        view === 'grid'
          ? <GridCard key={ev._id} event={ev} />
          : <ListItem key={ev._id} event={ev} />
      );
    });
    return nodes;
  }

  return (
    <div className="inner-page">

      {/* ── PAGE HEADER ───────────────────────────────── */}
      <header className="page-header ev-page-header">
        <div className="page-header-bg">
          <div className="ph-pattern" />
          <div className="ph-glow" />
        </div>
        <div className="container">
          <nav aria-label="breadcrumb" className="page-breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/"><i className="bi bi-house me-1" />Home</Link>
              </li>
              <li className="breadcrumb-item active">Events</li>
            </ol>
          </nav>
          <div className="row align-items-end">
            <div className="col-lg-7">
              <div className="page-header-content">
                <span className="section-eyebrow light">What's On</span>
                <h1 className="page-title">Community <em>Events</em></h1>
                <p className="page-subtitle">
                  From open-mic nights to annual festivals — something is always happening at Al Burhaniya. Find your next event below.
                </p>
              </div>
            </div>
            <div className="col-lg-4 offset-lg-1 d-none d-lg-flex">
              <div className="ph-quick-stats">
                <div className="pqs-item">
                  <span className="pqs-num">{loading ? '…' : upcoming.length}</span>
                  <span className="pqs-label">Upcoming</span>
                </div>
                <div className="pqs-divider" />
                <div className="pqs-item">
                  <span className="pqs-num">Free</span>
                  <span className="pqs-label">Many events</span>
                </div>
                <div className="pqs-divider" />
                <div className="pqs-item">
                  <span className="pqs-num">All</span>
                  <span className="pqs-label">Welcome</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="page-header-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#FBF7F2" />
          </svg>
        </div>
      </header>

      {/* ── FEATURED EVENT ────────────────────────────── */}
      {!loading && <FeaturedEvent upcoming={upcoming} />}

      {/* ── CONTROLS BAR ──────────────────────────────── */}
      <section className="ev-controls-section">
        <div className="container">
          <div className="ev-controls-bar reveal-up">
            <div className="search-box">
              <i className="bi bi-search" />
              <input
                type="text"
                placeholder="Search events…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
            <div className="ev-cat-filters">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  className={`ev-cat-btn ${cat === c.key ? 'active' : ''}`}
                  onClick={() => setCat(c.key)}
                >
                  {c.icon && <i className={`bi ${c.icon} me-1`} />}
                  {c.label}
                </button>
              ))}
            </div>
            <div className="view-toggle">
              <button className={`vt-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="Grid view">
                <i className="bi bi-grid-3x3-gap" />
              </button>
              <button className={`vt-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} title="List view">
                <i className="bi bi-list-ul" />
              </button>
            </div>
          </div>

          <div className="ev-tab-row reveal-up">
            <button className={`ev-tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
              Upcoming Events
              <span className="ev-tab-count">{loading ? '…' : upcoming.length}</span>
            </button>
            <button className={`ev-tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
              Past Events
              <span className="ev-tab-count">{loading ? '…' : past.length}</span>
            </button>
          </div>

          <div className="ev-results-row">
            <p className="results-count">
              {loading ? 'Loading events…' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} ${hasFilter ? 'found' : ''}`}
            </p>
            {hasFilter && (
              <button className="clear-filters-btn" onClick={clearAll}>
                <i className="bi bi-x" /> Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── EVENTS DISPLAY ────────────────────────────── */}
      <section className="section-events-display">
        <div className="container">
          {loading ? (
            <div className="ev-empty-state">
              <div className="ev-empty-icon" style={{ opacity: 0.4 }}>
                <i className="bi bi-arrow-repeat" />
              </div>
              <h3>Loading events…</h3>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ev-empty-state">
              <div className="ev-empty-icon"><i className="bi bi-calendar-x" /></div>
              <h3>No events found</h3>
              <p>Try adjusting your search or category filter.</p>
              <button className="btn btn-primary-main" onClick={clearAll}>Show All Events</button>
            </div>
          ) : view === 'grid' ? (
            <div className="events-grid">{renderWithDividers()}</div>
          ) : (
            <div className="events-list-view">{renderWithDividers()}</div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────── */}
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

    </div>
  );
}