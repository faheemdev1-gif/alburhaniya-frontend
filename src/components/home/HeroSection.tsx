import { useContent, imageUrl, rich, safeHref } from '../../content';
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDE_DELAY = 5500;

export function HeroSection() {
  const slides = useContent().hero.slides;
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
  }, [slides.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const startAuto = useCallback(() => {
    clearAuto();
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, SLIDE_DELAY);
    resetProgress();
  }, [clearAuto, resetProgress, slides.length]);

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

  if (!slides.length) return null;

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
            key={i}
            className={"slide" + (i === current ? " active" : "")}
            style={{ backgroundImage: `url('${imageUrl(slide.bg)}')` }}
          >
            <div className="slide-overlay" />
            <div className="slide-content">
              <span className="slide-tag">{slide.tag}</span>
              <h1 className="slide-title" dangerouslySetInnerHTML={rich(slide.title)} />
              <p className="slide-sub">{slide.sub}</p>
              <div className="slide-actions">
                <a href={safeHref(slide.primary.href)} className="btn btn-hero-primary">
                  {slide.primary.label}
                </a>
                <a href={safeHref(slide.secondary.href)} className="btn btn-hero-ghost">
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
