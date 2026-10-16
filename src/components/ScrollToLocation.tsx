import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router changes the URL without the browser's normal anchor scrolling.
export function ScrollToLocation() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    // Wait for the layout to remove/add the inner-page body padding first.
    const frame = requestAnimationFrame(() => {
      if (hash) {
        let id: string;
        try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);
  return null;
}
