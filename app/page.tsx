"use client";

import { useEffect, useRef, useState } from "react";
import PhoneScene, { type ScreenLayout } from "./PhoneScene";

const services = [
  "Web Design",
  "Product design",
  "Framer development",
  "Prototyping",
  "Strategy calls (1-2/week)",
  "Weekly updates",
  "UX Copywriting",
];

const projects = [
  { name: "curvo.ai", image: "/assets/curvo.png" },
  { name: "proxyshard", image: "/assets/proxyshard.png" },
  { name: "web3hub", image: "/assets/web3hub.png" },
  { name: "boxexchanger", image: "/assets/boxexchanger.png" },
  { name: "project five", image: "/assets/project-five.png" },
  { name: "project six", image: "/assets/project-six.png" },
];

const icon = (src: string, alt = "") => <img src={src} alt={alt} draggable={false} />;

function WifiStatusIcon() {
  return (
    <svg className="wifi-status-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path className="wifi-status-ring" d="M7.5 47.5A29.5 29.5 0 1 1 56.5 47.5" />
      <path className="wifi-status-wave" d="M20.5 27.5a16.6 16.6 0 0 1 23 0" />
      <path className="wifi-status-wave" d="M25.8 33a8.9 8.9 0 0 1 12.4 0" />
      <circle cx="32" cy="39" r="2.8" />
      <circle cx="14" cy="55" r="3.35" />
      <circle cx="26" cy="58.5" r="3.35" />
      <circle cx="38" cy="58.5" r="3.35" />
      <circle cx="50" cy="55" r="3.35" />
    </svg>
  );
}

export default function Home() {
  const progress = useRef(0);
  const [layout, setLayout] = useState<ScreenLayout | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navigation, setNavigation] = useState({ history: [0], index: 0 });
  const [contactOpen, setContactOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const touchStart = useRef<number | null>(null);
  const page = navigation.history[navigation.index] ?? 0;

  const navigateTo = (target: number) => {
    setNavigation((current) => {
      const currentPage = current.history[current.index] ?? 0;
      if (target === currentPage) return current;
      const history = current.history.slice(0, current.index + 1);
      return { history: [...history, target], index: history.length };
    });
  };

  const goBack = () => setNavigation((current) => (
    current.index > 0 ? { ...current, index: current.index - 1 } : current
  ));

  const goForward = () => setNavigation((current) => (
    current.index < current.history.length - 1 ? { ...current, index: current.index + 1 } : current
  ));

  // page scroll drives the story: 0 = phone lying on the floor, 1 = unfolded and live
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      progress.current = p;
      setOpen(p > 0.985);
      setScrolled(p > 0.02);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContactOpen(false);
        setMapOpen(false);
      }
      if (event.key === "ArrowLeft") {
        setNavigation((current) => current.index > 0 ? { ...current, index: current.index - 1 } : current);
      }
      if (event.key === "ArrowRight") {
        setNavigation((current) => current.index < current.history.length - 1 ? { ...current, index: current.index + 1 } : current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const share = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setShared(true);
    window.setTimeout(() => setShared(false), 1600);
  };

  return (
    <main className={`viewport ${open ? "is-open" : ""} ${loaded ? "is-loaded" : ""}`}>
      <div className="scroll-track" aria-hidden="true" />
      <PhoneScene progress={progress} onLayout={setLayout} onReady={() => setLoaded(true)} />
      <div className={`scroll-hint ${scrolled ? "is-hidden" : ""}`} aria-hidden="true">Scroll</div>
      <div
        className="screen-overlay"
        aria-hidden={!open}
        style={layout ? { transform: `translate3d(${layout.x}px, ${layout.y}px, 0) scale(${layout.scale})` } : undefined}
      >
        <section className="screen screen-left" aria-label="Profile and services">
          <aside className="left-rail" aria-label="Contact shortcuts">
            <button className="round-control avatar-control" onClick={() => setContactOpen(true)} aria-label="Open contact panel">
              <span className="avatar-crop">{icon("/assets/avatar.png", "Daniel Kurilenko")}</span>
              <span className="presence" />
            </button>
            <button className="round-control rail-top-control" onClick={() => setMapOpen((value) => !value)} aria-label="Open location in Apple Maps" aria-pressed={mapOpen}>
              {icon("/assets/top-icon.svg")}
            </button>
            <button className="round-control rail-mail" onClick={() => setContactOpen(true)} aria-label="Email Daniel">
              {icon("/assets/mail.svg")}
            </button>
            <button className="round-control rail-send" onClick={() => setContactOpen(true)} aria-label="Message Daniel">
              {icon("/assets/send.svg")}
            </button>
            <button className="round-control rail-phone" onClick={() => setContactOpen(true)} aria-label="Call Daniel">
              {icon("/assets/phone.svg")}
            </button>
          </aside>

          <div className="left-content">
            <div className="hero-copy">
              <button className="name-link" onClick={() => setContactOpen(true)}>Daniel Kurilenko</button>
              <h1>Design partner<br />that gets work done</h1>
              <p>No handoffs, no lost context — just one team turning<br />your idea into a product people actually use.</p>
            </div>

            <div className="cta-row">
              <button className="book-button" onClick={() => setContactOpen(true)}>
                {icon("/assets/cta-phone.svg")}
                <span>Book a Project</span>
              </button>
              <span className="availability">4 slots left, Dec 2026</span>
            </div>

            <section className="todo" aria-labelledby="todo-title">
              <h2 id="todo-title">To-do&apos;s</h2>
              <ul>
                {services.map((service) => (
                  <li key={service}>
                    <img className="todo-check" src="/assets/check-blue.svg" alt="" />
                    <span className="todo-label">{service}</span>
                    <span className="covered"><img src="/assets/check-gray.svg" alt="" />Covered</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="left-fade" aria-hidden="true" />

          <div className={`contact-panel ${contactOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!contactOpen}>
            <button className="contact-close" onClick={() => setContactOpen(false)} aria-label="Close contact panel">×</button>
            <span>NEW PROJECT</span>
            <h2>Let&apos;s make the next one count.</h2>
            <p>Add your email, messenger and booking link here when they are ready.</p>
            <button onClick={() => navigator.clipboard?.writeText("Project name:\nWhat are we building?\nWho is it for?\nTarget launch date:")}>Copy brief template</button>
          </div>
        </section>

        <section className="screen screen-right" aria-label="Projects">
          <div
            className={`right-pages ${page === 0 ? "show-card-shadows" : ""}`}
            onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => {
              if (touchStart.current === null) return;
              const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
              if (Math.abs(delta) > 42) navigateTo(Math.max(0, Math.min(2, page + (delta < 0 ? 1 : -1))));
              touchStart.current = null;
            }}
          >
            <div className="pages-track" style={{ transform: `translate3d(-${page * 596}px,0,0)` }}>
              <article className="projects-page">
                <div className="projects-scroll">
                  <header className="projects-header">
                    <h2>Projects</h2>
                    <p>Take a peek at what you will be dealing with</p>
                  </header>
                  <div className="project-grid">
                    {projects.map((project, index) => (
                      <button className={`project-card project-card-${index + 1}`} key={project.name} onClick={() => navigateTo(1)}>
                        <span className="preview"><img src={project.image} alt={`${project.name} project preview`} draggable={false} /></span>
                        <span className="project-footer">
                          <span className="project-title">{project.name}</span>
                          <img className="outbound" src="/assets/outbound.svg" alt="Open project" />
                          <span className="project-description">Corporate AI-powered revenue execution platform for enterprise sales and Go-To-Market (GTM) teams.</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </article>

              <article className="placeholder-page" aria-label="Case study placeholder one">
                <div className="placeholder-title" />
                <div className="placeholder-hero" />
                <div className="placeholder-columns"><i /><i /></div>
                <div className="placeholder-line" /><div className="placeholder-line short" />
              </article>

              <article className="placeholder-page placeholder-page-alt" aria-label="Case study placeholder two">
                <div className="placeholder-square" />
                <div className="placeholder-stack"><i /><i /><i /></div>
              </article>
            </div>
          </div>

          <aside className="right-rail" aria-label="Portfolio navigation">
            <div className="time">15:41</div>
            <div className="wifi"><WifiStatusIcon /></div>
            <div className="nav-capsule">
              <button onClick={goBack} disabled={navigation.index === 0} aria-label="Previous page">
                {icon("/assets/previous.svg")}
              </button>
              <button onClick={goForward} disabled={navigation.index >= navigation.history.length - 1} aria-label="Next page">
                {icon("/assets/next.svg")}
              </button>
            </div>
            <button className="round-control share-control" onClick={share} aria-label="Copy portfolio link">
              {icon("/assets/share.svg")}
            </button>
            <span className="sr-only" aria-live="polite">{shared ? "Portfolio link copied" : ""}</span>
          </aside>

          <div className={`map-view ${mapOpen ? "is-open" : ""}`} aria-hidden={!mapOpen}>
            <a className="map-external" href="https://maps.apple.com/?q=Warsaw&ll=52.2297,21.0122" target="_blank" rel="noreferrer">
              <span className="sr-only">Open Warsaw in Apple Maps</span>
            </a>
            <button className="round-control map-close" onClick={() => setMapOpen(false)} aria-label="Close Apple Maps">
              {icon("/assets/top-icon.svg")}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
