import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  fetchArticleById,
  fetchRelatedArticles,
  type ApiArticle,
} from "../services/articleService";

// Helper: support both absolute URLs and /uploads/ paths
const imgSrc = (url: string) =>
  url?.startsWith("http")
    ? url
    : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${url}`;

export function ArticleDetailPage() {
  const { slug } = useParams();

  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [related, setRelated] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    // fetchArticleById also accepts a slug — your backend handles both
    fetchArticleById(slug)
      .then((art) => {
        setArticle(art);
        // Fetch related articles using the MongoDB _id
        return fetchRelatedArticles(art._id);
      })
      .then((rel) => setRelated(rel))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!slug) return <Navigate to="/articles" replace />;

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container article-detail py-5 text-center">
        <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.4 }}>
          <i className="bi bi-arrow-repeat" />
        </div>
        <p style={{ color: "var(--clr-muted, #888)" }}>Loading article…</p>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────
  if (notFound || !article) {
    return (
      <div className="container article-detail py-5 text-center">
        <h1>Article not found</h1>
        <Link to="/articles" className="btn btn-primary-main mt-3">
          Back to articles
        </Link>
      </div>
    );
  }

  // ── Article ──────────────────────────────────────────────────
  return (
    <article className="article-detail">
      <div className="container article-detail-inner">
        <nav aria-label="breadcrumb" className="py-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/articles">Articles</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>

        <img
          className="article-hero-img"
          src={imgSrc(article.image)}
          alt={article.title}
        />

        <div className="ad-meta">
          <span>{article.date}</span>
          <span>{article.readTime}</span>
          <span className="ad-author">
            {article.authorAvatar && (
              <img src={imgSrc(article.authorAvatar)} alt="" />
            )}
            <span>
              {article.author}
              {article.authorRole ? ` · ${article.authorRole}` : ""}
            </span>
          </span>
        </div>

        <h1>{article.title}</h1>

        <div
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {related.length > 0 && (
          <div className="related-block">
            <h2>Related stories</h2>
            <div className="related-list">
              {related.map((r) => (
                <Link
                  key={r._id}
                  to={`/articles/${r.slug}`}
                  className="related-card"
                >
                  <div
                    className="rc-thumb"
                    style={{ backgroundImage: `url(${imgSrc(r.image)})` }}
                  />
                  <div>
                    <span className="ag-cat">{r.category}</span>
                    <h4>{r.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-5">
          <Link to="/articles" className="btn btn-primary-main">
            <i className="bi bi-arrow-left me-2" />
            All articles
          </Link>
        </div>
      </div>
    </article>
  );
}