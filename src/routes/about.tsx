import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Users, Calendar, Trophy, Swords, Zap, Globe, Activity, Code2,
  Search, UsersRound, Rocket, LineChart, Award, Sparkles, CheckCircle2, ShieldCheck,
} from "lucide-react";
import { Navbar, Footer } from "@/components/SiteChrome";
import { Reveal, Eyebrow, PrimaryBtn, GhostBtn } from "@/components/ui-hd";

import ornateConferenceHall from "@/assets/community-real/Ornate Conference Hall and Engaged Audience.webp";
import hackOnTrackWinners from "@/assets/community-real/IMG_08741.webp";
import repoForgeCelebration from "@/assets/community-real/1792571314963.webp";
import computerLabSprint from "@/assets/community-real/1792571325314.webp";
import projectPitchDemo from "@/assets/community-real/PXL_20261003_132342890.MP.webp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Vybe Driven (Vybe) | India's Builder & Hackathon Ecosystem" },
      {
        name: "description",
        content: "Learn about Vybe Driven (Vybe / Vibe Driven). Our mission is to connect ambitious developers, student innovators, and creators across India with tier-1 hackathons, industry bounties, and real opportunities.",
      },
      {
        name: "keywords",
        content: "about vybe driven, vybe driven story, what is vybe driven, vybe, vibe driven, hackathon ecosystem india, student developer community",
      },
      { property: "og:title", content: "About Vybe Driven — Powering India's Ambitious Builders" },
      {
        property: "og:description",
        content: "More than events. Vybe Driven is an ecosystem built to turn ideas into prototypes and real impact.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vybedriven.in/about" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.vybedriven.in/about" }],
  }),
  component: AboutPage,
});

const statsList = [
  {
    num: "20K+",
    title: "Community Members",
    description: "Students & working professionals active across top tech domains.",
    badge: "ACTIVE BUILDERS",
    icon: Users,
  },
  {
    num: "100+",
    title: "Tech Events Hosted",
    description: "Workshops, hands-on meetups, and developer conferences.",
    badge: "HOSTED & SPRINTED",
    icon: Calendar,
  },
  {
    num: "30+",
    title: "Hackathons Organized",
    description: "National, collegiate, and regional competitive hackathons.",
    badge: "FLAGSHIP SPRINTS",
    icon: Swords,
  },
  {
    num: "₹500K+",
    title: "Prize Pool Awarded",
    description: "Direct cash bounties, grants, and ecosystem reward pools.",
    badge: "TOTAL REWARDS",
    icon: Trophy,
  },
];

const pillars = [
  {
    n: "01",
    i: Zap,
    t: "Powerful Innovation",
    d: "Challenges designed with top college bodies, industry sponsors, and tech leaders around problems that matter right now.",
  },
  {
    n: "02",
    i: Globe,
    t: "Open Community",
    d: "A welcoming, zero-gatekeeping hub for student engineers, solo coders, and creative minds looking to build the future.",
  },
  {
    n: "03",
    i: Activity,
    t: "Real-Time Experience",
    d: "Live updates, transparent submission deadlines, and verified milestones from kickoff to final stage demo.",
  },
  {
    n: "04",
    i: Code2,
    t: "Built for Developers",
    d: "Clean workflows, GitHub-first project evaluation, and direct access to mentors who actively guide and challenge you.",
  },
];

const features = [
  { i: Search, t: "Discover Events", d: "Browse hackathons, competitions and workshops filtered to your stack, location and interests." },
  { i: UsersRound, t: "Assemble Winning Squads", d: "Find teammates with complementary design, backend and AI skills before the countdown begins." },
  { i: Rocket, t: "Build & Submit", d: "Ship working prototypes and present live demos, GitHub repositories and slide decks in one place." },
  { i: LineChart, t: "Track Milestones", d: "Follow real-time stage deadlines, PPT rounds, offline venue schedules, and jury evaluations." },
  { i: Swords, t: "Compete Nationally", d: "Go head to head with the sharpest collegiate innovators and seasoned developers across India." },
  { i: Award, t: "Earn Real Rewards", d: "Win direct cash prizes, official trophies, certificates, and opportunities recruiters actively notice." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="overflow-hidden">
        {/* Hero Header */}
        <section className="relative pt-24 sm:pt-32 pb-14 sm:pb-20 border-b border-border/60">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-neon/10 blur-[130px]" />
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

          <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
            <Reveal>
              <Eyebrow>ABOUT VYBE DRIVEN</Eyebrow>
              <h1 className="mt-3 text-3xl min-[400px]:text-4xl sm:text-6xl font-black tracking-tight leading-[1.08]">
                More Than Events.<br />
                An Ecosystem Built to <span className="text-gradient">Drive What's Next.</span>
              </h1>
              <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                Vybe Driven (Vybe) is India&apos;s builder-first technology platform. We bridge ambitious student developers, creators, and innovators with premier hackathons, collegiate challenges, and real developer communities.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <PrimaryBtn href="/hackathons">Explore Hackathons <ArrowRight className="size-4" /></PrimaryBtn>
                <GhostBtn href="/contact">Partner With Us</GhostBtn>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Impact Metrics Section */}
        <section className="relative mx-auto max-w-[1240px] px-4 sm:px-6 py-12 sm:py-16">
          <Reveal>
            <div className="stats-laser-border">
              <div className="relative rounded-[calc(1.5rem-1.5px)] bg-[#070d08]/95 p-5 sm:p-8 backdrop-blur-2xl">
                <div className="pointer-events-none absolute -right-16 -top-16 size-60 rounded-full bg-neon/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 size-60 rounded-full bg-lime/10 blur-3xl" />

                {/* Telemetry Header */}
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon opacity-80" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-neon" />
                    </span>
                    <span className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-neon">
                      Vybe Driven Impact Metrics
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-muted-foreground">
                    <span className="inline-block size-1.5 rounded-full bg-neon/60" />
                    <span>VERIFIED NETWORK STATS</span>
                  </div>
                </div>

                {/* 4 Stat Pods */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {statsList.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.title}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-neon/50 hover:bg-surface/90 hover:shadow-glow-soft"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neon/30 bg-neon/10 text-neon transition-all duration-300 group-hover:scale-110 group-hover:bg-neon group-hover:text-black">
                              <Icon className="size-5" />
                            </div>
                            <span className="rounded-full border border-neon/20 bg-neon/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon">
                              {stat.badge}
                            </span>
                          </div>

                          <div className="mt-5">
                            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white transition-colors duration-200 group-hover:text-neon">
                              {stat.num}
                            </div>
                            <p className="mt-1 text-sm sm:text-base font-bold text-foreground">
                              {stat.title}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {stat.description}
                            </p>
                          </div>
                        </div>

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

        {/* Why Vybe Driven - 4 Core Pillars */}
        <section className="relative py-12 sm:py-16 border-t border-border/60 bg-surface/30">
          <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
            <Reveal className="text-center">
              <Eyebrow>OUR CORE ETHOS</Eyebrow>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
                Why <span className="text-gradient">Vybe Driven?</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
                We believe developers learn fastest when they build under real-world constraints, solve genuine problems, and ship with community energy.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-2">
              {pillars.map(({ n, i: Icon, t, d }, idx) => (
                <Reveal key={n} delay={idx * 70}>
                  <div className="relative h-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-br from-surface-2 to-background p-6 sm:p-8">
                    <span className="absolute -right-2 -top-6 text-[84px] sm:text-[130px] font-black leading-none text-neon/10 select-none pointer-events-none">
                      {n}
                    </span>
                    <Icon className="relative size-6 text-neon" />
                    <h3 className="relative mt-5 sm:mt-6 text-xl sm:text-2xl font-bold">{t}</h3>
                    <p className="relative mt-2 max-w-sm text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Built for Builders - 6 Capability Cards */}
        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-14 sm:py-20">
          <Reveal className="text-center">
            <Eyebrow>BUILT FOR BUILDERS</Eyebrow>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Everything You Need to <span className="text-gradient">Build What's Next.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
              A single platform engineered to take you from discovering an opportunity to hoisting the trophy on stage.
            </p>
          </Reveal>

          <div className="mt-10 sm:mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ i: Icon, t, d }, idx) => (
              <Reveal key={t} delay={idx * 50}>
                <div className="group h-full rounded-2xl border border-border bg-surface p-6 sm:p-7 transition hover:border-neon/40 hover:shadow-glow-soft">
                  <span className="grid size-11 place-items-center rounded-xl border border-border bg-surface-2 text-neon transition group-hover:bg-neon group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-bold">{t}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Real Community Moments Grid */}
        <section className="border-t border-border/60 bg-surface/20 py-14 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <Reveal className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>AUTHENTIC MOMENTS</Eyebrow>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Real Builders. Real Impact.
                </h2>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                No stock photos or synthetic simulations — every milestone is forged with real collegiate talent and community partners across India.
              </p>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 aspect-[16/10]">
                <img src={ornateConferenceHall} alt="Grand Tech Summits" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-neon" /> Grand Tech Summits & Summits
                </span>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 aspect-[16/10]">
                <img src={hackOnTrackWinners} alt="Winners & Grants" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-neon" /> Direct Cash Prizes & Awards
                </span>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 aspect-[16/10]">
                <img src={projectPitchDemo} alt="Live Project Pitches" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-neon" /> Live Demo Days & Jury Pitching
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12 sm:py-16">
          <Reveal>
            <div className="rounded-3xl border border-neon/30 bg-surface-3 p-8 sm:p-12 text-center shadow-glow-soft">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Want to partner or bring Vybe Driven to your campus?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-muted-foreground">
                We work closely with colleges, student councils, and developer communities to power high-impact hackathons.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <PrimaryBtn href="/contact">Get in Touch With Us <ArrowRight className="size-4" /></PrimaryBtn>
                <GhostBtn href="/hackathons">Browse Active Hackathons</GhostBtn>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
