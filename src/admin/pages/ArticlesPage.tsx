import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminArticles } from '../services/adminApi';
import { PageHeader, Badge, Btn, Spinner, EmptyState, ConfirmModal } from '../components/Shared';
import './ListPage.css';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: any = { published: 'all', limit: 100 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const res = await adminArticles.list(params);
      setArticles(res.data.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, [search, category]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminArticles.delete(deleteId);
      setArticles(prev => prev.filter(a => a._id !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const CATEGORIES = ['all','community','youth','culture','sports','seniors','arts'];

  return (
    <div className="list-page">
      <PageHeader
        title="Articles"
        subtitle={`${articles.length} article${articles.length !== 1 ? 's' : ''} total`}
        action={
          <Btn onClick={() => navigate('/admin/articles/new')}>+ New Article</Btn>
        }
      />

      {/* Filters */}
      <div className="list-filters">
        <input
          className="admin-input list-search"
          placeholder="Search articles…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="list-tabs">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`list-tab ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : articles.length === 0 ? (
        <EmptyState icon="✦" title="No articles found" body="Create your first article to get started." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Author</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a._id}>
                  <td>
                    <div className="table-title-cell">
                      <div className="table-thumb">
                        {a.image
                          ? <img src={a.image.startsWith('http') ? a.image : `http://localhost:5000${a.image}`} alt="" />
                          : <span>✦</span>
                        }
                      </div>
                      <div>
                        <div className="table-primary">{a.title}</div>
                        <div className="table-secondary">{a.excerpt?.slice(0, 60)}…</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge label={a.categoryKey} /></td>
                  <td className="table-muted">{a.author}</td>
                  <td className="table-muted">{a.date}</td>
                  <td>
                    <Badge
                      label={a.featured ? 'Featured' : a.published ? 'Published' : 'Draft'}
                      variant={a.featured ? 'warning' : a.published ? 'success' : 'default'}
                    />
                  </td>
                  <td>
                    <div className="table-actions">
                      <Btn small variant="secondary" onClick={() => navigate(`/admin/articles/${a._id}`)}>Edit</Btn>
                      <Btn small variant="danger" onClick={() => setDeleteId(a._id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="Delete this article? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}