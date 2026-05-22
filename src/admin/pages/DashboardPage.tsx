import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminArticles, adminEvents, adminGallery, adminUsers } from '../services/adminApi';
import { PageHeader, StatCard, Spinner, Badge } from '../components/Shared';
import './Dashboard.css';

interface Stats {
  articles: number;
  events: number;
  gallery: number;
  users: number;
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({ articles: 0, events: 0, gallery: 0, users: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [artRes, evtRes, galRes] = await Promise.all([
          adminArticles.list({ limit: 5 }),
          adminEvents.list({ limit: 5, status: 'upcoming' }),
          adminGallery.list(),
        ]);

        let userCount = 0;
        if (isAdmin) {
          try {
            const uRes = await adminUsers.list();
            userCount = uRes.data.length;
          } catch {}
        }

        setStats({
          articles: artRes.data.total || artRes.data.articles?.length || 0,
          events: evtRes.data.total || evtRes.data.events?.length || 0,
          gallery: Array.isArray(galRes.data) ? galRes.data.length : galRes.data.items?.length || 0,
          users: userCount,
        });
        setRecentArticles(artRes.data.articles?.slice(0, 5) || []);
        setUpcomingEvents(evtRes.data.events?.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAdmin]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <Spinner />;

  return (
    <div className="dash">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening with your website today."
      />

      {/* Stats Grid */}
      <div className="dash-stats">
        <Link to="/admin/articles" className="dash-stat-link">
          <StatCard label="Total Articles" value={stats.articles} icon="✦" color="#c9a84c" />
        </Link>
        <Link to="/admin/events" className="dash-stat-link">
          <StatCard label="Total Events" value={stats.events} icon="◈" color="#60a5fa" />
        </Link>
        <Link to="/admin/gallery" className="dash-stat-link">
          <StatCard label="Gallery Items" value={stats.gallery} icon="▣" color="#a78bfa" />
        </Link>
        {isAdmin && (
          <Link to="/admin/users" className="dash-stat-link">
            <StatCard label="Users" value={stats.users} icon="◉" color="#34d399" />
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dash-section">
        <h2 className="dash-section-title">Quick Actions</h2>
        <div className="dash-actions">
          <Link to="/admin/articles/new" className="dash-action">
            <span className="dash-action-icon" style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c' }}>✦</span>
            <span>New Article</span>
          </Link>
          <Link to="/admin/events/new" className="dash-action">
            <span className="dash-action-icon" style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>◈</span>
            <span>New Event</span>
          </Link>
          <Link to="/admin/gallery" className="dash-action">
            <span className="dash-action-icon" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>▣</span>
            <span>Upload Photo</span>
          </Link>
          {isAdmin && (
            <Link to="/admin/users/new" className="dash-action">
              <span className="dash-action-icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>◉</span>
              <span>Add User</span>
            </Link>
          )}
        </div>
      </div>

      <div className="dash-cols">
        {/* Recent Articles */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Recent Articles</h2>
            <Link to="/admin/articles" className="dash-see-all">See all →</Link>
          </div>
          <div className="dash-list">
            {recentArticles.length === 0 && (
              <p className="dash-empty">No articles yet.</p>
            )}
            {recentArticles.map((a: any) => (
              <Link key={a._id} to={`/admin/articles/${a._id}`} className="dash-list-item">
                <div className="dash-item-img">
                  {a.image
                    ? <img src={a.image.startsWith('http') ? a.image : `http://localhost:5000${a.image}`} alt={a.title} />
                    : <span>✦</span>
                  }
                </div>
                <div className="dash-item-info">
                  <span className="dash-item-title">{a.title}</span>
                  <span className="dash-item-meta">{a.date} · {a.author}</span>
                </div>
                <Badge
                  label={a.published ? 'Published' : 'Draft'}
                  variant={a.published ? 'success' : 'warning'}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Upcoming Events</h2>
            <Link to="/admin/events" className="dash-see-all">See all →</Link>
          </div>
          <div className="dash-list">
            {upcomingEvents.length === 0 && (
              <p className="dash-empty">No upcoming events.</p>
            )}
            {upcomingEvents.map((e: any) => (
              <Link key={e._id} to={`/admin/events/${e._id}`} className="dash-list-item">
                <div className="dash-event-date">
                  <span className="dash-event-day">{e.day}</span>
                  <span className="dash-event-month">{e.month?.slice(0, 3)}</span>
                </div>
                <div className="dash-item-info">
                  <span className="dash-item-title">{e.title}</span>
                  <span className="dash-item-meta">{e.location} · {e.timeStart}</span>
                </div>
                <Badge label={e.status} variant={e.status === 'upcoming' ? 'info' : 'default'} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}