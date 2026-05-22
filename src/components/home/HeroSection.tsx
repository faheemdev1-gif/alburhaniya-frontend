import { useCallback, useEffect, useRef, useState } from "react";

const SLIDE_DELAY = 5500;

const slides = [
  {
    bg: "/images/together-stronger.jpg",
    tag: "Welcome to Our Community",
    title: (
      <>
        We Are <em>Together</em>
        <br />
        Stronger
      </>
    ),
    sub: "A vibrant space where culture, creativity, and connection flourish every day.",
    primary: { href: "#about", label: "Discover Us" },
    secondary: { href: "#events", label: "Upcoming Events" },
  },
  {
    bg: "/images/rhythm-meet-soul.jpg",
    tag: "Music & Arts",
    title: (
      <>
        Where <em>Rhythm</em>
        <br />
        Meets Soul
      </>
    ),
    sub: "Live performances, art exhibitions, and cultural celebrations throughout the year.",
    primary: { href: "#activities", label: "Our Activities" },
    secondary: { href: "#gallery", label: "View Gallery" },
  },
  {
    bg: "/images/move-thrive.jpg",
    tag: "Sports & Wellness",
    title: (
      <>
        Move. <em>Thrive.</em>
        <br />
        Belong.
      </>
    ),
    sub: "From weekend sports leagues to yoga mornings — body and spirit united.",
    primary: { href: "#activities", label: "Join In" },
    secondary: { href: "#donate", label: "Support Us" },
  },
  {
    bg: "/images/every-voice.JPG",
    tag: "Community Gatherings",
    title: (
      <>
        Every <em>Voice</em>
        <br />
        Matters Here
      </>
    ),
    sub: "Monthly town halls, festivals, and shared meals that bring neighbours together.",
    primary: { href: "#events", label: "See Events" },
    secondary: { href: "#articles", label: "Read Stories" },
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);

  const clearAuto = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetProgress = useCallback(() => {
    const bar = progressRef.current;
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = `width ${SLIDE_DELAY}ms linear`;
        bar.style.width = "100%";
      });
    });
  }, []);

  const goTo = useCallback((index: number) => {
    const n = slides.length;
    setCurrent(((index % n) + n) % n);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  const startAuto = useCallback(() => {
    clearAuto();
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, SLIDE_DELAY);
    resetProgress();
  }, [clearAuto, resetProgress]);

  useEffect(() => {
    resetProgress();
  }, [current, resetProgress]);

  useEffect(() => {
    startAuto();
    return clearAuto;
  }, [clearAuto, startAuto]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const pause = () => clearAuto();
    const resume = () => {
      clearAuto();
      startAuto();
    };
    hero.addEventListener("mouseenter", pause);
    hero.addEventListener("mouseleave", resume);
    return () => {
      hero.removeEventListener("mouseenter", pause);
      hero.removeEventListener("mouseleave", resume);
    };
  }, [clearAuto, startAuto]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const hero = heroRef.current;
      if (!hero) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (document.activeElement !== document.body && !hero.contains(document.activeElement)) return;
      clearAuto();
      if (e.key === "ArrowRight") next();
      else prev();
      startAuto();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [clearAuto, next, prev, startAuto]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) <= 40) return;
    clearAuto();
    if (dx < 0) next();
    else prev();
    startAuto();
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      tabIndex={-1}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-slider" id="heroSlider">
        {slides.map((slide, i) => (
          <div
            key={slide.bg}
            className={"slide" + (i === current ? " active" : "")}
            style={{ backgroundImage: `url('${slide.bg}')` }}
          >
            <div className="slide-overlay" />
            <div className="slide-content">
              <span className="slide-tag">{slide.tag}</span>
              <h1 className="slide-title">{slide.title}</h1>
              <p className="slide-sub">{slide.sub}</p>
              <div className="slide-actions">
                <a href={slide.primary.href} className="btn btn-hero-primary">
                  {slide.primary.label}
                </a>
                <a href={slide.secondary.href} className="btn btn-hero-ghost">
                  {slide.secondary.label}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-controls">
        <button
          type="button"
          className="hero-btn prev"
          aria-label="Previous slide"
          onClick={() => {
            clearAuto();
            prev();
            startAuto();
          }}
        >
          <i className="bi bi-chevron-left" />
        </button>
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={"hero-dot" + (i === current ? " active" : "")}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                clearAuto();
                goTo(i);
                startAuto();
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="hero-btn next"
          aria-label="Next slide"
          onClick={() => {
            clearAuto();
            next();
            startAuto();
          }}
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>

      <div className="hero-progress">
        <div className="hero-progress-bar" ref={progressRef} />
      </div>

      <div className="scroll-cue">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
