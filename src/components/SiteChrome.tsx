import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  PlusCircle,
  Users,
  X,
  Instagram,
  Mail,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Phone,
  ArrowUp,
  ArrowRight,
  Gift,
  Trophy,
  Settings,
  Sparkles,
} from "lucide-react";
import homeIcon from "@/assets/nav/home.png.asset.json";
import hackathonsIcon from "@/assets/nav/hackathons.png.asset.json";
import eventsIcon from "@/assets/nav/events.png.asset.json";
import discoverIcon from "@/assets/nav/discover.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type Profile } from "@/lib/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <Link to="/" className="flex items-center" aria-label="Vybe Driven home">
      <span className={`${className} aspect-[2.79/1] block overflow-hidden transition hover:brightness-110`}>
        <picture>
          <source type="image/webp" srcSet="/vybe-driven.webp 1x, /vybe-driven@2x.webp 2x" />
          <img
            src="/vybe-driven.webp"
            alt="Vybe Driven"
            className="h-full w-full object-contain"
            loading="eager"
            decoding="async"
          />
        </picture>
      </span>
    </Link>
  );
}

const links = [
  { label: "Home", to: "/" as const, image: homeIcon.url },
  { label: "Hackathons", to: "/hackathons" as const, image: hackathonsIcon.url },
  { label: "Events", to: "/events" as const, image: eventsIcon.url },
  { label: "Discover", to: "/discover" as const, image: discoverIcon.url },
];

function getProfileCompletion(profile: Profile | null): number {
  if (!profile) return 30;
  let score = 0;
  if (profile.display_name?.trim()) score += 20;
  if (profile.avatar_url?.trim()) score += 15;
  if (profile.headline?.trim()) score += 15;
  if (profile.location?.trim()) score += 15;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.bio?.trim()) score += 10;
  if (profile.college_or_company?.trim() || profile.github_url || profile.linkedin_url) score += 10;
  return Math.min(100, Math.max(25, score));
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    await navigate({ to: "/", replace: true });
  };

  if (!user) return null;

  const displayName =
    profile?.display_name?.trim() ||
    user.user_metadata?.["full_name"] ||
    user.email?.split("@")[0] ||
    "Builder";
  const firstName = displayName.split(" ")[0] || "Builder";
  const avatar = profile?.avatar_url?.trim() || "👨‍💻";
  const email = user.email || "";
  const completion = getProfileCompletion(profile);

  // Circular progress math (radius 22, circumference 138.2)
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  return (
    <div ref={ref} className="relative">
      {/* Navbar Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open builder profile menu"
        className="group flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 py-1 pl-1.5 pr-3 transition-all hover:border-neon hover:bg-surface hover:shadow-glow-soft"
      >
        <span className="grid size-8 place-items-center rounded-full bg-neon/15 text-lg shadow-inner">
          {avatar}
        </span>
        <span className="text-xs font-bold text-foreground hidden sm:inline max-w-[110px] truncate">
          {firstName}
        </span>
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180 text-neon" : ""
          }`}
        />
      </button>

      {/* Unstop-Style Rich Profile Card Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-84 rounded-3xl border border-neon/30 bg-[#070e09]/95 p-5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-foreground">
          {/* Top Row: Avatar with Progress Ring + Edit Profile Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="relative flex size-16 shrink-0 items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 52 52">
                <circle
                  cx="26"
                  cy="26"
                  r={radius}
                  className="stroke-muted/30"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="26"
                  cy="26"
                  r={radius}
                  className="stroke-neon transition-all duration-700 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-1 flex items-center justify-center rounded-full bg-surface text-2xl shadow-inner">
                {avatar}
              </div>
              <span className="absolute -bottom-1.5 rounded-full border border-neon/50 bg-[#030804] px-1.5 py-0.2 text-[9px] font-black text-neon shadow-glow">
                {completion}%
              </span>
            </div>

            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-neon hover:bg-neon/15 hover:text-neon"
            >
              <span>Edit Profile</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Name & Email */}
          <div className="mt-3">
            <h3 className="text-base font-extrabold text-foreground truncate">
              {displayName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {email}
            </p>
          </div>

          {/* Stats Row (Unstop style XP & Badges) */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-border/80 bg-surface/60 p-2.5">
            <div className="flex items-center gap-2 rounded-xl bg-background/50 px-2.5 py-2">
              <span className="text-amber-400 text-sm">⭐</span>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Builder XP</p>
                <p className="text-xs font-black text-foreground">{completion >= 80 ? "670 pts" : "150 pts"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-background/50 px-2.5 py-2">
              <span className="text-neon text-sm">🏆</span>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Rank</p>
                <p className="text-xs font-black text-neon">{completion >= 80 ? "Verified" : "Rising"}</p>
              </div>
            </div>
          </div>

          {/* Menu Navigation Items */}
          <div className="mt-4 space-y-1 text-xs sm:text-sm">
            <Link
              to="/hackathons"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground/90 font-medium transition hover:bg-surface hover:text-neon"
            >
              <Gift className="size-4 text-neon" />
              <span>Registered Hackathons</span>
            </Link>

            <Link
              to="/opportunities/$slug"
              params={{ slug: "adappt-5-0" }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground/90 font-medium transition hover:bg-surface hover:text-neon"
            >
              <Trophy className="size-4 text-amber-400" />
              <span>ADAPPT 5.0 Challenge</span>
            </Link>

            <Link
              to="/opportunities/$slug"
              params={{ slug: "idea-competition-2026" }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground/90 font-medium transition hover:bg-surface hover:text-neon"
            >
              <Sparkles className="size-4 text-cyan-400" />
              <span>Idea Competition '26</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground/90 font-medium transition hover:bg-surface hover:text-neon"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>Profile Settings</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground/90 font-medium transition hover:bg-surface hover:text-neon"
            >
              <Phone className="size-4 text-muted-foreground" />
              <span>Contact Support</span>
            </Link>
          </div>

          {/* Logout Divider & Button */}
          <div className="mt-3 border-t border-border/80 pt-2">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              <LogOut className="size-4 text-destructive" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewUserWelcomePrompt() {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading || user) {
      setVisible(false);
      return;
    }
    const dismissed =
      typeof window !== "undefined" &&
      sessionStorage.getItem("vd-welcome-prompt-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vd-welcome-prompt-dismissed", "true");
    }
  };

  if (!visible || user) return null;

  return (
    <aside
      aria-label="Welcome prompt"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-32px)] rounded-2xl border border-neon/40 bg-[#070d09]/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-neon/15 text-neon text-sm font-bold shadow-glow-soft">
            ⚡
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Join Vybe Driven!
            </h4>
            <p className="text-[11px] text-muted-foreground">
              20,000+ builders across India
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition p-0.5 rounded-lg"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>

      <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
        Sign in or create your builder account to register for hackathons, form squads, and access your event tickets.
      </p>

      <div className="mt-3.5 flex items-center gap-2">
        <Link
          to="/auth"
          search={{
            mode: "signup",
            next: typeof window !== "undefined" ? window.location.pathname : "/",
          }}
          className="flex-1 rounded-full bg-neon px-4 py-2 text-center text-xs font-bold text-primary-foreground shadow-glow-soft hover:brightness-105 transition"
        >
          Sign In / Join Free
        </Link>
        <button
          onClick={handleDismiss}
          className="rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          Later
        </button>
      </div>
    </aside>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  const displayName =
    profile?.display_name?.trim() ||
    user?.user_metadata?.["full_name"] ||
    user?.email?.split("@")[0] ||
    "Builder";
  const avatar = profile?.avatar_url?.trim() || "👨‍💻";
  const completion = getProfileCompletion(profile);

  return (
    <header className="sticky top-2 sm:top-4 z-50 px-2.5 sm:px-4">
      <nav
        className="relative mx-auto flex h-[64px] sm:h-[72px] max-w-[1120px] items-center justify-between rounded-2xl sm:rounded-[24px] border border-border px-3.5 sm:px-4 backdrop-blur-xl transition-colors"
        style={{ background: "var(--nav-bg)", boxShadow: "var(--nav-shadow)" }}
      >
        <ul className="hidden items-center gap-2 lg:flex">
          {links.map((item) => {
            const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            return (
              <li key={item.label} className="group relative">
                <Link
                  to={item.to}
                  aria-label={item.label}
                  title={item.label}
                  className={`nav-icon grid size-11 place-items-center rounded-full border-2 transition ${
                    active ? "is-active border-lime shadow-glow" : "border-transparent hover:border-border hover:bg-surface"
                  }`}
                >
                  <img src={item.image} alt="" className="nav-art size-6 object-contain" />
                </Link>
                <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100">
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <Logo className="h-8.5 sm:h-11" />
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/about"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-neon"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-neon"
          >
            Contact Us
          </Link>
          {!loading &&
            (user ? (
              <ProfileMenu />
            ) : (
              <Button asChild className="rounded-full bg-gradient-brand text-primary-foreground hover:brightness-105">
                <Link to="/auth" search={{ mode: "signin", next: "/" }}>
                  Sign In
                </Link>
              </Button>
            ))}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full border border-border/60 bg-surface/40 hover:bg-surface hover:text-neon text-foreground"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>
      {open && (
        <div className="mx-auto mt-2 max-w-[1120px] rounded-2xl border border-neon/25 bg-[#060b07]/95 p-3.5 shadow-2xl backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Mobile Profile Header if Logged In */}
          {user && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-surface/80 p-3">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-neon/15 text-2xl shadow-inner">
                  {avatar}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground truncate max-w-[160px]">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                </div>
              </div>
              <span className="rounded-full border border-neon/50 bg-[#030804] px-2 py-0.5 text-[10px] font-bold text-neon shadow-glow">
                {completion}%
              </span>
            </div>
          )}

          <div className="space-y-1">
            {links.map((item) => {
              const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-neon/15 text-neon border border-neon/30"
                      : "text-foreground hover:bg-surface/80 hover:text-neon"
                  }`}
                >
                  <img src={item.image} alt="" className="nav-art size-5.5 object-contain" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-foreground hover:bg-surface/80 hover:text-neon transition"
            >
              <Sparkles className="size-5 text-neon" />
              <span>About Us</span>
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-foreground hover:bg-surface/80 hover:text-neon transition"
            >
              <Phone className="size-5 text-neon" />
              Contact Us
            </Link>
          </div>
          <div className="mt-3 border-t border-border/80 pt-3">
            {!loading &&
              (user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
                  >
                    <Settings className="size-4 text-neon" />
                    Edit Builder Profile
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setOpen(false);
                      window.location.href = "/";
                    }}
                    className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 text-left"
                  >
                    <LogOut className="size-4 text-destructive" />
                    Logout
                  </button>
                </div>
              ) : (
                <Button
                  asChild
                  className="w-full h-11 rounded-full bg-gradient-brand text-primary-foreground font-bold shadow-glow-soft"
                >
                  <Link to="/auth" search={{ mode: "signin", next: "/" }}>
                    Sign In to Vybe Driven
                  </Link>
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Global Welcome Prompt for unauthenticated visitors */}
      <NewUserWelcomePrompt />
    </header>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-20 border-t border-border bg-[#030704] text-foreground overflow-hidden">
      {/* Ambient background glows & cyber grid */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[350px] w-[800px] -translate-x-1/2 rounded-full bg-neon/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[450px] w-[1000px] -translate-x-1/2 rounded-full bg-neon/10 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />

      {/* Main Grid Content */}
      <div className="relative mx-auto max-w-[1240px] px-6 pt-16 pb-12">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand & Mission column */}
          <div className="lg:col-span-5 space-y-5">
            <Logo className="h-12" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Powering India&apos;s most ambitious builders, hackers, and creators. Discover tier-1 hackathons, assemble winning squads, and drive the future with Vybe Driven.
            </p>

            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface-2/90 px-3.5 py-1.5 text-xs font-medium text-foreground backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-neon" />
              </span>
              <span className="text-muted-foreground">Live Across India</span>
              <span className="text-neon font-semibold">· 25.4K+ Builders</span>
            </div>

            {/* Social & Contact pills */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                href="https://www.instagram.com/vybedriven"
                target="_blank"
                rel="noreferrer"
                aria-label="Vybe Driven on Instagram"
                className="group flex size-10 items-center justify-center rounded-xl border border-border bg-surface transition hover:border-neon/60 hover:bg-neon/10 hover:text-neon hover:-translate-y-0.5"
              >
                <Instagram className="size-4 text-muted-foreground transition group-hover:text-neon" />
              </a>
              <a
                href="mailto:vybedriven@gmail.com"
                aria-label="Email Vybe Driven"
                className="group flex size-10 items-center justify-center rounded-xl border border-border bg-surface transition hover:border-neon/60 hover:bg-neon/10 hover:text-neon hover:-translate-y-0.5"
              >
                <Mail className="size-4 text-muted-foreground transition group-hover:text-neon" />
              </a>
              <Link
                to="/contact"
                aria-label="Contact Vybe Driven"
                className="group flex size-10 items-center justify-center rounded-xl border border-border bg-surface transition hover:border-neon/60 hover:bg-neon/10 hover:text-neon hover:-translate-y-0.5"
              >
                <Phone className="size-4 text-muted-foreground transition group-hover:text-neon" />
              </Link>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Column 1: Explore */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explore</h4>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: "Hackathons", to: "/hackathons" as const },
                  { label: "Tech Events", to: "/events" as const },
                  { label: "Competitions", to: "/hackathons" as const },
                  { label: "Discover All", to: "/discover" as const },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-neon"
                    >
                      <span className="size-1 rounded-full bg-transparent transition group-hover:bg-neon" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Community */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Community</h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/about" className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-neon">
                    <span className="size-1 rounded-full bg-transparent transition group-hover:bg-neon" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-neon">
                    <span className="size-1 rounded-full bg-transparent transition group-hover:bg-neon" />
                    Partnerships
                  </Link>
                </li>
                <li>
                  <Link to="/auth" search={{ mode: "signup", next: "/" }} className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-neon">
                    <span className="size-1 rounded-full bg-transparent transition group-hover:bg-neon" />
                    Join Builder Network
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Direct Connect Card */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Connect</h4>
              <div className="mt-4 rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur-md">
                <p className="text-xs font-medium text-foreground">Have questions or want to partner?</p>
                <a
                  href="mailto:vybedriven@gmail.com"
                  className="mt-2 block break-all text-xs text-neon hover:underline"
                >
                  vybedriven@gmail.com
                </a>
                <Link
                  to="/contact"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground transition hover:text-neon"
                >
                  Message us <ArrowRight className="size-3 text-neon" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centerpiece: Animated Cinematic VYBE DRIVEN Brand Typography */}
      <div className="relative border-t border-border/70 pt-10 pb-6 overflow-hidden select-none">
        {/* Animated Light Beam gliding across the top edge */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="footer-glow-beam absolute top-0 h-[1.5px] w-64 bg-gradient-to-r from-transparent via-neon to-transparent" />

        <div className="relative mx-auto max-w-[1400px] px-3 sm:px-4 text-center">
          <div className="group relative inline-block cursor-default max-w-full overflow-hidden">
            <h2 className="footer-big-brand text-[clamp(1.9rem,11.2vw,12.5rem)] font-black tracking-[-0.03em] sm:tracking-[-0.04em] leading-none transition-all duration-700 select-none">
              VYBE DRIVEN
            </h2>
            {/* Ambient ground reflection */}
            <div className="pointer-events-none absolute -bottom-4 inset-x-0 h-10 bg-gradient-to-t from-[#030704] to-transparent" />
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Back to Top */}
      <div className="relative border-t border-border/50 bg-black/60 px-6 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 <span className="font-semibold text-foreground">Vybe Driven</span>. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Engineered for Ambitious Builders</span>
            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-neon hover:text-neon cursor-pointer"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="size-3.5 transition group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}