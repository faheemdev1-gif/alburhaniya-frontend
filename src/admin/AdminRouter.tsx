import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireAdmin } from './components/RequireAuth';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleFormPage from './pages/ArticleFormPage';
import EventsPage from './pages/EventsPage';
import EventFormPage from './pages/EventFormPage';
import GalleryPage from './pages/GalleryPage';
import UsersPage from './pages/UsersPage';

// Import shared styles once here
import './components/Shared.css';
import './components/AdminLayout.css';

export default function AdminRouter() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="login" element={<LoginPage />} />

        {/* Protected layout */}
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/new" element={<ArticleFormPage />} />
          <Route path="articles/:id" element={<ArticleFormPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/new" element={<EventFormPage />} />
          <Route path="events/:id" element={<EventFormPage />} />
          <Route path="gallery" element={<GalleryPage />} />

          {/* Admin-only */}
          <Route
            path="users"
            element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="users/new"
            element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}