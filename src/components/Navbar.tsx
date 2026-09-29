import { useEffect, useState } from "react";
import { useContent, imageUrl } from '../content';
import Collapse from "bootstrap/js/dist/collapse";
import { NavLink, Link, useLocation } from "react-router-dom";

// Compute active state manually so hash links (e.g. "/#about") only become active
// when the current pathname and hash both match. Also ensure section links on
// the homepage don't accidentally mark other pages as active.
function useNavLinkClass() {
  const location = useLocation();
  return (to: string) => {
    // split out any hash from the `to` value ("/#about" => pathname='/' hash='#about')
    const [pathnamePart, hashPart] = to.split("#");
    const pathname = pathnamePart || "/";
    const hash = hashPart ? `#${hashPart}` : "";

    let active = false;
    if (hash) {
      active = location.pathname === pathname && location.hash === hash;
    } else {
      // match exact pathname or deeper routes (e.g. /articles and /articles/:slug)
      active = location.pathname === pathname || location.pathname.startsWith(pathname + "/");
    }
    return "nav-link" + (active ? " active" : "");
  };
}

export function Navbar({ variant }: { variant: "home" | "inner" }) {
  const {branding,navigation} = useContent();
  const [scrolled, setScrolled] = useState(variant === "inner");
  const navLinkClass = useNavLinkClass();

  useEffect(() => {
    if (variant === "inner") return;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    const closeNav = () => {
      const collapse = document.getElementById("navContent");
      if (collapse?.classList.contains("show")) {
        Collapse.getInstance(collapse)?.hide();
      }
    };
    document.querySelectorAll("#navContent .nav-link").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
    return () => {
      document.querySelectorAll("#navContent .nav-link").forEach((link) => {
        link.removeEventListener("click", closeNav);
      });
    };
  }, []);

  const navClass =
    "navbar navbar-expand-lg fixed-top" +
    (scrolled || variant === "inner" ? " scrolled" : "");

  return (
    <nav className={navClass} id="mainNav">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-emblem">
            <img
              alt="Al Burhaniya International"
              src={imageUrl(variant === "inner" ? branding.logoInvert : scrolled ? branding.logoInvert : branding.logo)}
              style={{ maxWidth: 250, width: "100%" }}
              width="100%"
            />
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
          aria-controls="navContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="toggler-bar" />
          <span className="toggler-bar" />
          <span className="toggler-bar" />
        </button>
        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <NavLink className={() => navLinkClass('/#about')} to="/#about">
                {navigation.about}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={() => navLinkClass('/#activities')} to="/#activities">
                {navigation.activities}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={() => navLinkClass('/events')} to="/events">
                {navigation.events}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={() => navLinkClass('/articles')} to="/articles">
                {navigation.articles}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={() => navLinkClass('/gallery')} to="/gallery">
                {navigation.gallery}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={() => navLinkClass('/#contact')} to="/#contact">
                {navigation.contact}
              </NavLink>
            </li>
            <li className="nav-item ms-lg-3">
              <button
                type="button"
                className="btn btn-donate"
                onClick={() => {
                  window.dispatchEvent(new Event("open-donation-modal"));

                  // Close the mobile navigation menu after clicking
                  const navContent = document.getElementById("navContent");

                  if (navContent?.classList.contains("show")) {
                    Collapse.getInstance(navContent)?.hide();
                  }
                }}
              >
                <i className="bi bi-heart-fill me-1" />
                {navigation.donate}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
