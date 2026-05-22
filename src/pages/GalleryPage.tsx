// ═══════════════════════════════════════════════════════════════
//  src/pages/GalleryPage.tsx
//  Filterable masonry gallery with lightbox — API-driven
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchGallery, type ApiGalleryItem } from '../services/galleryService';
import { Reveal } from '../components/Reveal';
import './GalleryPage.css';

// ── Image helper ─────────────────────────────────────────────────
const imgSrc = (url: string) =>
  !url ? '' : url.startsWith('http') ? url
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;

// ── Categories ───────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all',        label: 'All',        icon: 'bi-grid' },
  { key: 'gatherings', label: 'Gatherings', icon: 'bi-people' },
  { key: 'music',      label: 'Music',      icon: 'bi-music-note' },
  { key: 'sports',     label: 'Sports',     icon: 'bi-trophy' },
  { key: 'arts',       label: 'Arts',       icon: 'bi-brush' },
  { key: 'dance',      label: 'Dance',      icon: 'bi-activity' },
  { key: 'general',    label: 'General',    icon: 'bi-camera' },
];

// ════════════════════════════════════════════════════════════════
//  Lightbox
// ════════════════════════════════════════════════════════════════
function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: ApiGalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onPrev();
      if (e.key === 'ArrowRight')  onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!item) return null;

  return (
    <div className="gl-lightbox-backdrop" onClick={onClose}>
      <div className="gl-lightbox-inner" onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button className="gl-lb-close" onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg" />
        </button>

        {/* Prev */}
        <button
          className="gl-lb-nav prev"
          onClick={onPrev}
          aria-label="Previous"
          disabled={index === 0}
        >
          <i className="bi bi-chevron-left" />
        </button>

        {/* Image */}
        <div className="gl-lb-img-wrap">
          <img
            key={item._id}
            src={imgSrc(item.imageUrl)}
            alt={item.title}
            className="gl-lb-img"
          />
        </div>

        {/* Next */}
        <button
          className="gl-lb-nav next"
          onClick={onNext}
          aria-label="Next"
          disabled={index === items.length - 1}
        >
          <i className="bi bi-chevron-right" />
        </button>

        {/* Caption */}
        <div className="gl-lb-caption">
          <span className="gl-lb-title">{item.title}</span>
          <span className="gl-lb-cat">{item.category}</span>
          <span className="gl-lb-counter">{index + 1} / {items.length}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Main Page
// ════════════════════════════════════════════════════════════════
export default function GalleryPage() {
  const [allItems,  setAllItems]  = useState<ApiGalleryItem[]>([]);
  const [filter,    setFilter]    = useState('all');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [lbIndex,   setLbIndex]   = useState<number | null>(null);

  // Fetch all on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGallery()
      .then(res => {
        // API returns { items } or plain array
        const data = Array.isArray(res) ? res : (res.items ?? []);
        setAllItems(data);
      })
      .catch(() => setError('Failed to load gallery. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  // Filtered items
  const filtered = filter === 'all'
    ? allItems
    : allItems.filter(i => i.category === filter);

  // Lightbox handlers
  const openLightbox  = (idx: number) => setLbIndex(idx);
  const closeLightbox = useCallback(() => setLbIndex(null), []);
  const prevPhoto     = useCallback(() => setLbIndex(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextPhoto     = useCallback(() => setLbIndex(i => (i !== null && i < filtered.length - 1 ? i + 1 : i)), [filtered.length]);

  // Category counts
  const countFor = (key: string) =>
    key === 'all' ? allItems.length : allItems.filter(i => i.category === key).length;

  return (
    <div className="inner-page">

      {/* ── PAGE HEADER ───────────────────────────────── */}
      <header className="page-header gl-page-header">
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
              <li className="breadcrumb-item active">Gallery</li>
            </ol>
          </nav>
          <div className="row align-items-end">
            <div className="col-lg-7">
              <div className="page-header-content">
                <span className="section-eyebrow light">Moments Captured</span>
                <h1 className="page-title">Our <em>Gallery</em></h1>
                <p className="page-subtitle">
                  A window into the life and spirit of Al Burhaniya — from festivals and sports days
                  to quiet creative sessions and everything in between.
                </p>
              </div>
            </div>
            <div className="col-lg-4 offset-lg-1 d-none d-lg-flex">
              <div className="ph-quick-stats">
                <div className="pqs-item">
                  <span className="pqs-num">{loading ? '…' : allItems.length}</span>
                  <span className="pqs-label">Photos</span>
                </div>
                <div className="pqs-divider" />
                <div className="pqs-item">
                  <span className="pqs-num">{loading ? '…' : CATEGORIES.length - 1}</span>
                  <span className="pqs-label">Categories</span>
                </div>
                <div className="pqs-divider" />
                <div className="pqs-item">
                  <span className="pqs-num">Free</span>
                  <span className="pqs-label">To view</span>
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

      {/* ── FILTER BAR ────────────────────────────────── */}
      <section className="gl-controls-section">
        <div className="container">
          <Reveal className="gl-filters reveal-up">
            {CATEGORIES.filter(c => countFor(c.key) > 0 || c.key === 'all').map(c => (
              <button
                key={c.key}
                className={`gl-filter-btn ${filter === c.key ? 'active' : ''}`}
                onClick={() => setFilter(c.key)}
              >
                <i className={`bi ${c.icon} me-1`} />
                {c.label}
                <span className="gl-filter-count">{countFor(c.key)}</span>
              </button>
            ))}
          </Reveal>

          {!loading && (
            <p className="gl-results-count">
              {filtered.length} photo{filtered.length !== 1 ? 's' : ''}
              {filter !== 'all' ? ` in ${filter}` : ''}
            </p>
          )}
        </div>
      </section>

      {/* ── GALLERY GRID ──────────────────────────────── */}
      <section className="gl-grid-section">
        <div className="container">

          {/* Loading */}
          {loading && (
            <div className="gl-empty-state">
              <div className="gl-empty-icon" style={{ opacity: 0.4 }}>
                <i className="bi bi-arrow-repeat" />
              </div>
              <h3>Loading gallery…</h3>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="gl-empty-state">
              <div className="gl-empty-icon"><i className="bi bi-exclamation-circle" /></div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="gl-empty-state">
              <div className="gl-empty-icon"><i className="bi bi-camera" /></div>
              <h3>No photos yet</h3>
              <p>
                {filter !== 'all'
                  ? `No photos in the "${filter}" category yet.`
                  : 'Photos will appear here once uploaded.'}
              </p>
              {filter !== 'all' && (
                <button className="btn btn-primary-main mt-3" onClick={() => setFilter('all')}>
                  View All Photos
                </button>
              )}
            </div>
          )}

          {/* Masonry grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="gl-masonry">
              {filtered.map((item, idx) => (
                <div
                  key={item._id}
                  className={`gl-item ${item.size === 'tall' ? 'tall' : ''} ${item.size === 'wide' ? 'wide' : ''}`}
                  onClick={() => openLightbox(idx)}
                  style={{ animationDelay: `${(idx % 12) * 40}ms` }}
                >
                  <img
                    src={imgSrc(item.imageUrl)}
                    alt={item.title}
                    loading="lazy"
                  />
                  <div className="gl-item-overlay">
                    <div className="gl-item-info">
                      <span className="gl-item-title">{item.title}</span>
                      <span className={`gl-item-cat ${item.category}`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    </div>
                    <div className="gl-item-zoom">
                      <i className="bi bi-zoom-in" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────── */}
      <section className="section-newsletter">
        <div className="container">
          <Reveal className="newsletter-band reveal-up">
            <div className="nl-icon"><i className="bi bi-camera-fill" /></div>
            <div className="nl-text">
              <h3>Never Miss a Moment</h3>
              <p>Subscribe to our newsletter and get the latest photos and event highlights delivered to your inbox.</p>
            </div>
            <NlForm />
          </Reveal>
        </div>
      </section>

      {/* ── LIGHTBOX ──────────────────────────────────── */}
      {lbIndex !== null && (
        <Lightbox
          items={filtered}
          index={lbIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}

    </div>
  );
}

function NlForm() {
  const [done, setDone] = useState(false);
  if (done) return (
    <p className="nl-success">
      <i className="bi bi-check-circle-fill me-2" />You're subscribed!
    </p>
  );
  return (
    <form className="nl-form" onSubmit={e => { e.preventDefault(); setDone(true); }}>
      <input type="email" placeholder="Your email address" required />
      <button type="submit">Subscribe <i className="bi bi-arrow-right" /></button>
    </form>
  );
}