import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/home/HeroSection";
import { Reveal } from "../components/Reveal";
import { fetchArticles, type ApiArticle } from "../services/articleService";
import { fetchEvents, type ApiEvent } from "../services/eventService";
import api from "../services/api";

// ── Image helper ─────────────────────────────────────────────────
const imgSrc = (url: string) =>
  !url ? "" : url.startsWith("http")
    ? url
    : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${url}`;

// ── Back To Top ──────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      className={"back-to-top" + (visible ? " visible" : "")}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <i className="bi bi-arrow-up" />
    </button>
  );
}

// ── Value Cards ──────────────────────────────────────────────────
function ValueCards() {
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cards = wrap.querySelectorAll<HTMLElement>(".value-card");
    cards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, i * 100);
        });
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);
  return (
    <div className="about-values row g-3 mt-2" ref={wrapRef}>
      <div className="col-6">
        <div className="value-card">
          <i className="bi bi-people-fill" />
          <h5>Inclusivity</h5>
          <p>Every person belongs here, without exception.</p>
        </div>
      </div>
      <div className="col-6">
        <div className="value-card">
          <i className="bi bi-stars" />
          <h5>Excellence</h5>
          <p>We pursue quality in every programme we run.</p>
        </div>
      </div>
      <div className="col-6">
        <div className="value-card">
          <i className="bi bi-globe2" />
          <h5>Culture</h5>
          <p>Celebrating diversity as our greatest strength.</p>
        </div>
      </div>
      <div className="col-6">
        <div className="value-card">
          <i className="bi bi-globe2" />
          <h5>Service</h5>
          <p>Giving back to those who deserve and need the most.</p>
        </div>
      </div>
    </div>
  );
}

// ── Event List — fetched from API ────────────────────────────────
function EventList() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents({ status: "upcoming", limit: 5 })
      .then((res) => setEvents(res.events))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || loading || events.length === 0) return;
    const items = list.querySelectorAll<HTMLElement>(".event-item");
    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateX(-20px)";
      item.style.transition =
        "opacity 0.5s ease, transform 0.5s ease, border-color 0.35s ease, box-shadow 0.35s ease";
    });
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        items.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "translateX(0)";
          }, i * 100);
        });
        io.disconnect();
      },
      { threshold: 0.1 },
    );
    io.observe(list);
    return () => io.disconnect();
  }, [loading, events]);

  if (loading) {
    return (
      <div style={{ padding: "2rem 0", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        Loading events…
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: "2rem 0", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        No upcoming events at the moment. Check back soon!
      </div>
    );
  }

  return (
    <div className="events-list reveal-up" ref={listRef}>
      {events.map((ev) => (
        <div key={ev._id} className={"event-item" + (ev.featured ? " featured" : "")}>
          <div className="event-date-block">
            <span className="ev-month">{ev.month?.slice(0, 3).toUpperCase()}</span>
            <span className="ev-day">{ev.day}</span>
          </div>
          <div className="event-info">
            <span className={"ev-badge " + ev.categoryKey}>{ev.category}</span>
            <h4>{ev.title}</h4>
            <p>{ev.shortDesc}</p>
            <div className="ev-meta">
              <span>
                <i className="bi bi-clock me-1" />
                {ev.timeStart} – {ev.timeEnd}
              </span>
              <span>
                <i className="bi bi-geo-alt me-1" />
                {ev.location}
              </span>
            </div>
          </div>
          <div className="event-action">
            <Link to={`/events/${ev.slug}`} className={"btn btn-ev" + (ev.featured ? " featured" : "")}>
              Details <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Gallery Grid — fetched from API ──────────────────────────────
interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  size: "normal" | "tall" | "wide";
}

function GalleryGrid() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/gallery")
      .then((res) => setItems(Array.isArray(res.data) ? res.data : res.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  if (loading) {
    return (
      <div style={{ padding: "2rem 0", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        Loading gallery…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: "2rem 0", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        No gallery photos yet.
      </div>
    );
  }

  return (
    <>
      <div className="gallery-filters">
        {categories.map((f) => (
          <button
            key={f}
            type="button"
            className={"gf-btn" + (filter === f ? " active" : "")}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="gallery-masonry">
        {filtered.map((g) => (
          <div
            key={g._id}
            className={
              "g-item" +
              (g.size === "tall" ? " tall" : "") +
              (g.size === "wide" ? " wide" : "")
            }
            data-cat={g.category}
            style={{ animation: "fadeInScale .4s ease both" }}
          >
            <img src={imgSrc(g.imageUrl)} alt={g.title} />
            <div className="g-overlay">
              <span>{g.title}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Activities Grid (static — no change needed) ──────────────────
const activities = [
  { large: true, cat: "Gatherings", bg: "https://images.unsplash.com/photo-1609234656388-0ff363383899?w=900&q=80", icon: "bi-people", title: "Community Gatherings", body: "Monthly town halls, seasonal festivals, potluck dinners, and neighbourhood watch meetings that keep us united.", tag: "Every Month" },
  { cat: "Music", bg: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=80", icon: "bi-music-note-beamed", title: "Music", body: "Choir groups, instrument lessons, open-mic nights, and live concerts featuring local talent.", tag: "Weekly" },
  { cat: "Dance", bg: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&q=80", icon: "bi-activity", title: "Dance", body: "Bollywood, hip-hop, classical, salsa, and contemporary — classes for all levels and ages.", tag: "3× per Week" },
  { cat: "Arts", bg: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&q=80", icon: "bi-brush", title: "Arts & Crafts", body: "Painting, pottery, calligraphy, mosaics, and collaborative mural projects across the neighbourhood.", tag: "Tues & Sat" },
  { large: true, cat: "Sports", bg: "https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=900&q=80", icon: "bi-trophy", title: "Sports & Fitness", body: "Football, cricket, badminton, swimming, yoga, and annual community olympics. All skill levels welcome — fun is the only prerequisite.", tag: "Daily" },
  { cat: "Youth", bg: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&q=80", icon: "bi-mortarboard", title: "Youth & Education", body: "After-school tutoring, coding clubs, leadership workshops, and mentorship for young minds.", tag: "Mon–Fri" },
  { cat: "Seniors", bg: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=700&q=80", icon: "bi-heart-pulse", title: "Seniors Wellbeing", body: "Tea circles, gentle fitness, social lunches, digital literacy help, and wellbeing check-ins.", tag: "Daily" },
];

function ActivitiesGrid() {
  const [pulse, setPulse] = useState<string | null>(null);
  return (
    <Reveal className="activities-grid reveal-up">
      {activities.map((a) => (
        <div
          key={a.title}
          className={"act-card" + (a.large ? " large" : "")}
          data-category={a.cat}
          onMouseEnter={() => setPulse(a.title)}
          onMouseLeave={() => setPulse(null)}
        >
          <div className="act-bg" style={{ backgroundImage: `url('${a.bg}')` }} />
          <div className="act-body">
            <div className={"act-icon" + (pulse === a.title ? " pulse" : "")}>
              <i className={`bi ${a.icon}`} />
            </div>
            <h3>{a.title}</h3>
            <p>{a.body}</p>
            <span className="act-tag">{a.tag}</span>
          </div>
        </div>
      ))}
    </Reveal>
  );
}

// ── Testimonials (unchanged) ─────────────────────────────────────
const testimonials = [
  { quote: `"Al Burhaniya gave my children a place to belong when we first moved here. The dance classes and youth club changed everything for our family."`, img: "https://randomuser.me/api/portraits/women/44.jpg", name: "Aisha Malik", role: "Member since 2019" },
  { quote: `"I was 70 and lonely after my husband passed. The seniors tea circle brought me back to life. I've made friends I'll keep forever."`, img: "https://randomuser.me/api/portraits/women/72.jpg", name: "Margaret O'Brien", role: "Member since 2020" },
  { quote: `"The cricket league was the reason I got fit, and the reason I met my best friends. Worth every Saturday morning."`, img: "https://randomuser.me/api/portraits/men/32.jpg", name: "Ravi Sharma", role: "Member since 2018" },
  { quote: `"Running the community mural project was the most meaningful creative work I've done. Al Burhaniya makes art feel purposeful."`, img: "https://randomuser.me/api/portraits/women/28.jpg", name: "Elena Torres", role: "Volunteer Artist" },
  { quote: `"As a donor, I see exactly where my money goes. The annual impact report is transparent and the team is passionate. I give every year."`, img: "https://randomuser.me/api/portraits/men/58.jpg", name: "James Holloway", role: "Supporter since 2017" },
];

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [winW, setWinW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onR = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onR, { passive: true });
    return () => window.removeEventListener("resize", onR);
  }, []);

  const visible = winW < 768 ? 1 : winW < 992 ? 2 : 3;
  const max = Math.max(0, testimonials.length - visible);

  useEffect(() => { setIdx((i) => Math.min(i, max)); }, [max]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".testi-card");
    const cardWidth = card ? card.offsetWidth + 24 : 0;
    track.style.transform = `translateX(-${idx * cardWidth}px)`;
  }, [idx, winW]);

  return (
    <div className="testimonial-track-wrap reveal-up">
      <div className="testimonial-track" ref={trackRef}>
        {testimonials.map((t) => (
          <div className="testi-card" key={t.name}>
            <div className="testi-quote"><i className="bi bi-quote" /></div>
            <p>{t.quote}</p>
            <div className="testi-author">
              <img src={t.img} alt="" />
              <div>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="testi-nav prev" aria-label="Previous" onClick={() => setIdx((i) => (i <= 0 ? max : i - 1))}>
        <i className="bi bi-chevron-left" />
      </button>
      <button type="button" className="testi-nav next" aria-label="Next" onClick={() => setIdx((i) => (i >= max ? 0 : i + 1))}>
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  );
}

// ── Donate Card (unchanged) ──────────────────────────────────────
function DonateCard() {
  const amounts = ["£10", "£25", "£50", "£100", "£250", "Custom"];
  const [amt, setAmt] = useState("£10");
  const [freq, setFreq] = useState("One-time");
  const [btnState, setBtnState] = useState<"idle" | "thanks">("idle");
  const onDonateClick = () => {
    setBtnState("thanks");
    setTimeout(() => setBtnState("idle"), 4000);
  };
  return (
    <div className="donate-card">
      <h3>Choose an Amount</h3>
      <div className="donate-amounts">
        {amounts.map((a) => (
          <button key={a} type="button" className={"amt-btn" + (amt === a ? " active" : "") + (a === "Custom" ? " custom-amt" : "")} onClick={() => setAmt(a)}>{a}</button>
        ))}
      </div>
      <div className="donate-custom-wrap" style={{ display: amt === "Custom" ? "block" : "none" }}>
        <label htmlFor="custom-amt">Enter amount (£)</label>
        <input id="custom-amt" type="number" className="form-control" placeholder="e.g. 75" min={1} />
      </div>
      <div className="donate-frequency mt-3">
        {(["One-time", "Monthly", "Annually"] as const).map((f) => (
          <button key={f} type="button" className={"freq-btn" + (freq === f ? " active" : "")} onClick={() => setFreq(f)}>{f}</button>
        ))}
      </div>
      <div className="donate-form mt-3">
        <input type="text" className="form-control mb-2" placeholder="Full Name" />
        <input type="email" className="form-control mb-2" placeholder="Email Address" />
        <button type="button" className="btn btn-donate-submit w-100" onClick={onDonateClick} style={btnState === "thanks" ? { background: "var(--clr-green)" } : undefined}>
          {btnState === "thanks" ? <><i className="bi bi-check-circle-fill me-2" />Thank you for your support!</> : <><i className="bi bi-heart-fill me-2" />Donate Now</>}
        </button>
      </div>
      <p className="donate-note"><i className="bi bi-shield-check me-1" />Secure payment · Registered charity</p>
    </div>
  );
}

// ── Form Flash ───────────────────────────────────────────────────
function FormFlash({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div className="alert alert-success mt-3" style={{ borderRadius: 10, fontSize: "0.9rem" }}>
      <i className="bi bi-check-circle-fill me-2" />{message}
    </div>
  );
}

// ── Articles section (fetched) ───────────────────────────────────
function ArticlesSection() {
  const [featured, setFeatured] = useState<ApiArticle | null>(null);
  const [side, setSide] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles({ published: true, limit: 10 })
      .then((res) => {
        const arts = res.articles;
        const feat = arts.find((a) => a.featured) ?? arts[0] ?? null;
        setFeatured(feat);
        setSide(arts.filter((a) => a._id !== feat?._id).slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "2rem 0", color: "rgba(0,0,0,0.3)", textAlign: "center" }}>Loading articles…</div>;
  if (!featured) return null;

  return (
    <Reveal className="row g-4 reveal-up">
      <div className="col-lg-6">
        <div className="article-card featured-article">
          <div className="article-img">
            <img src={imgSrc(featured.image)} alt="" />
            <span className="art-cat-badge">{featured.category}</span>
          </div>
          <div className="article-body">
            <div className="art-meta">
              <span>{featured.date}</span>
              <span className="art-read">{featured.readTime}</span>
            </div>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <Link to={`/articles/${featured.slug}`} className="link-arrow mt-2">
              Read Story <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="d-flex flex-column gap-4 h-100">
          {side.map((a) => (
            <div className="article-card side-article" key={a._id}>
              <div className="article-img-sm">
                <img src={imgSrc(a.image)} alt="" />
              </div>
              <div className="article-body-sm">
                <div className="art-meta">
                  <span>{a.date}</span>
                  <span className="art-read">{a.readTime}</span>
                </div>
                <span className={"art-cat-tag " + a.categoryKey}>{a.category}</span>
                <h4>{a.title}</h4>
                <Link to={`/articles/${a.slug}`} className="link-arrow">
                  Read <i className="bi bi-arrow-right" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

// ── HomePage ─────────────────────────────────────────────────────
export function HomePage() {
  const [contactFlash, setContactFlash] = useState<string | null>(null);
  const [nlFlash, setNlFlash] = useState<string | null>(null);

  const onContact = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactFlash("Thanks for reaching out! We'll be in touch within 48 hours.");
    e.currentTarget.reset();
  };

  const onNl = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNlFlash("You're subscribed! Look out for our next newsletter.");
    e.currentTarget.reset();
  };

  useEffect(() => {
    const tickerSection = document.getElementById("stats-ticker");
    if (!tickerSection) return;
    let ran = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || ran) return;
        ran = true;
        document.querySelectorAll(".ticker-item").forEach((el, i) => {
          setTimeout(() => {
            (el as HTMLElement).style.transition = "color .4s ease";
            (el as HTMLElement).style.color = "rgba(255,255,255,1)";
          }, i * 60);
        });
      },
      { threshold: 0.5 },
    );
    io.observe(tickerSection);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <HeroSection />

      <section id="stats-ticker">
        <div className="ticker-wrap">
          <div className="ticker-track">
            <span className="ticker-item"><strong>2,400+</strong> Members</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>18 Years</strong> of Service</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>120+</strong> Events Per Year</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>34</strong> Active Programmes</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>6</strong> Cultural Chapters</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>2,400+</strong> Members</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>18 Years</strong> of Service</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>120+</strong> Events Per Year</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>34</strong> Active Programmes</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item"><strong>6</strong> Cultural Chapters</span>
            <span className="ticker-sep">✦</span>
          </div>
        </div>
      </section>

      <section id="about" className="section-about">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <Reveal className="about-image-collage reveal-left">
                <div className="collage-main"><img src="/images/20231006_090317.jpg" alt="Community" /></div>
                <div className="collage-thumb top"><img src="/images/20221007_154440.jpg" alt="Together" /></div>
                <div className="collage-thumb bottom"><img src="/images/20230812_230247.jpg" alt="Learning" /></div>
                <div className="collage-badge">
                  <span className="badge-year">EST.</span>
                  <span className="badge-num">2023</span>
                </div>
              </Reveal>
            </div>
            <div className="col-lg-6 ps-lg-5">
              <Reveal className="w-100 reveal-right">
                <span className="section-eyebrow">Who We Are</span>
                <h2 className="section-heading">A Community Built on<br /><em>Heart</em> &amp; <em>Heritage</em></h2>
                <p className="section-body">Al Burhaniya International was founded in 2023 with a simple but powerful belief — that a neighbourhood is only as strong as its bonds. Over nearly two decades, we have grown into a thriving hub of culture, sport, arts, learning, and mutual care.</p>
                <p className="section-body">We serve people of all ages, backgrounds, and abilities, offering free and low-cost programmes that enrich lives, foster friendships, and celebrate the rich tapestry of cultures that make us who we are.</p>
                <ValueCards />
                <a href="#activities" className="btn btn-primary-main mt-4">Explore What We Do <i className="bi bi-arrow-right ms-1" /></a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section id="activities" className="section-activities">
        <div className="container">
          <Reveal className="text-center mb-5 reveal-up">
            <span className="section-eyebrow light">What We Do</span>
            <h2 className="section-heading light">Activities &amp; Programmes</h2>
            <p className="section-body light mx-auto" style={{ maxWidth: 600 }}>From sunrise yoga to late-night music jams — there is something happening every single day of the week.</p>
          </Reveal>
          <ActivitiesGrid />
        </div>
      </section>

      <section id="events" className="section-events">
        <div className="container">
          <Reveal className="row align-items-end mb-5 reveal-up">
            <div className="col-lg-7">
              <span className="section-eyebrow">What's On</span>
              <h2 className="section-heading">Upcoming <em>Events</em></h2>
            </div>
            <div className="col-lg-5 text-lg-end">
              <Link to="/events" className="link-arrow">View Full Calendar <i className="bi bi-arrow-right" /></Link>
            </div>
          </Reveal>
          <EventList />
        </div>
      </section>

      <section id="articles" className="section-articles">
        <div className="container">
          <Reveal className="row align-items-end mb-5 reveal-up">
            <div className="col-lg-7">
              <span className="section-eyebrow">Stories &amp; Insights</span>
              <h2 className="section-heading">Latest <em>Articles</em></h2>
            </div>
            <div className="col-lg-5 text-lg-end">
              <Link to="/articles" className="link-arrow">All Articles <i className="bi bi-arrow-right" /></Link>
            </div>
          </Reveal>
          <ArticlesSection />
        </div>
      </section>

      <section id="gallery" className="section-gallery">
        <div className="container">
          <Reveal className="text-center mb-5 reveal-up">
            <span className="section-eyebrow light">Moments Captured</span>
            <h2 className="section-heading light">Our <em>Gallery</em></h2>
            <p className="section-body light">A glimpse into the life and spirit of Al Burhaniya.</p>
          </Reveal>
          <GalleryGrid />
          <div className="text-center mt-5 reveal-up">
            <Link to="/gallery" className="btn btn-primary-main mt-2">View Full Gallery</Link>
          </div>
        </div>
      </section>

      <section className="section-join">
        <div className="container">
          <Reveal className="join-band reveal-up">
            <div className="join-text">
              <h2>Become a <em>Member</em> Today</h2>
              <p>Join 2,400+ neighbours who are already part of the Al Burhaniya family. Free membership, full access.</p>
            </div>
            <div className="join-actions">
              <a href="#contact" className="btn btn-join-light">Sign Up Free</a>
              <a href="#donate" className="btn btn-join-outline">Support Us Instead</a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="donate" className="section-donate">
        <div className="donate-bg-pattern" />
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <Reveal className="reveal-left">
                <span className="section-eyebrow light">Make a Difference</span>
                <h2 className="section-heading light">Your Support <em>Changes Lives</em></h2>
                <p className="section-body light">Every pound donated goes directly into our programmes, keeping them free and accessible for everyone — especially those who need them most.</p>
                <div className="impact-list mt-4">
                  <div className="impact-item"><span className="impact-icon"><i className="bi bi-gift" /></span><div><strong>£10</strong><span>Covers materials for one art workshop session</span></div></div>
                  <div className="impact-item"><span className="impact-icon"><i className="bi bi-people" /></span><div><strong>£25</strong><span>Funds a senior's wellbeing tea circle for a month</span></div></div>
                  <div className="impact-item"><span className="impact-icon"><i className="bi bi-trophy" /></span><div><strong>£50</strong><span>Sponsors a young person's sports programme for a term</span></div></div>
                  <div className="impact-item"><span className="impact-icon"><i className="bi bi-building-heart" /></span><div><strong>£100+</strong><span>Helps sustain a full community programme for a season</span></div></div>
                </div>
              </Reveal>
            </div>
            <div className="col-lg-5 offset-lg-1">
              <Reveal className="reveal-right"><DonateCard /></Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section-testimonials">
        <div className="container">
          <Reveal className="text-center mb-5 reveal-up">
            <span className="section-eyebrow">Community Voices</span>
            <h2 className="section-heading">What Our Members <em>Say</em></h2>
          </Reveal>
          <Testimonials />
        </div>
      </section>

      <section id="contact" className="section-contact">
        <div className="container">
          <div className="row gy-5">
            <div className="col-lg-5">
              <Reveal className="reveal-left">
                <span className="section-eyebrow">Get In Touch</span>
                <h2 className="section-heading">We'd Love to <em>Hear</em><br />From You</h2>
                <p className="section-body">Whether you want to join, volunteer, partner, or just ask a question — our doors (and inboxes) are always open.</p>
                <div className="contact-info mt-4">
                  <div className="ci-item"><div className="ci-icon"><i className="bi bi-geo-alt-fill" /></div><div><strong>Address</strong><span>164 Cheetham Hill Rd, Cheetham Hill, Manchester M8 8LQ</span></div></div>
                  <div className="ci-item"><div className="ci-icon"><i className="bi bi-telephone-fill" /></div><div><strong>Phone</strong><span>+44 74 5942 4579</span></div></div>
                  <div className="ci-item"><div className="ci-icon"><i className="bi bi-envelope-fill" /></div><div><strong>Email</strong><span>info@al-burhaniyainternational.co.uk</span></div></div>
                  <div className="ci-item"><div className="ci-icon"><i className="bi bi-clock-fill" /></div><div><strong>Opening Hours</strong><span>Mon–Fri 8am–9pm · Sat–Sun 9am–6pm</span></div></div>
                </div>
                <div className="social-links mt-4">
                  <a href="#" className="soc-link" aria-label="Facebook"><i className="bi bi-facebook" /></a>
                  <a href="#" className="soc-link" aria-label="Instagram"><i className="bi bi-instagram" /></a>
                  <a href="#" className="soc-link" aria-label="Twitter/X"><i className="bi bi-twitter-x" /></a>
                  <a href="#" className="soc-link" aria-label="YouTube"><i className="bi bi-youtube" /></a>
                  <a href="#" className="soc-link" aria-label="WhatsApp"><i className="bi bi-whatsapp" /></a>
                </div>
              </Reveal>
            </div>
            <div className="col-lg-6 offset-lg-1">
              <Reveal className="reveal-right">
                <form className="contact-form" onSubmit={onContact}>
                  <div className="row g-3">
                    <div className="col-md-6"><div className="cf-field"><label htmlFor="cf-first">First Name</label><input id="cf-first" type="text" className="form-control" placeholder="Jane" required /></div></div>
                    <div className="col-md-6"><div className="cf-field"><label htmlFor="cf-last">Last Name</label><input id="cf-last" type="text" className="form-control" placeholder="Smith" required /></div></div>
                    <div className="col-12"><div className="cf-field"><label htmlFor="cf-email">Email</label><input id="cf-email" type="email" className="form-control" placeholder="jane@example.com" required /></div></div>
                    <div className="col-12"><div className="cf-field"><label htmlFor="cf-interest">I'm interested in…</label><select id="cf-interest" className="form-select" defaultValue="Joining as a member"><option>Joining as a member</option><option>Volunteering</option><option>Partnering / Sponsorship</option><option>A specific programme</option><option>General enquiry</option></select></div></div>
                    <div className="col-12"><div className="cf-field"><label htmlFor="cf-msg">Message</label><textarea id="cf-msg" className="form-control" rows={5} placeholder="Tell us a little about yourself or your question…" required /></div></div>
                    <div className="col-12"><button type="submit" className="btn btn-primary-main w-100">Send Message <i className="bi bi-arrow-right ms-1" /></button></div>
                  </div>
                </form>
                {contactFlash ? <FormFlash message={contactFlash} onDone={() => setContactFlash(null)} /> : null}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section-newsletter">
        <div className="container">
          <Reveal className="newsletter-band reveal-up">
            <div className="nl-icon"><i className="bi bi-envelope-open-heart" /></div>
            <div className="nl-text">
              <h3>Stay in the Loop</h3>
              <p>Get our monthly newsletter with event highlights, articles, and community news.</p>
            </div>
            <form className="nl-form" onSubmit={onNl}>
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe <i className="bi bi-arrow-right" /></button>
            </form>
            {nlFlash ? <div className="w-100 mt-2"><FormFlash message={nlFlash} onDone={() => setNlFlash(null)} /></div> : null}
          </Reveal>
        </div>
      </section>

      <BackToTop />
    </>
  );
}