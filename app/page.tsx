"use client";

import { useEffect, useRef, useState } from "react";

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
  const [scale, setScale] = useState(0);
  const [stage, setStage] = useState<"closed" | "turning" | "opening" | "open">("closed");
  const [navigation, setNavigation] = useState({ history: [0], index: 0 });
  const [ready, setReady] = useState(false);
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

  // fit the device (designed at 1480 × 840 px) into the window
  useEffect(() => {
    const fit = () => setScale(Math.min((window.innerWidth * 0.9) / 1480, (window.innerHeight * 0.8) / 840));
    fit();
    window.addEventListener("resize", fit);
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => { window.removeEventListener("resize", fit); window.cancelAnimationFrame(frame); };
  }, []);

  // closed → unfold → open (interactive)
  const play = () => {
    setStage("closed");
    window.setTimeout(() => setStage("turning"), 500);   // closed phone turns to landscape
    window.setTimeout(() => setStage("opening"), 1500);  // then unfolds
    window.setTimeout(() => setStage("open"), 3300);     // live and clickable
  };
  useEffect(() => {
    if (!ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setStage("open"); return; }
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

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
    <main className={`viewport is-${stage}`}>
      <div className="stage" style={{ "--s": scale } as React.CSSProperties}>
        <div className="floor-shadow" aria-hidden="true" />
        <div className="device" aria-label="Daniel Kurilenko portfolio on an iPhone Duo">
          {/* left half — folds around the hinge */}
          <div className="half half-left">
            <div className="face face-front">
              <div className="glass">
                <div className="canvas canvas-left">
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

                </div>
                <i className="crease crease-left" aria-hidden="true" />
              </div>
              <i className="fold-shade" aria-hidden="true" />
            </div>
            <div className="face face-back" aria-hidden="true">
              <span className="camera">
                <i className="lens lens-1" /><i className="lens lens-2" /><i className="flash" />
              </span>
              <svg className="logo" viewBox="0 0 814 1000"><path d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-157 124s-87-40-166-40c-77 0-104 41-167 41s-107-58-157-129C40 788 0 653 0 525c0-205 133-314 265-314 70 0 128 46 172 46 42 0 107-49 187-49 30 0 139 3 210 104zM551 150c33-39 56-93 56-148 0-7-1-15-2-21-54 2-118 36-157 81-30 35-59 89-59 145 0 9 2 17 2 20 4 1 10 2 16 2 49 0 110-33 144-79z" /></svg>
            </div>
          </div>

          {/* right half — stays put */}
          <div className="half half-right">
            <div className="face face-front">
              <div className="glass">
                <div className="canvas canvas-right">
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
                <i className="crease crease-right" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="replay" onClick={play} aria-label="Replay the unfold animation">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.7h3.7" /></svg>
        Replay
      </button>
    </main>
  );
}
