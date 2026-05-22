import { useEffect, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import GalleryPage from './pages/GalleryPage';
import AdminRouter from './admin/AdminRouter';

function Layout({ inner, children }: { inner?: boolean; children: ReactNode }) {
  useEffect(() => {
    if (!inner) return;
    document.body.classList.add("inner-page");
    return () => document.body.classList.remove("inner-page");
  }, [inner]);
  return (
    <>
      <Navbar variant={inner ? "inner" : "home"} />
      {children}
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <div className="container py-5 text-center" style={{ minHeight: "50vh" }}>
      <h1 className="section-heading">Page not found</h1>
      <p className="section-body">The page you requested does not exist.</p>
      <a href="/" className="btn btn-primary-main mt-3">Back home</a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Layout><HomePage /></Layout>}
      />

      <Route
        path="/articles"
        element={<Layout inner><ArticlesPage /></Layout>}
      />
      <Route
        path="/articles/:slug"
        element={<Layout inner><ArticleDetailPage /></Layout>}
      />

      <Route
        path="/events"
        element={<Layout inner><EventsPage /></Layout>}
      />
      {/* ✅ Fixed: was :id, now :slug to match EventDetailPage */}
      <Route
        path="/events/:slug"
        element={<Layout inner><EventDetailPage /></Layout>}
      />

      {/* ✅ New: Gallery page */}
      <Route
        path="/gallery"
        element={<Layout inner><GalleryPage /></Layout>}
      />

      {/* Admin panel — no Navbar/Footer wrapper */}
      <Route path="/admin/*" element={<AdminRouter />} />

      <Route
        path="*"
        element={<Layout inner><NotFound /></Layout>}
      />
    </Routes>
  );
}