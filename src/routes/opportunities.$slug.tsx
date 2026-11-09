import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  Trophy,
  Users,
  WalletCards,
  Gift,
  Rocket,
  Laptop,
  Coffee,
  Award,
  Handshake,
  Brain,
  Sparkles,
  Crown,
  Ticket,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navbar, Footer } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { getOpportunity, type Opportunity } from "@/data/opportunities";
import { useAuth } from "@/lib/auth";
import { EventRegistrationModal } from "@/components/EventRegistrationModal";
import { TeamManagementModal } from "@/components/TeamManagementModal";
import { isUserRegistered, getRegistrationCount, useEventRegistrations, isEventOrganizer, type EventRegistration } from "@/data/events-store";

type OpportunitySearch = { register?: string };

export const Route = createFileRoute("/opportunities/$slug")({
  validateSearch: (search: Record<string, unknown>): OpportunitySearch => ({
    register: typeof search["register"] === "string" ? search["register"] : undefined,
  }),
  loader: ({ params }) => {
    const opportunity = getOpportunity(params.slug);
    if (!opportunity) throw notFound();
    return opportunity;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Event unavailable — Vybe Driven" }],
      };
    }
    const pageTitle = `${loaderData.title} | ${loaderData.type} in ${loaderData.location} — Vybe Driven`;
    const canonicalUrl = `https://www.vybedriven.in/opportunities/${loaderData.slug}`;
    const imageUrl = loaderData.image?.startsWith("http")
      ? loaderData.image
      : `https://www.vybedriven.in${loaderData.image}`;
    const keywords = `${loaderData.title}, ${loaderData.type}, hackathons in ${loaderData.location}, nearest hackathon, hackathons near me, vybe driven, vybe, vibe driven, vibe, ${loaderData.organizer}, coding competitions 2026, tech events`;

    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: loaderData.description },
        { name: "keywords", content: keywords },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:site_name", content: "Vybe Driven" },
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: imageUrl },
        { property: "og:locale", content: "en_IN" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@vybedriven" },
        { name: "twitter:title", content: pageTitle },
        { name: "twitter:description", content: loaderData.description },
        { name: "twitter:image", content: imageUrl },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
      ],
    };
  },
  component: OpportunityDetails,
  notFoundComponent: OpportunityNotFound,
});

function FormattedOverview({ overview }: { overview: string }) {
  const [expanded, setExpanded] = useState(false);
  const sections = overview.split(/\n\n+/);
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="relative">
        <div
          className={`space-y-5 text-sm sm:text-base leading-relaxed text-muted-foreground transition-all duration-300 ${
            !expanded ? "max-h-[300px] overflow-hidden" : ""
          }`}
        >
          {sections.map((sec, idx) => {
            const lines = sec.trim().split("\n");
            const firstLine = lines[0].trim();

            const isHeading =
              lines.length > 1 &&
              (firstLine.endsWith(":") || firstLine.startsWith("###") || firstLine.startsWith("**"));

            if (isHeading) {
              const headingText = firstLine.replace(/^[#*]+/, "").replace(/[*:]+$/, "").trim();
              const restLines = lines.slice(1);
              return (
                <div key={idx} className="pt-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-neon shrink-0" />
                    <span>{headingText}</span>
                  </h3>
                  <div className="space-y-2">
                    {restLines.map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
                        const cleanText = trimmed.replace(/^[•\-*]\s*/, "");
                        const colonIndex = cleanText.indexOf(":");
                        return (
                          <div key={lIdx} className="flex items-start gap-2.5 text-xs sm:text-sm pl-2 text-foreground/90">
                            <span className="mt-2 size-1 rounded-full bg-neon/80 shrink-0" />
                            <span>
                              {colonIndex > 0 ? (
                                <>
                                  <strong className="font-semibold text-foreground">
                                    {cleanText.slice(0, colonIndex + 1)}
                                  </strong>
                                  {cleanText.slice(colonIndex + 1)}
                                </>
                              ) : (
                                cleanText
                              )}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <p key={lIdx} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isBulletList = lines.every((l) => {
              const t = l.trim();
              return t.startsWith("•") || t.startsWith("-") || t.startsWith("*") || /^\d+[.)]/.test(t);
            });

            if (isBulletList) {
              return (
                <ul key={idx} className="space-y-2 pl-2 my-2">
                  {lines.map((l, lIdx) => {
                    const clean = l.trim().replace(/^[•\-*]\s*|^\d+[.)]\s*/, "");
                    const colonIndex = clean.indexOf(":");
                    return (
                      <li key={lIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                        <span className="mt-2 size-1.5 rounded-full bg-neon shrink-0" />
                        <span>
                          {colonIndex > 0 ? (
                            <>
                              <strong className="font-semibold text-foreground">{clean.slice(0, colonIndex + 1)}</strong>
                              {clean.slice(colonIndex + 1)}
                            </>
                          ) : (
                            clean
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              );
            }

            return (
              <p key={idx} className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                {sec}
              </p>
            );
          })}
        </div>

        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />
        )}
      </div>

      <div className="pt-2 flex items-center justify-start">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 rounded-full bg-neon px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-glow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              Read More Details <ChevronDown className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function EventAuthGateDialog({
  item,
  open,
  onOpenChange,
}: {
  item: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    setBusy(true);
    setError("");
    try {
      const redirectTo = `${window.location.origin}/opportunities/${item.slug}`;
      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (oauthErr) {
        setBusy(false);
        setError(oauthErr.message);
        return;
      }
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err: unknown) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Unable to initiate Google sign-in.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setBusy(false);
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setBusy(false);
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      if (authMode === "signup") {
        if (!fullName.trim()) {
          setBusy(false);
          setError("Please enter your Full Name.");
          return;
        }

        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), phone: phone.trim() || undefined },
            emailRedirectTo: `${window.location.origin}/opportunities/${item.slug}`,
          },
        });

        if (signUpErr) {
          setBusy(false);
          if (signUpErr.message.toLowerCase().includes("user already registered")) {
            setError("An account with this email already exists. Please switch to 'Sign In' or use 'Continue with Google' above!");
          } else {
            setError(signUpErr.message);
          }
          return;
        }

        if (!signUpData.session) {
          setBusy(false);
          toast.success("Verification link sent to your email!");
          setError(`📩 Verification link sent to ${email.trim()}! Please check your inbox and verify your email to unlock event details.`);
          return;
        }
      }

      // Sign in with password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr) {
        setBusy(false);
        if (signInErr.message.toLowerCase().includes("email not confirmed")) {
          setError("⚠️ Your email is not verified yet. Please check your inbox (and spam folder) for the verification email.");
        } else if (signInErr.message.toLowerCase().includes("invalid login credentials")) {
          setError("Invalid email or password. If you originally signed in with Google, please click 'Continue with Google' above. Or click 'Forgot password?' to reset.");
        } else {
          setError(signInErr.message);
        }
        return;
      }

      toast.success("Welcome back! Event unlocked.");
      setBusy(false);
      onOpenChange(false);
    } catch (err: unknown) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Authentication error.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md border-border bg-[#070d09] p-5 sm:p-7 text-foreground shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b border-border/70 pb-4 text-left">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl border border-neon/30 bg-surface flex items-center justify-center overflow-hidden shrink-0 shadow-glow-soft">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {item.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Hosted by {item.organizer}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4 text-xs sm:text-sm">
          <div className="rounded-2xl border border-neon/40 bg-neon/5 p-4">
            <div className="flex items-center gap-2 text-neon font-bold text-sm">
              <Lock className="size-4 shrink-0" />
              <span>Login or Sign Up Required to Explore</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Please sign in or create your builder account to unlock complete event stages, timelines, problem statements, and submit your registration.
            </p>
          </div>

          {/* 1-Click Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={busy}
            className="h-11 sm:h-12 w-full rounded-2xl border-border bg-surface hover:border-neon hover:bg-neon/10 transition flex items-center justify-center gap-2.5 font-bold text-foreground text-xs sm:text-sm shadow-sm"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span className="h-px flex-1 bg-border" />
            OR WITH EMAIL &amp; PASSWORD
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Toggle */}
          <div className="flex rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => { setAuthMode("signin"); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition ${authMode === "signin" ? "bg-neon/15 text-neon border border-neon/30 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("signup"); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition ${authMode === "signup" ? "bg-neon/15 text-neon border border-neon/30 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  Full Name <span className="text-neon">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1">
                Email Address <span className="text-neon">*</span>
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1">
                Password <span className="text-neon">*</span>
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
              />
            </div>

            {authMode === "signin" && (
              <div className="text-right">
                <a
                  href="/forgot-password"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-neon hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/" })}
                className="rounded-full border-border text-xs"
              >
                Back to Home
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-full bg-neon text-primary-foreground font-bold shadow-glow-soft hover:brightness-105 text-xs sm:text-sm flex-1 sm:flex-initial px-6"
              >
                {busy ? "Please wait..." : authMode === "signin" ? "Sign In & Unlock" : "Create Account & Unlock"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OpportunityDetails() {
  const item = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [exploreGateOpen, setExploreGateOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  // Mandatory Auth Gate: if visitor is not logged in, prompt them to sign in or create account
  useEffect(() => {
    if (!loading && !user && search.register !== "1") {
      setExploreGateOpen(true);
    } else {
      setExploreGateOpen(false);
    }
  }, [user, loading, search.register]);

  // Auto-open modal if requested via ?register=1
  useEffect(() => {
    if (search.register === "1") {
      setRegModalOpen(true);
    }
  }, [search.register]);

  const handleRegisterClick = () => {
    setRegModalOpen(true);
  };

  const registrations = useEventRegistrations(item.slug);
  const regCount = registrations.length;

  const userIdentifier = user?.email || user?.id;
  const isRegistered = isUserRegistered(item.slug, userIdentifier);
  const isHost = isEventOrganizer(item, user);

  const userRegRecord = useMemo(() => {
    if (!user) return null;
    return (
      registrations.find(
        (r) =>
          (user.id && r.userId === user.id) ||
          (user.email && r.email.toLowerCase() === user.email.toLowerCase()) ||
          (user.email &&
            r.teammates &&
            r.teammates.some((t) => t.email.toLowerCase() === user.email!.toLowerCase()))
      ) || null
    );
  }, [registrations, user]);

  const facts = [
    { icon: Calendar, label: "Event dates", value: item.date },
    { icon: MapPin, label: "Format", value: `${item.format} · ${item.location}` },
    { icon: Clock3, label: "Registration deadline", value: item.registrationDeadline },
    { icon: Users, label: "Team size", value: item.teamSize },
    { icon: CheckCircle2, label: "Eligibility", value: item.eligibility },
    { icon: WalletCards, label: "Entry fee", value: item.fee },
  ];

  const eventStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": item.title,
    "description": item.description,
    "image": item.image?.startsWith("http")
      ? item.image
      : `https://www.vybedriven.in${item.image}`,
    "startDate": item.date,
    "eventAttendanceMode":
      item.format === "Online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : item.format === "Hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus":
      item.status === "Event full" || item.status === "Sold out"
        ? "https://schema.org/EventMovedOnline"
        : "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": item.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": item.location.includes("Mumbai") ? "Mumbai" : item.location.includes("Pune") ? "Pune" : "India",
        "addressCountry": "IN"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": item.organizer,
      "url": "https://www.vybedriven.in"
    },
    "offers": {
      "@type": "Offer",
      "url": item.registrationUrl || `https://www.vybedriven.in/opportunities/${item.slug}`,
      "price": item.fee.includes("₹") ? (item.fee.replace(/[^\d]/g, "") || "0") : "0",
      "priceCurrency": "INR",
      "availability":
        item.status === "Sold out"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventStructuredData) }}
      />
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-[1200px] gap-6 sm:gap-7 px-4 sm:px-6 pb-8 pt-8 sm:pb-10 sm:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold">
                  {item.type}
                </span>
                <span className="rounded-full bg-neon px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {item.status}
                </span>
                {(item as any).isHosted && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-neon/50 bg-black/80 px-2.5 py-1 text-xs font-semibold text-neon backdrop-blur">
                    <Sparkles className="size-3" /> Community Hosted
                  </span>
                )}
                {regCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <Users className="size-3 text-neon" /> {regCount} {regCount === 1 ? "applicant" : "applicants"}
                  </span>
                )}
              </div>
              <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-neon">{item.tag.toUpperCase()}</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{item.title}</h1>
              <p className="mt-3 sm:mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-muted-foreground">
                Hosted by <span className="font-semibold text-foreground">{item.organizer}</span>
              </p>

              {/* Top Prize & Trophy Banner */}
              {item.prize && (
                item.slug === "goa-buildathon-2027" ? (
                  <div className="mt-5 inline-block">
                    <img
                      src="/events/prizes-worth-banner.jpg"
                      alt="Prizes Worth ₹ 10,00,000"
                      className="h-auto max-w-full sm:max-w-md md:max-w-lg rounded-2xl border border-neon/40 shadow-glow-soft hover:shadow-glow transition"
                    />
                  </div>
                ) : (
                  <div className="mt-5 inline-flex items-center gap-3 sm:gap-4 rounded-2xl border border-neon/35 bg-gradient-to-r from-neon/15 via-emerald-500/10 to-transparent p-2.5 sm:p-3 pr-4 sm:pr-5 shadow-glow-soft">
                    <div className="pl-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neon">Prizes worth</p>
                      <p className="text-xl min-[400px]:text-2xl sm:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                        {item.prize}
                      </p>
                    </div>
                    <img
                      src="/events/golden-star-trophy.png"
                      alt="Prize Trophy"
                      className="h-12 min-[400px]:h-14 sm:h-16 w-auto object-contain shrink-0 drop-shadow-[0_4px_14px_rgba(250,204,21,0.45)]"
                    />
                  </div>
                )
              )}
            </div>
            <img
              src={item.image}
              alt={item.title}
              style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
              className={`aspect-[16/10] w-full rounded-2xl bg-background ${
                item.imageFit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
          </div>
        </section>

        {/* Content & Sidebar */}
        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
            <div>
              {/* Quick Facts Grid */}
              <div className="grid overflow-hidden rounded-2xl border border-border bg-card grid-cols-2 lg:grid-cols-3">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="border-b border-border p-4 sm:p-5 [&:nth-child(odd)]:border-r sm:[&:nth-child(even)]:border-r">
                    <Icon className="size-4 sm:size-5 text-neon" />
                    <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs font-semibold text-muted-foreground">{label}</p>
                    <p className="mt-1 text-xs sm:text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {/* About Section with Read More */}
              <section className="py-7 sm:py-9">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="h-6 w-1 rounded-full bg-neon shadow-glow-soft" />
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    All that you need to know about {item.title}
                  </h2>
                </div>
                <FormattedOverview overview={item.overview} />
              </section>

              {/* Stages and Timeline */}
              {item.schedule && item.schedule.length > 0 && (
                <section className="border-t border-border py-8 sm:py-10">
                  <div className="flex items-center gap-2.5 mb-7">
                    <span className="h-6 w-1 rounded-full bg-neon shadow-glow-soft" />
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Stages and Timelines</h2>
                  </div>

                  <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-3.5 before:top-4 before:bottom-6 before:w-[2px] before:border-l-2 before:border-dashed before:border-neon/50">
                    {item.schedule.map((step, index) => {
                      const dateParts = step.dateBadge?.split(" ") || [];
                      const month = dateParts[0] || `Stage`;
                      const day = dateParts[1] || `${index + 1}`;
                      return (
                        <div key={step.title} className="relative pb-9 last:pb-2">
                          {/* Calendar Node directly over the timeline line */}
                          <div className="flex items-center gap-3.5 sm:gap-4 mb-3.5">
                            <div className="relative -ml-[23px] sm:-ml-[25px] flex flex-col items-center justify-center rounded-xl border border-neon/70 bg-surface-2 px-2.5 py-1 shadow-glow-soft min-w-[46px] text-center shrink-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neon leading-tight">{month}</span>
                              <span className="text-base font-extrabold text-foreground leading-none">{day}</span>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold font-mono text-neon">
                              {step.date}
                            </span>
                          </div>

                          {/* Stage Card */}
                          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm transition hover:border-neon/50 hover:bg-surface-2/60 hover:shadow-glow-soft">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                              <h3 className="text-base sm:text-lg font-bold text-foreground">{step.title}</h3>
                              <span className="rounded-full bg-neon/15 border border-neon/40 px-3 py-0.5 text-xs font-semibold text-neon font-mono shrink-0">
                                Stage {index + 1}
                              </span>
                            </div>

                            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                              {step.description}
                            </p>

                            {step.bullets && step.bullets.length > 0 && (
                              <ul className="mt-3.5 space-y-2 pl-1">
                                {step.bullets.map((b) => (
                                  <li key={b} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-neon shrink-0 shadow-glow-soft" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {step.evaluation && (
                              <div className="mt-4 rounded-xl border border-neon/20 bg-neon/5 px-4 py-2.5 text-xs text-muted-foreground">
                                <span className="font-bold text-neon">Evaluation: </span>
                                <span className="text-foreground/90">{step.evaluation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Rewards, Perks & Opportunities */}
              {(item.rewards || item.prize || (item.perks && item.perks.length > 0)) && (
                <section className="border-t border-border py-8 sm:py-10">
                  <div className="flex items-center gap-2.5 mb-6">
                    <span className="h-6 w-1 rounded-full bg-neon shadow-glow-soft" />
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Rewards and Prizes</h2>
                  </div>

                  {item.rewards && item.rewards.length > 0 ? (
                    <div className="space-y-4">
                      {item.rewards.map((rew) => (
                        rew.type === "cash" ? (
                          <div
                            key={rew.title}
                            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-surface to-surface p-6 sm:p-7 shadow-[0_0_30px_rgba(245,158,11,0.15)] transition hover:border-amber-400"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500" />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-center gap-4 sm:gap-6">
                                <div className="relative shrink-0">
                                  <img
                                    src="/events/golden-star-trophy.png"
                                    alt="Grand Prize Trophy"
                                    className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_8px_20px_rgba(245,158,11,0.5)]"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
                                      {rew.amount}
                                    </span>
                                    <span className="text-xs sm:text-sm font-extrabold tracking-widest text-amber-300 uppercase">
                                      {rew.amountSub || "WORTH"}
                                    </span>
                                  </div>
                                  <h3 className="mt-1 text-base sm:text-lg font-bold text-foreground">
                                    {rew.title}
                                  </h3>
                                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                                    {rew.description}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-4 py-2 text-xs font-bold text-amber-300 shadow-glow-soft">
                                  <Trophy className="size-4 text-amber-400" />
                                  {rew.badge || "Certificate"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={rew.title}
                            className="rounded-2xl sm:rounded-3xl border border-blue-500/35 bg-gradient-to-br from-blue-500/10 via-surface to-surface p-5 sm:p-6 transition hover:border-blue-400/60 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4 sm:gap-5">
                                <div className="size-14 sm:size-16 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-600/20 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
                                  <Award className="size-7 sm:size-8 text-blue-400" />
                                </div>
                                <div>
                                  <h3 className="text-base sm:text-lg font-bold text-foreground">{rew.title}</h3>
                                  {rew.description && (
                                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                                      {rew.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-400/10 px-3.5 py-1.5 text-xs font-bold text-blue-300">
                                  <CheckCircle2 className="size-3.5 text-blue-400" />
                                  {rew.badge || "Certificate"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      ))}

                      {item.rewardsFootnote && (
                        <p className="mt-4 text-xs font-medium text-muted-foreground/90 italic flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-neon shrink-0" />
                          <span>{item.rewardsFootnote}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Fallback for items with prize */
                    <div className="space-y-4">
                      {item.prize && (
                        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-surface to-surface p-6 sm:p-7 shadow-[0_0_30px_rgba(245,158,11,0.15)] transition hover:border-amber-400">
                          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500" />
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4 sm:gap-6">
                              <div className="relative shrink-0">
                                <img
                                  src="/events/golden-star-trophy.png"
                                  alt="Prize Trophy"
                                  className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_8px_20px_rgba(245,158,11,0.5)]"
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
                                    {item.prize}
                                  </span>
                                  <span className="text-xs sm:text-sm font-extrabold tracking-widest text-amber-300 uppercase">
                                    TOTAL PRIZE POOL
                                  </span>
                                </div>
                                <h3 className="mt-1 text-base sm:text-lg font-bold text-foreground">Cash Prizes & Recognition</h3>
                                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                                  Awarded to winning innovators, finalist teams, and category champions.
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-4 py-2 text-xs font-bold text-amber-300 shadow-glow-soft">
                                <Trophy className="size-4 text-amber-400" />
                                Certificate & Awards
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extra Perks Grid */}
                  {item.perks && item.perks.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border/70">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Participant Benefits & Perks
                      </p>
                      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        {item.perks.map((perk) => (
                          <div
                            key={perk.title}
                            className="group relative flex gap-3.5 rounded-xl sm:rounded-2xl border border-border bg-card p-4 transition duration-300 hover:border-neon/40 hover:bg-surface-2 hover:shadow-glow-soft"
                          >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon group-hover:bg-neon group-hover:text-primary-foreground transition duration-300">
                              {perk.icon === "gift" ? (
                                <Gift className="size-5" />
                              ) : perk.icon === "rocket" ? (
                                <Rocket className="size-5" />
                              ) : perk.icon === "laptop" ? (
                                <Laptop className="size-5" />
                              ) : perk.icon === "coffee" ? (
                                <Coffee className="size-5" />
                              ) : perk.icon === "award" ? (
                                <Award className="size-5" />
                              ) : perk.icon === "handshake" ? (
                                <Handshake className="size-5" />
                              ) : perk.icon === "brain" ? (
                                <Brain className="size-5" />
                              ) : (
                                <Sparkles className="size-5" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {perk.emoji && <span className="text-base select-none">{perk.emoji}</span>}
                                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-neon transition">
                                  {perk.title}
                                </h3>
                              </div>
                              {perk.description && (
                                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                  {perk.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Sticky Registration Sidebar */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                {/* Host Control Box */}
                {isHost && (
                  <div className="mb-5 rounded-xl border border-neon/40 bg-neon/10 p-3.5 text-xs text-foreground">
                    <div className="flex items-center gap-2 font-bold text-neon">
                      <Crown className="size-4" />
                      <span>You are hosting this event</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      Track registrations and download participant CSV from your organizer dashboard.
                    </p>
                    <div className="mt-2.5 flex flex-col gap-2">
                      <Button asChild size="sm" className="w-full rounded-lg bg-neon text-primary-foreground font-bold hover:brightness-105">
                        <Link to="/manage-events" search={{ tab: "registrations", slug: item.slug }}>
                          Manage {regCount} Registrations →
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="w-full rounded-lg border-border text-xs">
                        <Link to="/host" search={{ edit: item.slug }}>
                          ✏️ Edit Event Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Registration
                  </p>
                  {regCount > 0 && (
                    <span className="text-xs font-semibold text-neon font-mono">
                      {regCount} {regCount === 1 ? "applicant" : "applicants"}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-lg sm:text-xl font-bold">
                  {item.status === "Sold out"
                    ? "Sold out"
                    : item.status === "Event full"
                    ? "Event full"
                    : item.status === "Approval required"
                    ? "Approval required"
                    : "Registrations open"}
                </h2>

                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {item.registrationNote ??
                    (item.registrationDeadline === "To be announced"
                      ? "Register now to secure your participation spot."
                      : `Apply before ${item.registrationDeadline}.`)}
                </p>

                {/* Already Registered Card */}
                {isRegistered ? (
                  <div className="mt-5 rounded-2xl border border-neon/50 bg-neon/10 p-4 shadow-glow-soft">
                    <div className="flex items-center gap-2 text-neon font-bold text-sm">
                      <CheckCircle2 className="size-5" />
                      <span>You're registered for this event!</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your application has been received by {item.organizer}.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegisterClick}
                      className="mt-3 w-full rounded-full border-neon/50 text-xs font-bold text-neon hover:bg-neon hover:text-primary-foreground shadow-sm"
                    >
                      <Ticket className="size-3.5 mr-1.5" />
                      View Entry Pass / Ticket
                    </Button>

                    {userRegRecord?.teamType === "team" && (
                      <Button
                        size="sm"
                        onClick={() => setTeamModalOpen(true)}
                        className="mt-2 w-full rounded-full bg-gradient-brand text-black font-extrabold text-xs shadow-glow hover:brightness-105"
                      >
                        <Users className="size-3.5 mr-1.5" />
                        Manage Team Roster ({1 + (userRegRecord.teammates?.length || 0)}/4)
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {/* Primary Registration Action */}
                    {item.registrationUrl ? (
                      <a
                        href={item.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow hover:brightness-105 transition"
                      >
                        Register Now
                        <ArrowRight className="size-4" />
                      </a>
                    ) : (
                      item.status !== "Sold out" && (
                        <Button
                          type="button"
                          onClick={handleRegisterClick}
                          className="w-full rounded-full bg-gradient-brand text-primary-foreground font-bold py-6 text-sm shadow-glow hover:brightness-105"
                        >
                          Register Now
                          <Sparkles className="ml-2 inline size-4" />
                        </Button>
                      )
                    )}

                    {/* Clean Sign In Option for Already Registered Users */}
                    {!user && (
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setAuthGateOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-neon transition cursor-pointer"
                        >
                          <LogIn className="size-3.5" />
                          <span>Already registered? Sign in to view pass</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Group Link */}
                {item.groupUrl && (
                  <a
                    href={item.groupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-neon/40 bg-surface/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-neon transition hover:border-neon hover:bg-neon/15 hover:shadow-glow-soft"
                  >
                    <MessageCircle className="size-4 text-neon" />
                    <span>{item.groupLabel ?? "Join Official WhatsApp Community"}</span>
                    <ExternalLink className="size-3.5 opacity-80" />
                  </a>
                )}

                {/* Organizer Contacts */}
                {item.contacts && (
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground">QUERIES</p>
                    <ul className="mt-2 space-y-1.5">
                      {item.contacts.map((contact) => (
                        <li key={contact.phone} className="text-xs sm:text-sm">
                          <a href={`tel:${contact.phone}`} className="font-medium hover:text-neon">
                            {contact.name}
                          </a>
                          <span className="text-muted-foreground"> · {contact.phone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <a
                  href="mailto:vybedriven@gmail.com"
                  className="mt-3.5 block text-center text-xs text-muted-foreground hover:text-neon transition"
                >
                  Have questions? Ask Vybe Driven
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />

      {/* Registration Dialog */}
      <EventRegistrationModal
        opportunity={item}
        open={regModalOpen}
        onOpenChange={setRegModalOpen}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        registration={userRegRecord}
        open={teamModalOpen}
        onOpenChange={setTeamModalOpen}
      />

      {/* Mandatory Auth Gate for Unauthenticated Visitors */}
      <EventAuthGateDialog
        item={item}
        open={exploreGateOpen}
        onOpenChange={setExploreGateOpen}
      />
    </div>
  );
}

function OpportunityNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold">Event not found</h1>
        <p className="mt-3 text-muted-foreground">This event may have moved or is no longer available.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/discover">Browse all events</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}
