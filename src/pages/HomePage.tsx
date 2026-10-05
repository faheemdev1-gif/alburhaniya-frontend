import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/home/HeroSection";
import { Reveal } from "../components/Reveal";
import { fetchArticles, type ApiArticle } from "../services/articleService";
import { fetchEvents, type ApiEvent } from "../services/eventService";
import api from "../services/api";
import StripeBuyButton from "../components/StripeBuyButton";
import { useContent, imageUrl, rich, safeHref, type SiteContent } from "../content";

// ── Image helper ─────────────────────────────────────────────────
const imgSrc = imageUrl;

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
function ValueCards({values}:{values:SiteContent['about']['values']}) {
  return <div className="about-values row g-3 mt-2">{values.map((v,i)=><div className="col-6" key={i}><div className="value-card"><i className={`bi ${v.icon}`} /><h5>{v.title}</h5><p>{v.body}</p></div></div>)}</div>;
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
  thumbnailUrl?: string;
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
            <img src={imgSrc(g.thumbnailUrl || g.imageUrl)} alt={g.title} />
            <div className="g-overlay">
              <span>{g.title}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ActivitiesGrid({activities}:{activities:SiteContent['activities']['cards']}) {
  const [pulse, setPulse] = useState<string | null>(null);
  return <Reveal className="activities-grid reveal-up">{activities.map((a,i)=><div key={i} className={"act-card"+(a.large?" large":"")} data-category={a.cat} onMouseEnter={()=>setPulse(a.title)} onMouseLeave={()=>setPulse(null)}><div className="act-bg" style={{backgroundImage:`url('${imageUrl(a.bg)}')`}}/><div className="act-body"><div className={"act-icon"+(pulse===a.title?" pulse":"")}><i className={`bi ${a.icon}`}/></div><h3>{a.title}</h3><p>{a.body}</p><span className="act-tag">{a.tag}</span></div></div>)}</Reveal>;
}

// ── Testimonials (unchanged) ─────────────────────────────────────
function Testimonials({testimonials}:{testimonials:SiteContent['testimonials']['items']}) {
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
        {testimonials.map((t,i) => (
          <div className="testi-card" key={t.name+i}>
            <div className="testi-quote"><i className="bi bi-quote" /></div>
            <p>{t.quote}</p>
            <div className="testi-author">
              <img src={imageUrl(t.img)} alt="" />
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
  const content = useContent();
  const {stats,about,activities,events,articles,gallery,join,donate,testimonials,contact,newsletter} = content;
  const heading = (html:string) => rich(html);
  const [contactFlash, setContactFlash] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSending, setContactSending] = useState(false);
  const contactPending = useRef(false);
  const contactSubmission = useRef<string | null>(null);
  const [nlFlash, setNlFlash] = useState<string | null>(null);

  const onContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (contactPending.current) return;
    const form = e.currentTarget;
    const fields = new FormData(form);
    contactPending.current = true;
    setContactSending(true); setContactError(null); setContactFlash(null);
    try {
      contactSubmission.current ||= crypto.randomUUID();
      await api.post('/contact', {
        submissionId: contactSubmission.current,
        firstName: fields.get('firstName'), lastName: fields.get('lastName'), email: fields.get('email'),
        interest: fields.get('interest'), message: fields.get('message'), website: fields.get('website'),
      });
      setContactFlash('Thank you. Your message has been received.');
      form.reset(); contactSubmission.current = null;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status < 500) contactSubmission.current = null;
      setContactError(status === 404 ? 'The contact form is temporarily unavailable. Please contact us using the email shown here.' :
        err?.response?.data?.message || 'Your message could not be sent. Please try again; your form has been kept.');
    } finally { contactPending.current = false; setContactSending(false); }
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
          <div className="ticker-track">{[...stats.items,...stats.items].map((item,i)=><Fragment key={i}><span className="ticker-item"><strong>{item.value}</strong> {item.label}</span><span className="ticker-sep">✦</span></Fragment>)}</div>
        </div>
      </section>

      <section id="about" className="section-about">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <Reveal className="about-image-collage reveal-left">
                <div className="collage-main"><img src={imageUrl(about.imageMain)} alt="Community" /></div>
                <div className="collage-thumb top"><img src={imageUrl(about.imageTop)} alt="Together" /></div>
                <div className="collage-thumb bottom"><img src={imageUrl(about.imageBottom)} alt="Learning" /></div>
                <div className="collage-badge">
                  <span className="badge-year">EST.</span>
                  <span className="badge-num">{about.established}</span>
                </div>
              </Reveal>
            </div>
            <div className="col-lg-6 ps-lg-5">
              <Reveal className="w-100 reveal-right">
                <span className="section-eyebrow">{about.eyebrow}</span>
                <h2 className="section-heading" dangerouslySetInnerHTML={heading(about.heading)}/>
                <p className="section-body">{about.paragraph1}</p>
                <p className="section-body">{about.paragraph2}</p>
                <ValueCards values={about.values}/>
                <a href={safeHref(about.buttonHref)} className="btn btn-primary-main mt-4">{about.buttonLabel} <i className="bi bi-arrow-right ms-1" /></a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section id="activities" className="section-activities">
        <div className="container">
          <Reveal className="text-center mb-5 reveal-up">
            <span className="section-eyebrow light">{activities.eyebrow}</span>
            <h2 className="section-heading light" dangerouslySetInnerHTML={heading(activities.heading)}/>
            <p className="section-body light mx-auto" style={{ maxWidth: 600 }}>{activities.description}</p>
          </Reveal>
          <ActivitiesGrid activities={activities.cards}/>
        </div>
      </section>

      <section id="events" className="section-events">
        <div className="container">
          <Reveal className="row align-items-end mb-5 reveal-up">
            <div className="col-lg-7">
              <span className="section-eyebrow">{events.eyebrow}</span>
              <h2 className="section-heading" dangerouslySetInnerHTML={heading(events.heading)}/>
            </div>
            <div className="col-lg-5 text-lg-end">
              <Link to="/events" className="link-arrow">{events.buttonLabel} <i className="bi bi-arrow-right" /></Link>
            </div>
          </Reveal>
          <EventList />
        </div>
      </section>

      <section id="articles" className="section-articles">
        <div className="container">
          <Reveal className="row align-items-end mb-5 reveal-up">
            <div className="col-lg-7">
              <span className="section-eyebrow">{articles.eyebrow}</span>
              <h2 className="section-heading" dangerouslySetInnerHTML={heading(articles.heading)}/>
            </div>
            <div className="col-lg-5 text-lg-end">
              <Link to="/articles" className="link-arrow">{articles.buttonLabel} <i className="bi bi-arrow-right" /></Link>
            </div>
          </Reveal>
          <ArticlesSection />
        </div>
      </section>

      <section id="gallery" className="section-gallery">
        <div className="container">
          <Reveal className="text-center mb-5 reveal-up">
            <span className="section-eyebrow light">{gallery.eyebrow}</span>
            <h2 className="section-heading light" dangerouslySetInnerHTML={heading(gallery.heading)}/>
            <p className="section-body light">{gallery.description}</p>
          </Reveal>
          <GalleryGrid />
          <div className="text-center mt-5 reveal-up">
            <Link to="/gallery" className="btn btn-primary-main mt-2">{gallery.buttonLabel}</Link>
          </div>
        </div>
      </section>

      <section className="section-join">
        <div className="container">
          <Reveal className="join-band reveal-up">
            <div className="join-text">
              <h2 dangerouslySetInnerHTML={heading(join.heading)}/>
              <p>{join.description}</p>
            </div>
            <div className="join-actions">
              <a href={safeHref(join.primaryHref)} className="btn btn-join-light">{join.primaryLabel}</a>
              <a href={safeHref(join.secondaryHref)} className="btn btn-join-outline">{join.secondaryLabel}</a>
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
                <span className="section-eyebrow light">{donate.eyebrow}</span>
                <h2 className="section-heading light" dangerouslySetInnerHTML={heading(donate.heading)}/>
                <p className="section-body light">{donate.description}</p>
                <div className="impact-list mt-4">{donate.impacts.map((item,i)=><div className="impact-item" key={i}><span className="impact-icon"><i className={`bi ${item.icon}`}/></span><div><strong>{item.amount}</strong><span>{item.text}</span></div></div>)}</div>
              </Reveal>
            </div>
            <div className="col-lg-5 offset-lg-1">
              <Reveal className="reveal-right">
                <div className="col-lg-5 offset-lg-1">
  <Reveal className="reveal-right"><StripeBuyButton /></Reveal>
</div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section-testimonials">
        <div className="container">
          <Reveal className="text-center mb-5 reveal-up">
            <span className="section-eyebrow">{testimonials.eyebrow}</span>
            <h2 className="section-heading" dangerouslySetInnerHTML={heading(testimonials.heading)}/>
          </Reveal>
          <Testimonials testimonials={testimonials.items}/>
        </div>
      </section>

      <section id="contact" className="section-contact">
        <div className="container">
          <div className="row gy-5">
            <div className="col-lg-5">
              <Reveal className="reveal-left">
                <span className="section-eyebrow">{contact.eyebrow}</span>
                <h2 className="section-heading" dangerouslySetInnerHTML={heading(contact.heading)}/>
                <p className="section-body">{contact.description}</p>
                <div className="contact-info mt-4">
                  <div className="ci-item"><div className="ci-icon"><i className="bi bi-geo-alt-fill" /></div><div><strong>Address</strong><span>{contact.address}</span></div></div>
                  <div className="ci-item"><div className="ci-icon"><i className="bi bi-telephone-fill" /></div><div><strong>Phone</strong><span>{contact.phone}</span></div></div>
                  <div className="ci-item"><div className="ci-icon"><i className="bi bi-envelope-fill" /></div><div><strong>Email</strong><span>{contact.email}</span></div></div>
                  <div className="ci-item"><div className="ci-icon"><i className="bi bi-clock-fill" /></div><div><strong>Opening Hours</strong><span>{contact.hours}</span></div></div>
                </div>
                <div className="social-links mt-4">{(['facebook','instagram','twitter','youtube','whatsapp'] as const).filter(k=>contact[k]).map(k=><a key={k} href={safeHref(contact[k])} className="soc-link" aria-label={k}><i className={`bi bi-${k==='twitter'?'twitter-x':k}`}/></a>)}</div>
              </Reveal>
            </div>
            <div className="col-lg-6 offset-lg-1">
              <Reveal className="reveal-right">
                <form className="contact-form" onSubmit={onContact} onChange={()=>{contactSubmission.current=null;setContactFlash(null);}} aria-busy={contactSending}>
                  <fieldset disabled={contactSending} style={{border:0,padding:0,margin:0,minWidth:0}}>
                  <div className="contact-honeypot" aria-hidden="true"><label htmlFor="cf-website">Leave this field empty</label><input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
                  <div className="row g-3">
                    <div className="col-md-6"><div className="cf-field"><label htmlFor="cf-first">First Name</label><input id="cf-first" name="firstName" autoComplete="given-name" maxLength={80} type="text" className="form-control" placeholder="Jane" required /></div></div>
                    <div className="col-md-6"><div className="cf-field"><label htmlFor="cf-last">Last Name</label><input id="cf-last" name="lastName" autoComplete="family-name" maxLength={80} type="text" className="form-control" placeholder="Smith" required /></div></div>
                    <div className="col-12"><div className="cf-field"><label htmlFor="cf-email">Email</label><input id="cf-email" name="email" autoComplete="email" maxLength={254} type="email" className="form-control" placeholder="jane@example.com" required /></div></div>
                    <div className="col-12"><div className="cf-field"><label htmlFor="cf-interest">I'm interested in…</label><select id="cf-interest" name="interest" className="form-select" defaultValue="Joining as a member"><option>Joining as a member</option><option>Volunteering</option><option>Partnering / Sponsorship</option><option>A specific programme</option><option>General enquiry</option></select></div></div>
                    <div className="col-12"><div className="cf-field"><label htmlFor="cf-msg">Message</label><textarea id="cf-msg" name="message" maxLength={5000} className="form-control" rows={5} placeholder="Tell us a little about yourself or your question…" required /></div></div>
                    <div className="col-12"><button type="submit" className="btn btn-primary-main w-100">{contactSending ? 'Sending…' : 'Send Message'} <i className="bi bi-arrow-right ms-1" /></button></div>
                  </div>
                  </fieldset>
                  {contactError && <p role="alert" className="contact-error mt-3">{contactError}</p>}
                  {contactFlash && <p role="status" className="mt-3 mb-0">{contactFlash}</p>}
                </form>
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
              <h3>{newsletter.heading}</h3>
              <p>{newsletter.description}</p>
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
