import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Sparkles, User, ArrowLeft, ExternalLink, PlusCircle, Calendar, Users, Edit3, Download, Ticket, ExternalLink as ExtLink } from "lucide-react";
import { useHostedEvents, getUserRegistrations, getRegistrationsBySlug, exportRegistrationsToCSV } from "@/data/events-store";
import { Navbar, Footer } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export const BUILDER_EMOJIS = [
  { emoji: "👨‍💻", label: "Dev Lead" },
  { emoji: "👩‍💻", label: "Core Coder" },
  { emoji: "🚀", label: "Founder" },
  { emoji: "🤖", label: "AI & ML" },
  { emoji: "⚡", label: "Hacker" },
  { emoji: "🕶️", label: "Cyber" },
  { emoji: "🎨", label: "UI / UX" },
  { emoji: "👾", label: "Gamer" },
  { emoji: "🧠", label: "Deep Tech" },
  { emoji: "🦾", label: "Robotics" },
  { emoji: "🌟", label: "Superstar" },
  { emoji: "🏆", label: "Winner" },
  { emoji: "🦄", label: "Innovator" },
  { emoji: "🔥", label: "10x Builder" },
  { emoji: "🐱‍💻", label: "Ninja" },
  { emoji: "🎯", label: "Strategist" },
];

const emptyProfile = {
  display_name: "",
  username: "",
  headline: "",
  bio: "",
  location: "",
  college_or_company: "",
  skills: "",
  interests: "",
  github_url: "",
  linkedin_url: "",
  website_url: "",
  avatar_url: "👨‍💻",
};

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Builder Profile — Vybe Driven" },
      { name: "description", content: "Complete and manage your private Vybe Driven builder profile." },
      { property: "og:title", content: "Builder Profile — Vybe Driven" },
      { property: "og:description", content: "Build your identity in the Vybe Driven community." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function calculateCompletion(form: typeof emptyProfile): number {
  let score = 0;
  if (form.display_name.trim()) score += 20;
  if (form.avatar_url.trim()) score += 15;
  if (form.headline.trim()) score += 15;
  if (form.location.trim()) score += 15;
  if (form.skills.trim()) score += 15;
  if (form.bio.trim()) score += 10;
  if (form.college_or_company.trim() || form.github_url.trim() || form.linkedin_url.trim()) score += 10;
  return Math.min(100, Math.max(15, score));
}

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const profile = data as Profile | null;
        if (profile) {
          setForm({
            display_name: profile.display_name || "",
            username: profile.username ?? "",
            headline: profile.headline || "",
            bio: profile.bio || "",
            location: profile.location || "",
            college_or_company: profile.college_or_company || "",
            skills: (profile.skills || []).join(", "),
            interests: (profile.interests || []).join(", "),
            github_url: profile.github_url ?? "",
            linkedin_url: profile.linkedin_url ?? "",
            website_url: profile.website_url ?? "",
            avatar_url: profile.avatar_url || "👨‍💻",
          });
        } else {
          setForm((prev) => ({
            ...prev,
            display_name: String(user.user_metadata?.["full_name"] ?? user.email?.split("@")[0] ?? ""),
            avatar_url: "👨‍💻",
          }));
        }
        setLoading(false);
      });
  }, [user]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const completionPercent = calculateCompletion(form);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const complete = Boolean(
      form.display_name.trim() &&
      form.headline.trim() &&
      form.location.trim() &&
      form.skills.trim()
    );

    const { error: saveError } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: form.display_name.trim(),
      username: form.username.trim() || null,
      headline: form.headline.trim(),
      bio: form.bio.trim(),
      location: form.location.trim(),
      college_or_company: form.college_or_company.trim(),
      skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
      interests: form.interests.split(",").map((item) => item.trim()).filter(Boolean),
      github_url: form.github_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      website_url: form.website_url.trim() || null,
      avatar_url: form.avatar_url.trim() || "👨‍💻",
      profile_complete: complete,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
    } else {
      setMessage("Profile and avatar successfully updated! Your changes are now visible across the site.");
      await refreshProfile();
    }
  };

  const field = (label: string, key: keyof typeof form, placeholder: string, required = false) => (
    <label className="block text-sm font-medium">
      {label}
      {required && <span className="text-neon"> *</span>}
      <input
        required={required}
        value={form[key]}
        onChange={(event) => set(key, event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-[1000px] px-6 py-24 text-center text-muted-foreground">
          Loading your builder profile…
        </div>
      </div>
    );
  }

  // Circular progress math
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1000px] px-4 sm:px-6 py-10 sm:py-14">
        {/* Header Hero Card with Avatar & Completion Ring */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/90 via-card to-background p-6 sm:p-8 shadow-glow-soft">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {/* Circular Avatar Preview with Progress Ring */}
              <div className="relative flex size-20 sm:size-24 shrink-0 items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-muted/30"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-neon transition-all duration-700 ease-out"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-surface text-3xl sm:text-4xl shadow-inner">
                  {form.avatar_url || "👨‍💻"}
                </div>
                <span className="absolute -bottom-2 rounded-full border border-neon/40 bg-[#060e08] px-2 py-0.5 text-[10px] font-black tracking-wide text-neon shadow-glow">
                  {completionPercent}%
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-neon/30 bg-neon/10 px-2.5 py-0.5 text-[11px] font-bold text-neon">
                  <Sparkles className="size-3" />
                  BUILDER PROFILE
                </div>
                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">
                  {form.display_name.trim() || user.email?.split("@")[0] || "Vybe Builder"}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground truncate max-w-xs sm:max-w-md">
                  {user.email}
                </p>
                {form.headline && (
                  <p className="mt-1 text-xs sm:text-sm font-medium text-neon/90">
                    {form.headline}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto rounded-2xl border border-border bg-surface/70 p-3 text-xs">
              <div className="px-3 text-center border-r border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Profile Score</p>
                <p className="text-base font-extrabold text-neon">{completionPercent}%</p>
              </div>
              <div className="px-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Badge</p>
                <p className="text-sm font-bold text-foreground">
                  {completionPercent >= 80 ? "⭐ Verified" : "🌱 Rising"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === "profile"
                ? "bg-neon text-primary-foreground shadow-glow-soft"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <User className="size-4" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hosted")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === "hosted"
                ? "bg-neon text-primary-foreground shadow-glow-soft"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <Users className="size-4" />
            <span>Events Hosted by Me ({myHostedEvents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("registrations")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === "registrations"
                ? "bg-neon text-primary-foreground shadow-glow-soft"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <Ticket className="size-4" />
            <span>My Registrations ({myRegistrations.length})</span>
          </button>

          <div className="ml-auto">
            <Button asChild size="sm" className="rounded-full bg-gradient-brand text-primary-foreground text-xs font-bold hover:brightness-105 shadow-glow-soft">
              <Link to="/host">
                <PlusCircle className="size-3.5 mr-1" /> Host New Event
              </Link>
            </Button>
          </div>
        </div>

        {/* TAB 2: EVENTS HOSTED BY ME */}
        {activeTab === "hosted" && (
          <div className="mt-6 space-y-5">
            {myHostedEvents.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Users className="size-10 text-muted-foreground" />
                <h3 className="mt-4 text-base sm:text-lg font-bold">You haven't hosted any events yet</h3>
                <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">
                  Host your college hackathon, coding contest or tech meetup on Vybe Driven and collect registrations directly.
                </p>
                <Button asChild className="mt-5 rounded-full bg-gradient-brand text-primary-foreground font-bold">
                  <Link to="/host">Host an Event Now →</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {myHostedEvents.map((ev) => {
                  const regCount = getRegistrationsBySlug(ev.slug).length;
                  return (
                    <div
                      key={ev.slug}
                      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-neon/40"
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-neon/15 px-2.5 py-0.5 text-xs font-bold text-neon">
                            {ev.type}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-neon font-mono">
                            <Users className="size-3" /> {regCount} Registered
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-bold text-foreground line-clamp-1">{ev.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ev.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                          <span>📅 {ev.date}</span>
                          <span>📍 {ev.location}</span>
                        </div>
                      </div>

                      <div className="border-t border-border bg-surface/50 p-4">
                        <div className="grid grid-cols-2 gap-2">
                          <Button asChild size="sm" className="rounded-xl bg-neon text-primary-foreground text-xs font-bold hover:brightness-105">
                            <Link to="/manage-events" search={{ tab: "registrations", slug: ev.slug }}>
                              View Applicants ({regCount})
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="rounded-xl border-border text-xs font-semibold">
                            <Link to="/host" search={{ edit: ev.slug }}>
                              ✏️ Edit Event
                            </Link>
                          </Button>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-border/60">
                          <Link to="/opportunities/$slug" params={{ slug: ev.slug }} className="text-neon hover:underline inline-flex items-center gap-1 font-semibold">
                            Public Page <ExtLink className="size-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => exportRegistrationsToCSV(ev.slug, ev.title)}
                            disabled={regCount === 0}
                            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                          >
                            <Download className="size-3" /> Download CSV
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY EVENT REGISTRATIONS */}
        {activeTab === "registrations" && (
          <div className="mt-6 space-y-4">
            {myRegistrations.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Ticket className="size-10 text-muted-foreground" />
                <h3 className="mt-4 text-base sm:text-lg font-bold">No event registrations found</h3>
                <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">
                  Explore exciting hackathons and tech competitions on Vybe Driven and register in 1 click.
                </p>
                <Button asChild className="mt-5 rounded-full bg-gradient-brand text-primary-foreground font-bold">
                  <Link to="/discover">Explore Hackathons →</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-neon/40"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="font-mono text-xs font-bold text-neon">{reg.id}</span>
                        <span className="rounded-full bg-neon/15 px-2.5 py-0.5 text-xs font-bold text-neon">
                          {reg.status}
                        </span>
                      </div>
                      <h4 className="mt-3 font-bold text-base text-foreground">
                        {reg.opportunityTitle}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Registered as {reg.fullName} ({reg.teamType === "team" ? `Team ${reg.teamName}` : "Solo"})
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                      <Link
                        to="/opportunities/$slug"
                        params={{ slug: reg.opportunitySlug }}
                        className="text-xs font-semibold text-neon hover:underline"
                      >
                        View Event Page →
                      </Link>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: Form Container */}
        {activeTab === "profile" && (
        <form onSubmit={save} className="mt-6 space-y-8">
          {/* 1. Emoji / Avatar Selector Section */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Choose Your Builder Avatar Emoji</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pick an avatar that represents your builder identity. It will appear on your profile card, navbar, and registrations.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-muted-foreground">Selected:</span>
                <span className="grid size-9 place-items-center rounded-xl border border-neon bg-neon/15 text-xl shadow-glow-soft">
                  {form.avatar_url || "👨‍💻"}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {BUILDER_EMOJIS.map((item) => {
                const isSelected = form.avatar_url === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => set("avatar_url", item.emoji)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                      isSelected
                        ? "border-neon bg-neon/15 shadow-glow scale-105"
                        : "border-border bg-surface/50 hover:border-border hover:bg-surface hover:scale-102"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl transition-transform group-hover:scale-115">
                      {item.emoji}
                    </span>
                    <span className="mt-1 text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/60 bg-surface/40 p-3 text-xs text-muted-foreground">
              <span>Or type any custom emoji:</span>
              <input
                type="text"
                maxLength={4}
                value={form.avatar_url}
                onChange={(e) => set("avatar_url", e.target.value)}
                placeholder="e.g. 💻 or 🔥"
                className="h-8 w-24 rounded-lg border border-input bg-background px-2 text-center text-base outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </section>

          {/* 2. Essentials */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Essentials</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              These details are shared with team members, hackathon organizers, and mentors.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {field("Display Name", "display_name", "e.g. Vaibhav Dubey", true)}
              {field("Username / Handle", "username", "e.g. vaibhav-builder")}
              {field("Headline", "headline", "e.g. AI engineer & product builder", true)}
              {field("Location", "location", "e.g. Mumbai, India", true)}
              {field("College or Company", "college_or_company", "e.g. CRCE / MPSTME / Startup")}
              {field("Core Skills (comma separated)", "skills", "e.g. React, Python, Fastify, AI", true)}
            </div>

            <label className="mt-5 block text-sm font-medium">
              Builder Bio
              <textarea
                value={form.bio}
                onChange={(event) => set("bio", event.target.value)}
                placeholder="What projects or challenges excite you? Describe your tech stack and interests."
                className="mt-2 min-h-28 w-full resize-y rounded-xl border border-input bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <div className="mt-5">
              {field("Interests / Domains", "interests", "e.g. Cybersecurity, AI in FoodTech, Robotics, Smart Homes")}
            </div>
          </section>

          {/* 3. Links */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Links & Socials</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Connect your GitHub, LinkedIn, and personal portfolio to stand out.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {field("GitHub Profile", "github_url", "https://github.com/...")}
              {field("LinkedIn Profile", "linkedin_url", "https://linkedin.com/in/...")}
              {field("Portfolio / Website", "website_url", "https://...")}
            </div>
          </section>

          {error && (
            <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 p-4 text-sm text-foreground">
              <CheckCircle2 className="size-5 text-neon shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="h-12 rounded-xl bg-gradient-brand px-8 text-sm font-bold text-primary-foreground shadow-glow-soft hover:brightness-105"
            >
              {saving ? "Saving Changes…" : "Save Builder Profile"}
            </Button>
          </div>
        </form>
        )}
      </main>
      <Footer />
    </div>
  );
}