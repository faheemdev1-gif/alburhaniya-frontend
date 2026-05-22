import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArticles, type ApiArticle } from "../services/articleService";
import { Reveal } from "../components/Reveal";

const CATEGORIES = ["all", "community", "youth", "culture", "sports", "seniors", "arts"] as const;

function readMins(readTime: string): number {
  const m = /(\d+)/.exec(readTime);
  return m ? parseInt(m[1], 10) : 0;
}

function uniqueWriters(list: ApiArticle[]): number {
  return new Set(list.map((a) => a.author)).size;
}

export function ArticlesPage() {
  const [allArticles, setAllArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [cat, setCat]                 = useState<(typeof CATEGORIES)[number]>("all");
  const [sort, setSort]               = useState<"newest" | "oldest" | "read-asc" | "read-desc">("newest");
  const [visible, setVisible]         = useState(6);

  // ── Fetch all published articles once ──────────────────────────
  useEffect(() => {
    setLoading(true);
    fetchArticles({ published: true, limit: 100 })
      .then((res) => setAllArticles(res.articles))
      .catch(() => setError("Failed to load articles. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  // ── Client-side filter + sort (same logic as before) ───────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allArticles.filter((a) => (cat === "all" ? true : a.categoryKey === cat));
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    const sorted = [...list];
    if (sort === "newest")    sorted.sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
    else if (sort === "oldest")    sorted.sort((a, b) => (a.dateISO > b.dateISO ? 1 : -1));
    else if (sort === "read-asc")  sorted.sort((a, b) => readMins(a.readTime) - readMins(b.readTime));
    else                           sorted.sort((a, b) => readMins(b.readTime) - readMins(a.readTime));
    return sorted;
  }, [allArticles, search, cat, sort]);

  const featuredInList = filtered.find((a) => a.featured) ?? null;
  const gridArticles   = useMemo(() => {
    if (!featuredInList) return filtered;
    return filtered.filter((a) => a._id !== featuredInList._id);
  }, [filtered, featuredInList]);

  const shown   = gridArticles.slice(0, visible);
  const hasMore = visible < gridArticles.length;
  const showActiveBar = search.trim() !== "" || cat !== "all";

  useEffect(() => { setVisible(6); }, [search, cat, sort]);

  // ── Image helper: support both absolute URLs and /uploads paths ─
  const imgSrc = (url: string) =>
    url?.startsWith("http") ? url : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${url}`;

  return (
    <>
      <header className="page-header">
        <div className="page-header-bg">
          <div className="ph-pattern" />
        </div>
        <div className="container">
          <nav aria-label="breadcrumb" className="page-breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">
                  <i className="bi bi-house me-1" />
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active">Articles</li>
            </ol>
          </nav>
          <div className="page-header-content">
            <span className="section-eyebrow light">Stories &amp; Insights</span>
            <h1 className="page-title">
              Community <em>Articles</em>
            </h1>
            <p className="page-subtitle">
              Voices, stories, and insights from the heart of our community — written by members, volunteers, and
              staff.
            </p>
          </div>
          <div className="ph-stat ph-stat-1">
            <span className="ph-num">{allArticles.length}</span>
            <span className="ph-label">Articles</span>
          </div>
          <div className="ph-stat ph-stat-2">
            <span className="ph-num">{uniqueWriters(allArticles)}</span>
            <span className="ph-label">Writers</span>
          </div>
        </div>
        <div className="page-header-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--clr-cream)" />
          </svg>
        </div>
      </header>

      <section className="articles-controls">
        <div className="container">
          <Reveal className="controls-bar reveal-up">
            <div className="search-box">
              <i className="bi bi-search" />
              <input
                type="search"
                placeholder="Search articles…"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search ? (
                <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch("")}>
                  <i className="bi bi-x" />
                </button>
              ) : null}
            </div>
            <div className="cat-filters">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={"cat-btn" + (cat === c ? " active" : "")}
                  onClick={() => setCat(c)}
                >
                  {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
            <div className="sort-box">
              <label htmlFor="sortSelect">
                <i className="bi bi-sort-down me-1" />
              </label>
              <select id="sortSelect" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="read-asc">Shortest read</option>
                <option value="read-desc">Longest read</option>
              </select>
            </div>
          </Reveal>

          {showActiveBar && (
            <div className="active-filter-display">
              <span>
                {search ? `Search: "${search}"` : null}
                {search && cat !== "all" ? " · " : null}
                {cat !== "all" ? `Category: ${cat}` : null}
              </span>
              <button
                type="button"
                className="clear-filters-btn"
                onClick={() => { setSearch(""); setCat("all"); }}
              >
                <i className="bi bi-x" /> Clear
              </button>
            </div>
          )}

          {!loading && (
            <p className="results-count">
              {filtered.length} article{filtered.length === 1 ? "" : "s"} found
            </p>
          )}
        </div>
      </section>

      {/* ── Loading state ── */}
      {loading && (
        <section className="section-articles-grid">
          <div className="container">
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite", display: "inline-block" }} />
              </div>
              <h3>Loading articles…</h3>
            </div>
          </div>
        </section>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <section className="section-articles-grid">
          <div className="container">
            <div className="empty-state">
              <div className="empty-icon"><i className="bi bi-exclamation-circle" /></div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured article ── */}
      {!loading && !error && featuredInList && (
        <section className="section-featured-article" id="featuredZone">
          <div className="container">
            <Reveal className="featured-strip reveal-up">
              <Link
                to={`/articles/${featuredInList.slug}`}
                className="fs-image"
                style={{ backgroundImage: `url(${imgSrc(featuredInList.image)})` }}
                aria-label={`Read: ${featuredInList.title}`}
              />
              <div className="fs-body">
                <span className="fs-cat">{featuredInList.category}</span>
                <h2>{featuredInList.title}</h2>
                <p>{featuredInList.excerpt}</p>
                <Link to={`/articles/${featuredInList.slug}`} className="link-arrow mt-2">
                  Read full story <i className="bi bi-arrow-right" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Articles grid ── */}
      {!loading && !error && (
        <section className="section-articles-grid">
          <div className="container">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><i className="bi bi-file-earmark-text" /></div>
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter to find what you're looking for.</p>
                <button
                  type="button"
                  className="btn btn-primary-main"
                  onClick={() => { setSearch(""); setCat("all"); }}
                >
                  Show All Articles
                </button>
              </div>
            ) : (
              <>
                <div className="articles-grid">
                  {shown.map((a) => (
                    <Link key={a._id} to={`/articles/${a.slug}`} className="article-grid-card">
                      <div className="ag-img" style={{ backgroundImage: `url(${imgSrc(a.image)})` }} />
                      <div className="ag-body">
                        <div className="ag-meta">{a.date} · {a.readTime}</div>
                        <span className="ag-cat">{a.category}</span>
                        <h3>{a.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
                {hasMore && (
                  <div className="load-more-wrap">
                    <button type="button" className="btn btn-load-more" onClick={() => setVisible((v) => v + 6)}>
                      Load More Articles <i className="bi bi-arrow-down ms-1" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <section className="section-newsletter">
        <div className="container">
          <NewsletterBand />
        </div>
      </section>
    </>
  );
}

function NewsletterBand() {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <Reveal className="newsletter-band reveal-up">
      <div className="nl-icon"><i className="bi bi-envelope-open-heart" /></div>
      <div className="nl-text">
        <h3>Stay in the Loop</h3>
        <p>Get our monthly newsletter with article highlights, events, and community news.</p>
      </div>
      <form
        className="nl-form"
        onSubmit={(e) => {
          e.preventDefault();
          setMsg("You're subscribed! Look out for our next newsletter.");
          e.currentTarget.reset();
        }}
      >
        <input type="email" placeholder="Your email address" required />
        <button type="submit">Subscribe <i className="bi bi-arrow-right" /></button>
      </form>
      {msg && (
        <div className="w-100 mt-2">
          <div className="alert alert-success" style={{ borderRadius: 10, fontSize: "0.9rem" }}>
            <i className="bi bi-check-circle-fill me-2" />{msg}
          </div>
        </div>
      )}
    </Reveal>
  );
}