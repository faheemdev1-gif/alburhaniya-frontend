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
import NewsletterActionPage from './pages/NewsletterActionPage';
import AdminRouter from './admin/AdminRouter';
import { DonationProvider } from './context/DonationContext';
import DonationReturnPage from './pages/DonationReturnPage';
import { ContentProvider } from './content';
import FloatingStripeButton from "./components/FloatingStripeButton";


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
    <ContentProvider>
      <DonationProvider>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />

          <Route
            path="/articles"
            element={
              <Layout inner>
                <ArticlesPage />
              </Layout>
            }
          />

          <Route
            path="/articles/:slug"
            element={
              <Layout inner>
                <ArticleDetailPage />
              </Layout>
            }
          />

          <Route
            path="/events"
            element={
              <Layout inner>
                <EventsPage />
              </Layout>
            }
          />

          <Route
            path="/events/:slug"
            element={
              <Layout inner>
                <EventDetailPage />
              </Layout>
            }
          />

          <Route
            path="/gallery"
            element={
              <Layout inner>
                <GalleryPage />
              </Layout>
            }
          />

          <Route path="/newsletter/confirm" element={<Layout inner><NewsletterActionPage key="confirm" action="confirm" /></Layout>} />
          <Route path="/newsletter/unsubscribe" element={<Layout inner><NewsletterActionPage key="unsubscribe" action="unsubscribe" /></Layout>} />

          <Route path="/donation/return" element={<Layout inner><DonationReturnPage /></Layout>} />

          <Route path="/admin/*" element={<AdminRouter />} />

          <Route
            path="*"
            element={
              <Layout inner>
                <NotFound />
              </Layout>
            }
          />
        </Routes>

        <FloatingStripeButton />
      </DonationProvider>
    </ContentProvider>
  );
}