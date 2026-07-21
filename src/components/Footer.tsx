import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-top row gy-4">
          <div className="col-lg-4">
            <Link to="/" className="footer-brand">
              <span className="brand-emblem">
                <img alt="" src="/logo.png" width="100%" style={{ maxWidth: 250 }} />
              </span>
              {/* <span className="brand-name">Al Burhaniya International</span> */}
            </Link>
            <p className="footer-tagline">
              A living community — rooted in heritage, growing toward a shared future.
            </p>
            <p className="footer-charity">Community Interest Company</p>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="footer-heading">Explore</h6>
            <ul className="footer-links">
              <li>
                <Link to="/#about">About Us</Link>
              </li>
              <li>
                <Link to="/#activities">Activities</Link>
              </li>
              <li>
                <Link to="/#events">Events</Link>
              </li>
              <li>
                <Link to="/articles">Articles</Link>
              </li>
              <li>
                <Link to="/#gallery">Gallery</Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="footer-heading">Get Involved</h6>
            <ul className="footer-links">
              <li>
                <a href="#">Join as Member</a>
              </li>
              <li>
                <a href="#">Volunteer</a>
              </li>
              <li>
                <Link to="/#donate">Donate</Link>
              </li>
              <li>
                <a href="#">Partner With Us</a>
              </li>
              <li>
                <a href="#">Hire Our Space</a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="footer-heading">Programmes</h6>
            <ul className="footer-links">
              <li>
                <a href="#">Youth Club</a>
              </li>
              <li>
                <a href="#">Seniors Wellbeing</a>
              </li>
              <li>
                <a href="#">Music &amp; Arts</a>
              </li>
              <li>
                <a href="#">Sports Leagues</a>
              </li>
              <li>
                <a href="#">Cultural Events</a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="footer-heading">Info</h6>
            <ul className="footer-links">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Cookie Policy</a>
              </li>
              <li>
                <a href="#">Safeguarding</a>
              </li>
              <li>
                <a href="#">Annual Report</a>
              </li>
              <li>
                <Link to="/#contact">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Al Burhaniya Community Trust. All rights reserved.</span>
          <div className="social-links">
            <a href="#" className="soc-link sm" aria-label="Facebook">
              <i className="bi bi-facebook" />
            </a>
            <a href="#" className="soc-link sm" aria-label="Instagram">
              <i className="bi bi-instagram" />
            </a>
            <a href="#" className="soc-link sm" aria-label="Twitter/X">
              <i className="bi bi-twitter-x" />
            </a>
            <a href="#" className="soc-link sm" aria-label="YouTube">
              <i className="bi bi-youtube" />
            </a>
          </div>
        </div>
      </div>
      
    </footer>
  );
}
