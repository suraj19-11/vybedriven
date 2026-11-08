import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight, Users, Calendar, Trophy, Radio, MapPin, Search, UsersRound, Rocket, LineChart,
  Swords, Award, Zap, Globe, Activity, Code2, Sparkles,
} from "lucide-react";
import { Navbar, Footer } from "@/components/SiteChrome";
import { Reveal, Eyebrow, PrimaryBtn, GhostBtn } from "@/components/ui-hd";

import ornateConferenceHall from "@/assets/community-real/Ornate Conference Hall and Engaged Audience.webp";
import hackOnTrackWinners from "@/assets/community-real/IMG_08741.webp";
import repoForgeCelebration from "@/assets/community-real/1792571314963.webp";
import computerLabSprint from "@/assets/community-real/1792571325314.webp";
import projectPitchDemo from "@/assets/community-real/PXL_20261003_132342890.MP.webp";
import auditoriumKeynote from "@/assets/community-real/1791132680468.webp";
import engagedCrowd from "@/assets/community-real/Engaged Crowd at a Tech Meetup.webp";
import labVictoryCohort from "@/assets/community-real/WhatsApp Image 2026-10-18 at 11.18.30 AM.webp";
import repoForgePodium from "@/assets/community-real/1792571315335.webp";
import youngTechSeminar from "@/assets/community-real/Young Tech Seminar Audience.webp";
import { opportunities, type Opportunity } from "@/data/opportunities";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vybe Driven (Vybe) — Discover Nearest Hackathons, Coding Competitions & Tech Events in India" },
      { name: "description", content: "Discover nearest hackathons, coding competitions and technology summits in Mumbai and across India on Vybe Driven (Vybe / Vibe Driven). Connect with ambitious builders, win cash prizes, and build what's next." },
      { name: "keywords", content: "vybe driven, vybe, vibe driven, vibe, vybedriven, goa buildathon 2027, goa buildathon, nearest hackathon, hackathons near me, hackathons in mumbai, hackathons in india, student hackathons, coding competitions, upcoming hackathons 2026, upcoming hackathons 2027, tech events mumbai, luminar creators award, idea competition" },
      { name: "author", content: "Vybe Driven" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { property: "og:site_name", content: "Vybe Driven" },
      { property: "og:title", content: "Vybe Driven (Vybe) — Discover Nearest Hackathons & Tech Events" },
      { property: "og:description", content: "Discover nearest hackathons, coding competitions and technology summits in Mumbai and across India on Vybe Driven." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vybedriven.in/" },
      { property: "og:image", content: "https://www.vybedriven.in/vybe-driven.png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@vybedriven" },
      { name: "twitter:title", content: "Vybe Driven (Vybe) — Discover Nearest Hackathons & Tech Events" },
      { name: "twitter:description", content: "Discover nearest hackathons, coding competitions and technology summits in Mumbai and across India on Vybe Driven." },
      { name: "twitter:image", content: "https://www.vybedriven.in/vybe-driven.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.vybedriven.in/" },
    ],
  }),
  component: Index,
});

type HomeFilter = "All" | "Hackathons" | "Competitions" | "Tech Events";
const filters: HomeFilter[] = ["All", "Hackathons", "Competitions", "Tech Events"];

function matchesHomeFilter(item: Opportunity, filter: HomeFilter) {
  if (filter === "All") return true;
  if (filter === "Hackathons") return item.type === "Hackathon";
  if (filter === "Competitions") return item.type === "Competition";
  return item.type === "Meetup" || item.type === "Conference" || item.type === "Networking";
}

const heroSlides = [
  { src: ornateConferenceHall, alt: "Massive gathering of developers and students at tech summit", position: "center 42%" },
  { src: hackOnTrackWinners, alt: "Hack On Track hackathon winners celebrating with prize cheques", position: "center 38%" },
  { src: repoForgeCelebration, alt: "Vybe Driven builders and students at Repo Forge hackathon celebration", position: "center 42%" },
  { src: computerLabSprint, alt: "Intense overnight hackathon coding and sprinting in computer lab", position: "center 45%" },
  { src: projectPitchDemo, alt: "Live AI project demo and team pitch on stage", position: "center 45%" },
  { src: auditoriumKeynote, alt: "Tech conference hall with keynote presentation on stage", position: "center 45%" },
  { src: labVictoryCohort, alt: "Student developers celebrating after a successful hackathon sprint", position: "center 40%" },
  { src: engagedCrowd, alt: "Engaged audience and builders at Vybe Driven tech meetup", position: "center 45%" },
  { src: youngTechSeminar, alt: "Young developers and innovators attending tech seminar", position: "center 42%" },
];

const partners = [
  { name: "Pizza Hut", logo: "/partners/pizza-hut.webp", badge: false },
  { name: "GitHub", logo: "/partners/github.webp", badge: false },
  { name: "Google Developers", logo: "/partners/google-developers.webp", badge: true },
  { name: "n8n", logo: "/partners/n8n.webp", badge: false },
  { name: "Cisco", logo: "/partners/cisco.webp", badge: false },
  { name: "infraon", logo: "/partners/infraon.webp", badge: false },
  { name: "IET", logo: "/partners/iet.webp", badge: true },
  { name: "DevSphere India", logo: "/partners/devsphere-india.webp", badge: false },
  { name: "CSI SIES GST", logo: "/partners/csi-siesgst.webp", badge: false },
  { name: "NIIT Foundation", logo: "/partners/niit-foundation.webp", badge: true },
  { name: "Thakur Shyamnarayan Engineering College", logo: "/partners/thakur-tsec.webp", badge: true },
  { name: "Dwarkadas J. Sanghvi College of Engineering", logo: "/partners/djsce.webp", badge: true },
  { name: "IcyPluto", logo: "/partners/icypluto.webp", badge: true },
  { name: "Fr. C. Rodrigues Institute of Technology", logo: "/partners/fcrit.webp", badge: true },
  { name: "Thadomal Shahani Engineering College", logo: "/partners/thadomal-tsec.webp", badge: true },
  { name: "Institution's Innovation Council", logo: "/partners/iic.webp", badge: true },
  { name: "Xavier Institute of Engineering", logo: "/partners/xie.webp", badge: true },
  { name: "IIC DJSCE", logo: "/partners/iic-djsce.webp", badge: true },
  { name: "IEEE SLRTCE", logo: "/partners/ieee-slrtce.webp", badge: true },
];

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Partners />
        <Events />
        <Features />
        <Why />
        <Community />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero-stage relative -mt-20 flex min-h-[min(680px,86vh)] sm:min-h-[min(740px,88vh)] items-end overflow-hidden pt-28 sm:pt-36 pb-10 sm:pb-16">
      <div className="hero-media absolute inset-0" aria-live="off">
        {heroSlides.map((slide, index) => (
          <img key={slide.src} src={slide.src} alt={index === activeSlide ? slide.alt : ""} aria-hidden={index !== activeSlide} style={{ objectPosition: slide.position }} className={`hero-slide absolute inset-0 h-full w-full object-cover ${index === activeSlide ? "is-active" : ""}`} />
        ))}
      </div>
      <div className="hero-scrim absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/70 to-transparent" />
      
      {/* Real Community Moments slide switcher */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 hidden min-[540px]:flex items-center gap-1.5 rounded-full border border-border/50 bg-background/70 px-3 py-1.5 backdrop-blur-md shadow-sm">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mr-1">Moments</span>
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeSlide ? "w-5 bg-neon" : "w-1.5 bg-foreground/25 hover:bg-foreground/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="animate-rise max-w-[710px]">
          <h1 className="text-[34px] min-[380px]:text-[42px] sm:text-6xl lg:text-[76px] font-extrabold leading-[1.04] sm:leading-[0.98] text-hero-foreground">
            Build. Hack.<br />Drive the <span className="text-hero-accent">Future.</span>
          </h1>
          <p className="mt-4 sm:mt-6 max-w-[590px] text-base sm:text-lg lg:text-xl text-hero-muted">
            Discover hackathons, competitions and technology events built for ambitious developers, creators and innovators.
          </p>
          <div className="mt-7 sm:mt-9 flex flex-col min-[480px]:flex-row gap-3 w-full sm:w-auto">
            <PrimaryBtn href="/hackathons" className="w-full min-[480px]:w-auto justify-center">Explore Hackathons <ArrowRight className="size-4" /></PrimaryBtn>
            <GhostBtn href="/host" className="hero-ghost w-full min-[480px]:w-auto justify-center">Host an Event</GhostBtn>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedCounter({ end, prefix = "", suffix = "", duration = 1800 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(ease * end));
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="tabular-nums font-black">
      {prefix}{count}{suffix}
    </span>
  );
}

function Stats() {
  const statsList = [
    {
      num: 20,
      suffix: "K+",
      prefix: "",
      title: "Community Members",
      description: "Students & working professionals active across top tech domains.",
      badge: "ACTIVE BUILDERS",
      icon: Users,
    },
    {
      num: 100,
      suffix: "+",
      prefix: "",
      title: "Tech Events Hosted",
      description: "Workshops, hands-on meetups, and developer conferences.",
      badge: "HOSTED & SPRINTED",
      icon: Calendar,
    },
    {
      num: 30,
      suffix: "+",
      prefix: "",
      title: "Hackathons Organized",
      description: "National, collegiate, and regional competitive hackathons.",
      badge: "FLAGSHIP SPRINTS",
      icon: Swords,
    },
    {
      num: 500,
      suffix: "K+",
      prefix: "₹",
      title: "Prize Pool Awarded",
      description: "Direct cash bounties, grants, and ecosystem reward pools.",
      badge: "TOTAL REWARDS",
      icon: Trophy,
    },
  ];

  return (
    <section className="relative z-20 mx-auto max-w-[1280px] px-3 sm:px-6 pt-2 sm:pt-6 pb-6 sm:pb-8">
      <Reveal>
        <div className="stats-laser-border">
          <div className="relative rounded-[calc(1.5rem-1.5px)] bg-[#070d08]/95 p-4 sm:p-7 backdrop-blur-2xl">
            {/* Ambient inner neon glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-60 rounded-full bg-neon/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-60 rounded-full bg-lime/10 blur-3xl" />

            {/* High-Tech Telemetry Header */}
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-border/60 pb-3.5 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-80" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-neon" />
                </span>
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] text-neon">
                  Vybe Driven Impact Metrics
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono tracking-wider text-muted-foreground">
                <span className="inline-block size-1.5 rounded-full bg-neon/60" />
                <span>ECOSYSTEM STATS</span>
                <span>· ALL-INDIA NETWORK</span>
              </div>
            </div>

            {/* 4 Futuristic Stat Pods */}
            <div className="relative mt-4 sm:mt-5 grid grid-cols-1 gap-3 sm:gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">
              {statsList.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.title}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface/60 p-4 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon/50 hover:bg-surface/90 hover:shadow-[0_0_28px_rgba(57,255,20,0.18)]"
                  >
                    {/* Hover glow orb */}
                    <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-neon/0 blur-2xl transition-all duration-300 group-hover:bg-neon/15" />

                    <div>
                      {/* Card top row: Icon + Micro-tag */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid size-11 sm:size-12 shrink-0 place-items-center rounded-xl border border-neon/30 bg-neon/10 text-neon transition-all duration-300 group-hover:scale-110 group-hover:bg-neon group-hover:text-black group-hover:shadow-[0_0_20px_rgba(57,255,20,0.45)]">
                          <Icon className="size-5 sm:size-6" />
                        </div>
                        <span className="rounded-full border border-neon/20 bg-neon/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon">
                          {stat.badge}
                        </span>
                      </div>

                      {/* Number value with animated counter */}
                      <div className="mt-4 sm:mt-5">
                        <div className="text-3xl sm:text-4xl font-black tracking-tight text-white transition-colors duration-200 group-hover:text-neon">
                          <AnimatedCounter
                            end={stat.num}
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                          />
                        </div>
                        <p className="mt-1 text-sm sm:text-base font-bold text-foreground">
                          {stat.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {stat.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom active neon indicator line */}
                    <div className="mt-4 h-[2px] w-full rounded-full bg-border/40 overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-neon to-lime transition-all duration-500 group-hover:w-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Partners() {
  const firstRow = partners.filter((_, index) => index % 2 === 0);
  const secondRow = partners.filter((_, index) => index % 2 === 1);
  const renderRow = (items: typeof partners, direction: "left" | "right") => {
    const repeated = [...items, ...items, ...items, ...items, ...items, ...items];
    return (
      <div className="partner-window">
        <div className={`partner-track partner-track-${direction}`}>
          {repeated.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className={`partner-logo ${partner.badge ? "partner-badge-card" : ""}`}
              aria-hidden={index >= items.length}
            >
              <img src={partner.logo} alt={index < items.length ? partner.name : ""} loading="eager" decoding="async" />
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <section className="partner-band relative overflow-hidden border-b border-border bg-background pt-2 sm:pt-4 pb-12 sm:pb-14" aria-labelledby="partners-title">
      <div className="pointer-events-none absolute inset-x-[15%] top-1/2 h-44 -translate-y-1/2 rounded-full bg-neon/5 blur-3xl" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6">
        <p id="partners-title" className="mb-6 text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground sm:mb-7 sm:text-sm">TRUSTED BY AMAZING PARTNERS</p>
        <div className="space-y-6 sm:space-y-8">
          {renderRow(firstRow, "right")}
          {renderRow(secondRow, "left")}
        </div>
      </div>
    </section>
  );
}

function Events() {
  const [f, setF] = useState<HomeFilter>("All");
  const featured = opportunities.find((item) => item.slug === "goa-buildathon-2027") ?? opportunities[0];
  const featuredLuminar = opportunities.find((item) => item.slug === "luminar-creators-award-2027");
  if (!featured) return null;
  const list = opportunities
    .filter((item) => matchesHomeFilter(item, f))
    .sort((a, b) => Number(a.status === "Opening soon") - Number(b.status === "Opening soon"))
    .slice(0, 9);
  return (
    <section id="events" className="mx-auto max-w-[1200px] scroll-mt-28 px-4 sm:px-6 py-10 sm:py-14">
      <Reveal>
        <Eyebrow>DISCOVER</Eyebrow>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="text-3xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl">Find Your <span className="text-gradient">Next<br />Hackathon.</span></h2>
          <p className="max-w-md text-sm sm:text-base text-muted-foreground">Explore challenges, competitions and events where ambitious builders turn ideas into reality.</p>
        </div>
        <div className="mt-6 sm:mt-8 -mx-4 px-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:mx-0 sm:px-0 sm:flex-wrap sm:pb-0">
          {filters.map((x) => (
            <button key={x} onClick={() => setF(x)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${f === x ? "bg-neon text-primary-foreground shadow-glow-soft" : "border border-border bg-surface text-muted-foreground hover:text-foreground"}`}>
              {x}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-8 sm:mt-10">
        <article className="group grid overflow-hidden rounded-2xl sm:rounded-3xl border border-neon/25 bg-surface shadow-glow-soft md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative flex items-center justify-center overflow-hidden bg-black/60 p-4 sm:p-6 min-h-[300px] sm:min-h-[380px] md:min-h-[460px]">
            <img src={featured.image} alt={featured.title} loading="eager" width={969} height={1024} className="h-full max-h-[460px] w-auto max-w-full object-contain transition duration-700 group-hover:scale-[1.02]" />
            <div className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-transparent to-surface/80" />
            <span className="absolute left-4 top-4 sm:left-5 sm:top-5 rounded-full bg-neon px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow-soft">FEATURED HACKATHON</span>
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-[0.18em] text-neon">{featured.tag.toUpperCase()}</span>
              <span className="rounded-full border border-neon/40 bg-neon/10 px-2.5 py-0.5 text-[11px] font-semibold text-neon">
                Platform &amp; Tech Partner: Vybe Driven
              </span>
            </div>
            <h3 className="mt-2.5 sm:mt-3 text-2xl min-[400px]:text-3xl sm:text-4xl font-extrabold tracking-tight">{featured.title}</h3>
            <p className="mt-2.5 sm:mt-3 text-sm text-muted-foreground leading-relaxed">{featured.description}</p>
            <div className="mt-5 sm:mt-6 space-y-2 text-xs sm:text-sm">
              <p className="flex items-center gap-2"><Globe className="size-4 text-neon" /> {featured.format} · {featured.location}</p>
              <p className="flex items-center gap-2"><Calendar className="size-4 text-neon" /> {featured.date}</p>
              <p className="flex items-center gap-2"><Trophy className="size-4 text-neon" /> {featured.prize} Prize Pool</p>
            </div>
            {featured.perks && featured.perks.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border/70">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-neon mb-2.5">What's in store for you:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {featured.perks.slice(0, 4).map((p) => (
                    <div key={p.title} className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface-2/70 px-2.5 py-1.5 text-xs text-foreground">
                      <span className="text-base shrink-0 select-none">{p.emoji}</span>
                      <span className="font-semibold truncate">{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              {featured.registrationUrl ? (
                <a href={featured.registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 hover:shadow-glow">Register Now <ArrowRight className="size-4" /></a>
              ) : null}
              <Link to="/opportunities/$slug" params={{ slug: featured.slug }} className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-neon/40 bg-surface/80 px-6 py-3.5 text-sm font-semibold text-neon transition hover:border-neon hover:bg-neon/15 hover:shadow-glow-soft">Explore Hackathon</Link>
            </div>
          </div>
        </article>
      </Reveal>

      {featuredLuminar && (
        <Reveal className="mt-6 sm:mt-8">
          <article className="group grid overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/35 bg-surface shadow-glow-soft md:grid-cols-[0.95fr_1.05fr]">
            <div className="relative flex items-center justify-center overflow-hidden bg-black/60 p-4 sm:p-6 min-h-[300px] sm:min-h-[380px] md:min-h-[460px]">
              <img
                src={featuredLuminar.image}
                alt={featuredLuminar.title}
                loading="eager"
                width={815}
                height={1024}
                className="h-full max-h-[460px] w-auto max-w-full object-contain transition duration-700 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-transparent to-surface/80" />
              <span className="absolute left-4 top-4 sm:left-5 sm:top-5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-bold text-black shadow-glow-soft">
                FEATURED AWARD
              </span>
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold tracking-[0.18em] text-amber-400">
                  {featuredLuminar.tag.toUpperCase()}
                </span>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  Official Platform Partner: Vybe Driven
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-2xl min-[400px]:text-3xl sm:text-4xl font-extrabold tracking-tight">
                {featuredLuminar.title}
              </h3>
              <p className="mt-2.5 sm:mt-3 text-sm text-muted-foreground leading-relaxed">
                {featuredLuminar.description}
              </p>
              <div className="mt-5 sm:mt-6 space-y-2 text-xs sm:text-sm">
                <p className="flex items-center gap-2">
                  <Globe className="size-4 text-amber-400" /> {featuredLuminar.format} · {featuredLuminar.location}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="size-4 text-amber-400" /> {featuredLuminar.date}
                </p>
                <p className="flex items-center gap-2">
                  <Trophy className="size-4 text-amber-400" /> {featuredLuminar.prize}
                </p>
              </div>
              {featuredLuminar.perks && featuredLuminar.perks.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border/70">
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-amber-400 mb-2.5">
                    Exclusive Creator Perks & Rewards:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {featuredLuminar.perks.slice(0, 4).map((p) => (
                      <div
                        key={p.title}
                        className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-surface-2/70 px-2.5 py-1.5 text-xs text-foreground"
                      >
                        <span className="text-base shrink-0 select-none">{p.emoji}</span>
                        <span className="font-semibold truncate">{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={featuredLuminar.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-black transition hover:brightness-110 hover:shadow-glow"
                >
                  Register Now <ArrowRight className="size-4" />
                </a>
                <Link
                  to="/opportunities/$slug"
                  params={{ slug: featuredLuminar.slug }}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-amber-400/50 bg-surface/80 px-6 py-3.5 text-sm font-semibold text-amber-400 transition hover:border-amber-400 hover:bg-amber-400/10 hover:shadow-glow-soft"
                >
                  Explore Event Details
                </Link>
              </div>
            </div>
          </article>
        </Reveal>
      )}

      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e, i) => (
          <Reveal key={e.title} delay={i * 60}>
            <Link to="/opportunities/$slug" params={{ slug: e.slug }} aria-label={`View ${e.title} details`} className="group block h-full rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"><article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-border bg-surface transition duration-300 group-hover:-translate-y-1.5 group-hover:border-neon/40 group-hover:shadow-glow">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={e.image} alt={e.title} loading="lazy" width={1024} height={640} style={e.imagePosition ? { objectPosition: e.imagePosition } : undefined} className={`h-full w-full bg-surface transition duration-700 group-hover:scale-[1.02] ${e.imageFit === "contain" ? "object-contain" : "object-cover"}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent" />
                <span className="glass absolute left-3 top-3 sm:left-4 sm:top-4 rounded-full border border-border px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold">{e.tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold">{e.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{e.description}</p>
                <div className="mt-4 sm:mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="size-3.5 text-neon" />{e.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-neon" />{e.location}</span>
                </div>
                <div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-border pt-4 sm:pt-5">
                  <div><p className="text-[10px] sm:text-[11px] text-muted-foreground">{e.prize ? "Prize Pool" : "Status"}</p><p className="text-sm sm:text-base font-bold text-lime">{e.prize ?? e.status}</p></div>
                   <span className="flex items-center gap-1 text-xs sm:text-sm font-semibold transition group-hover:text-neon">View Event <ArrowRight className="size-4" /></span>
                </div>
              </div>
             </article></Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const f = [
    { i: Search, t: "Discover Events", d: "Browse hackathons and competitions filtered to your stack and interests." },
    { i: UsersRound, t: "Team Up", d: "Find teammates with complementary skills before the clock starts." },
    { i: Rocket, t: "Build & Submit", d: "Ship your project and submit demos, repos and decks in one place." },
    { i: LineChart, t: "Track Progress", d: "Follow milestones, deadlines and judging rounds in real time." },
    { i: Swords, t: "Compete", d: "Go head to head with the sharpest builders across India and beyond." },
    { i: Award, t: "Get Recognized", d: "Earn prizes, badges and a profile that recruiters actually look at." },
  ];
  return (
    <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10 sm:py-14">
      <Reveal>
        <Eyebrow>BUILT FOR BUILDERS</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl">Everything You Need<br />to <span className="text-gradient">Build What's Next.</span></h2>
      </Reveal>
      <div className="mt-8 sm:mt-12 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {f.map(({ i: I, t, d }, idx) => (
          <Reveal key={t} delay={idx * 50}>
            <div className="group h-full rounded-2xl border border-border bg-surface p-5 sm:p-7 transition hover:border-neon/30">
              <span className="grid size-11 place-items-center rounded-xl border border-border bg-surface-2 text-neon transition group-hover:bg-neon group-hover:text-primary-foreground"><I className="size-5" /></span>
              <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-bold">{t}</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Why() {
  const w = [
    { n: "01", i: Zap, t: "Powerful Innovation", d: "Challenges designed with industry partners around problems that matter now." },
    { n: "02", i: Globe, t: "Open Community", d: "A welcoming place for students, independent builders and working professionals." },
    { n: "03", i: Activity, t: "Real-Time Experience", d: "Live updates, leaderboards and announcements from kickoff to final demo." },
    { n: "04", i: Code2, t: "Built for Developers", d: "Clean workflows, GitHub-first submissions and zero unnecessary friction." },
  ];
  return (
    <section className="relative py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-80 max-w-3xl -translate-y-1/2 rounded-full bg-neon/8 blur-[120px]" />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Why <span className="text-gradient">Vybe Driven?</span></h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-muted-foreground">More than events. It's an ecosystem built to turn ideas into impact.</p>
        </Reveal>
        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-5 md:grid-cols-2">
          {w.map(({ n, i: I, t, d }, idx) => (
            <Reveal key={n} delay={idx * 70}>
              <div className="relative h-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-br from-surface-2 to-background p-6 sm:p-8 md:p-10">
                <span className="absolute -right-2 -top-6 text-[84px] sm:text-[140px] font-black leading-none text-neon/10 select-none pointer-events-none">{n}</span>
                <I className="relative size-6 text-neon" />
                <h3 className="relative mt-6 sm:mt-8 text-xl sm:text-2xl font-bold">{t}</h3>
                <p className="relative mt-2 sm:mt-3 max-w-sm text-sm sm:text-base text-muted-foreground">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Community() {
  const g = [
    { img: ornateConferenceHall, l: "Grand Tech Summits & Conferences", c: "sm:col-span-2 md:col-span-2 md:row-span-2", position: "center 42%" },
    { img: hackOnTrackWinners, l: "Hackathon Winners & Cash Grants", c: "sm:col-span-2 md:col-span-2 md:row-span-1", position: "center 36%" },
    { img: projectPitchDemo, l: "Demo Day & Live Project Pitches", c: "sm:col-span-2 md:col-span-2 md:row-span-1", position: "center 45%" },
    { img: computerLabSprint, l: "Intense Overnight Hacking Sprints", c: "sm:col-span-2 md:col-span-2 md:row-span-1", position: "center 45%" },
    { img: repoForgeCelebration, l: "Together We Build · Hackathon Cohorts", c: "sm:col-span-2 md:col-span-2 md:row-span-1", position: "center 42%" },
    { img: labVictoryCohort, l: "Student Innovator Networks", c: "sm:col-span-2 md:col-span-2 md:row-span-1", position: "center 40%" },
    { img: repoForgePodium, l: "Stage Honors & Awards", c: "sm:col-span-1 md:col-span-1 md:row-span-1", position: "center 42%" },
    { img: youngTechSeminar, l: "Tech Talks & Seminars", c: "sm:col-span-1 md:col-span-1 md:row-span-1", position: "center 45%" },
    { img: auditoriumKeynote, l: "Auditorium Keynotes & Tech Sessions", c: "sm:col-span-2 md:col-span-2 md:row-span-1", position: "center 45%" },
    { img: engagedCrowd, l: "Interactive Meetups & Q&A", c: "sm:col-span-2 md:col-span-2 md:row-span-1", position: "center 45%" },
  ];
  return (
    <section id="community" className="mx-auto max-w-[1200px] scroll-mt-28 px-4 sm:px-6 py-10 sm:py-14">
      <Reveal className="flex flex-col justify-between gap-3 sm:gap-4 md:flex-row md:items-end">
        <div>
          <Eyebrow>COMMUNITY</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Built by the <span className="text-gradient">Community</span></h2>
        </div>
        <p className="max-w-sm text-sm sm:text-base text-muted-foreground">Real builders, real hackathons, and real moments across India.</p>
      </Reveal>
      <div className="mt-8 sm:mt-10 grid auto-rows-[180px] sm:auto-rows-[220px] md:auto-rows-[240px] gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {g.map((x) => (
          <div key={x.l} className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-surface ${x.c}`}>
            <img src={x.img} alt={x.l} loading="lazy" style={{ objectPosition: x.position }} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent transition duration-300 group-hover:via-background/10" />
            <span className="absolute bottom-3.5 left-3.5 sm:bottom-4 sm:left-4 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground drop-shadow-sm"><Sparkles className="size-3.5 text-neon" />{x.l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-neon/20 bg-surface-3 px-5 py-10 sm:px-16 sm:py-14 text-center">
          <div className="absolute inset-0 pointer-events-none select-none opacity-[0.07] dark:opacity-[0.14] mix-blend-luminosity">
            <img src={hackOnTrackWinners} alt="" className="h-full w-full object-cover object-center filter saturate-0" />
          </div>
          <div className="bg-grid pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -bottom-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-neon/20 blur-[120px]" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">Ready to<br /><span className="text-gradient">Drive What's Next?</span></h2>
            <p className="mx-auto mt-4 sm:mt-5 max-w-lg text-sm sm:text-base text-muted-foreground">Find your next challenge, build with great people and turn your ideas into something real.</p>
            <div className="mt-7 sm:mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryBtn href="/hackathons" className="w-full sm:w-auto justify-center">Explore Hackathons <ArrowRight className="size-4" /></PrimaryBtn>
              <GhostBtn href="/host" className="w-full sm:w-auto justify-center">Host an Event</GhostBtn>
              <GhostBtn href="/auth?mode=signin&next=%2Fprofile" className="w-full sm:w-auto justify-center">Join Vybe Driven</GhostBtn>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
