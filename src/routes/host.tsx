import { createFileRoute, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import {
  Sparkles,
  Rocket,
  Calendar,
  MapPin,
  Trophy,
  Users,
  WalletCards,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  LogIn,
  Save,
} from "lucide-react";
import { Navbar, Footer } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  createHostedOpportunity,
  updateHostedOpportunity,
  findOpportunity,
  PRESET_EVENT_BANNERS,
  type HostedEvent,
} from "@/data/events-store";
import type { OpportunityType } from "@/data/opportunities";
import { toast } from "sonner";

type HostSearch = {
  edit?: string;
};

export const Route = createFileRoute("/host")({
  validateSearch: (search: Record<string, unknown>): HostSearch => ({
    edit: typeof search["edit"] === "string" ? search["edit"] : undefined,
  }),
  head: ({ search }) => ({
    meta: [
      { title: search.edit ? "Edit Event — Vybe Driven" : "Host an Event — Vybe Driven" },
      { name: "description", content: "Create and publish your hackathon, competition or meetup on Vybe Driven." },
    ],
  }),
  component: HostEventPage,
});

const EVENT_TYPES: OpportunityType[] = [
  "Hackathon",
  "Competition",
  "Meetup",
  "Conference",
  "Networking",
];

const PERK_OPTIONS = [
  { id: "cash", icon: "gift", emoji: "💰", title: "Cash Prizes", desc: "Monetary rewards for winning teams" },
  { id: "cert", icon: "award", emoji: "📜", title: "Official Certificates", desc: "Verified digital certificates for participants" },
  { id: "swag", icon: "gift", emoji: "🎁", title: "Goodies & Swag", desc: "T-shirts, stickers, and builder kits" },
  { id: "mentor", icon: "brain", emoji: "🧠", title: "Industry Mentorship", desc: "1-on-1 guidance from top founders and engineers" },
  { id: "intern", icon: "rocket", emoji: "💼", title: "Internship Opportunities", desc: "Direct interview pipelines for high performers" },
  { id: "food", icon: "coffee", emoji: "☕", title: "Free Meals & Beverages", desc: "Refreshments throughout the offline event" },
];

function HostEventPage() {
  const { user, profile, loading } = useAuth();
  const search = Route.useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditing = Boolean(search.edit);
  const editSlug = search.edit || "";

  // Compulsory Login Check: If not logged in, redirect to auth with return URL
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Please sign in or create an account to host an event.");
      navigate({
        to: "/auth",
        search: { mode: "signin", next: location.href },
        replace: true,
      });
    }
  }, [user, loading, navigate, location.href]);

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<OpportunityType>("Hackathon");
  const [tag, setTag] = useState("National · AI & Web3");
  const [description, setDescription] = useState("");
  const [overview, setOverview] = useState("");
  const [format, setFormat] = useState<"Online" | "In person" | "Hybrid">("In person");
  const [locationValue, setLocationValue] = useState("");
  const [date, setDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("+91 ");
  const [teamSize, setTeamSize] = useState("1–4 Members");
  const [eligibility, setEligibility] = useState("Open to all college students & builders");
  const [fee, setFee] = useState("Free");
  const [prize, setPrize] = useState("₹50,000+");
  const [selectedPerks, setSelectedPerks] = useState<string[]>(["cash", "cert", "swag"]);
  const [selectedBannerPreset, setSelectedBannerPreset] = useState(PRESET_EVENT_BANNERS[0].id);
  const [customBannerUrl, setCustomBannerUrl] = useState("");
  const [groupUrl, setGroupUrl] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [eventStatus, setEventStatus] = useState<"Registration open" | "Event full" | "Sold out">("Registration open");
  const [publishing, setPublishing] = useState(false);
  const [loadedExisting, setLoadedExisting] = useState(false);

  // Pre-fill existing event data if editing
  useEffect(() => {
    if (isEditing && editSlug && !loadedExisting) {
      const existing = findOpportunity(editSlug);
      if (existing) {
        setTitle(existing.title || "");
        setType(existing.type || "Hackathon");
        setTag(existing.tag || "");
        setDescription(existing.description || "");
        setOverview(existing.overview || "");
        setFormat(existing.format || "In person");
        setLocationValue(existing.location || "");
        setDate(existing.date || "");
        setRegistrationDeadline(existing.registrationDeadline || "");
        setOrganizer(existing.organizer || "");
        setOrganizerEmail((existing as any).organizerEmail || user?.email || "");
        setOrganizerPhone((existing as any).organizerPhone || "+91 ");
        setTeamSize(existing.teamSize || "1–4 Members");
        setEligibility(existing.eligibility || "");
        setFee(existing.fee || "Free");
        setPrize(existing.prize || "");
        setGroupUrl(existing.groupUrl || "");
        setRegistrationUrl(existing.registrationUrl || "");
        if (existing.status === "Registration open" || existing.status === "Event full" || existing.status === "Sold out") {
          setEventStatus(existing.status);
        }
        if (existing.image && !PRESET_EVENT_BANNERS.some((p) => p.image === existing.image)) {
          setCustomBannerUrl(existing.image);
        }
        setLoadedExisting(true);
      }
    } else if (!isEditing && user && !loadedExisting) {
      // Default prefill from logged in user profile
      setOrganizer(profile?.college_or_company || profile?.display_name || user.user_metadata?.["full_name"] || "Organizer");
      setOrganizerEmail(user.email || "");
      setLoadedExisting(true);
    }
  }, [isEditing, editSlug, loadedExisting, user, profile]);

  const activeBannerImage =
    customBannerUrl.trim() ||
    PRESET_EVENT_BANNERS.find((p) => p.id === selectedBannerPreset)?.image ||
    PRESET_EVENT_BANNERS[0].image;

  const togglePerk = (id: string) => {
    setSelectedPerks((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to host an event.");
      navigate({ to: "/auth", search: { mode: "signin", next: location.href } });
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter an event title.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a short event pitch/summary.");
      return;
    }
    if (!locationValue.trim()) {
      toast.error("Please specify a location or online platform.");
      return;
    }
    if (!date.trim()) {
      toast.error("Please enter the event dates.");
      return;
    }
    if (!registrationDeadline.trim()) {
      toast.error("Please enter the registration deadline.");
      return;
    }

    setPublishing(true);

    try {
      const perks = selectedPerks.map((id) => {
        const option = PERK_OPTIONS.find((p) => p.id === id)!;
        return {
          icon: option.icon,
          emoji: option.emoji,
          title: option.title,
          description: option.desc,
        };
      });

      const contacts = organizerPhone.trim() && organizerPhone.trim() !== "+91"
        ? [{ name: organizer || user.user_metadata?.["full_name"] || "Host", phone: organizerPhone.trim() }]
        : undefined;

      if (isEditing && editSlug) {
        // Update existing event
        const updated = updateHostedOpportunity(
          editSlug,
          {
            title: title.trim(),
            type,
            tag: tag.trim() || `${type} · Innovation`,
            description: description.trim(),
            overview: overview.trim() || description.trim(),
            date: date.trim(),
            location: locationValue.trim(),
            format,
            prize: prize.trim() || undefined,
            perks,
            image: activeBannerImage,
            organizer: organizer.trim() || "Independent Host",
            organizerEmail: user.email || organizerEmail.trim(),
            organizerPhone: organizerPhone.trim() || undefined,
            registrationDeadline: registrationDeadline.trim(),
            eligibility: eligibility.trim(),
            teamSize: teamSize.trim(),
            fee: fee.trim(),
            status: eventStatus,
            registrationUrl: registrationUrl.trim() || undefined,
            groupUrl: groupUrl.trim() || undefined,
            contacts,
          },
          user.id
        );

        toast.success("✅ Event changes saved successfully!");
        await navigate({ to: "/opportunities/$slug", params: { slug: editSlug } });
      } else {
        // Create new event
        const newEvent = createHostedOpportunity({
          title: title.trim(),
          type,
          tag: tag.trim() || `${type} · Innovation`,
          description: description.trim(),
          overview: overview.trim() || description.trim(),
          date: date.trim(),
          location: locationValue.trim(),
          format,
          prize: prize.trim() || undefined,
          perks,
          image: activeBannerImage,
          imageFit: "cover",
          organizer: organizer.trim() || profile?.display_name || "Independent Host",
          organizerId: user.id,
          organizerEmail: user.email || organizerEmail.trim(),
          organizerPhone: organizerPhone.trim() || undefined,
          registrationDeadline: registrationDeadline.trim(),
          eligibility: eligibility.trim(),
          teamSize: teamSize.trim(),
          fee: fee.trim(),
          status: "Registration open",
          registrationType: "direct",
          registrationUrl: registrationUrl.trim() || undefined,
          registrationLabel: "Register now",
          groupUrl: groupUrl.trim() || undefined,
          groupLabel: "Join Official WhatsApp Group",
          contacts,
        });

        toast.success("🚀 Event successfully published! Your opportunity is now live.");
        await navigate({ to: "/opportunities/$slug", params: { slug: newEvent.slug } });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save event. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking authentication…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1120px] px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon">
              <Sparkles className="size-4" /> Organizer Studio · Signed in as {profile?.display_name || user.email}
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black text-foreground">
              {isEditing ? "Edit Your Event" : "Host an Event"}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {isEditing
                ? "Update event schedule, registration deadline, rewards, and venue."
                : "Create, customize, and accept real-time registrations for your hackathon or meetup."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-full text-xs">
              <Link to="/manage-events">View My Hosted Events</Link>
            </Button>
          </div>
        </div>

        {/* Two-Column Form & Live Preview */}
        <form onSubmit={handlePublish} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Form Fields */}
          <div className="space-y-8">
            {/* 1. Basics */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="grid size-6 place-items-center rounded-full bg-neon text-primary-foreground text-xs font-black">
                  1
                </span>
                Event Fundamentals
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Event Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mumbai AI Hackathon 2026"
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Category / Type <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as OpportunityType)}
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="e.g. 36H Hackathon · AI & Web3"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    />
                  </div>
                </div>

                {/* Status Toggle if Editing */}
                {isEditing && (
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Registration Status
                    </label>
                    <select
                      value={eventStatus}
                      onChange={(e) => setEventStatus(e.target.value as any)}
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon font-semibold text-neon"
                    >
                      <option value="Registration open">Registration open</option>
                      <option value="Event full">Event full (Waitlist)</option>
                      <option value="Sold out">Sold out (Closed)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Short Pitch (1-2 sentences for discovery cards){" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Join 500+ builders in a 36-hour sprint to build next-gen AI applications with ₹1 Lakh in bounties."
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Full Description & Problem Statements (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    placeholder="Provide in-depth rules, judging criteria, challenge tracks, and schedule details for participants."
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-neon"
                  />
                </div>
              </div>
            </div>

            {/* 2. Format & Dates */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="grid size-6 place-items-center rounded-full bg-neon text-primary-foreground text-xs font-black">
                  2
                </span>
                Format, Location & Dates
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Event Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) =>
                        setFormat(e.target.value as "Online" | "In person" | "Hybrid")
                      }
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    >
                      <option value="In person">In person</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Location / Venue / Online Platform <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={locationValue}
                      onChange={(e) => setLocationValue(e.target.value)}
                      placeholder="e.g. Fr. CRCE Bandra, Mumbai or Google Meet"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Event Dates <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. Dec 12–13, 2026 · 9 AM"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Registration Deadline <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationDeadline}
                      onChange={(e) => setRegistrationDeadline(e.target.value)}
                      placeholder="e.g. Dec 8, 2026"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Team, Fee & Rewards */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="grid size-6 place-items-center rounded-full bg-neon text-primary-foreground text-xs font-black">
                  3
                </span>
                Participation, Fees & Rewards
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Team Size
                    </label>
                    <select
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    >
                      <option>1–4 Members</option>
                      <option>Solo Only</option>
                      <option>2–4 Members</option>
                      <option>Up to 5 Members</option>
                      <option>Individual or Team</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Entry Fee
                    </label>
                    <input
                      type="text"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="e.g. Free or ₹100/team"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Total Prize Pool
                    </label>
                    <input
                      type="text"
                      value={prize}
                      onChange={(e) => setPrize(e.target.value)}
                      placeholder="e.g. ₹50,000+ or Swags"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    placeholder="e.g. Open to all engineering students and developers"
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                  />
                </div>

                {/* Perks Checklist */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">
                    Included Perks & Rewards
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {PERK_OPTIONS.map((perk) => {
                      const checked = selectedPerks.includes(perk.id);
                      return (
                        <div
                          key={perk.id}
                          onClick={() => togglePerk(perk.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                            checked
                              ? "border-neon bg-neon/10"
                              : "border-border bg-surface hover:border-border/80"
                          }`}
                        >
                          <span className="text-lg select-none">{perk.emoji}</span>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-foreground">{perk.title}</p>
                            <p className="text-[11px] text-muted-foreground">{perk.desc}</p>
                          </div>
                          <div
                            className={`size-4 rounded border flex items-center justify-center ${
                              checked ? "border-neon bg-neon text-primary-foreground" : "border-border"
                            }`}
                          >
                            {checked && <CheckCircle2 className="size-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Poster / Banner */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="grid size-6 place-items-center rounded-full bg-neon text-primary-foreground text-xs font-black">
                  4
                </span>
                Event Poster / Banner
              </div>

              <div className="mt-5 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Choose from our curated high-resolution tech posters or provide your own image link:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_EVENT_BANNERS.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setSelectedBannerPreset(preset.id);
                        setCustomBannerUrl("");
                      }}
                      className={`group relative aspect-[16/10] overflow-hidden rounded-xl border-2 transition text-left ${
                        selectedBannerPreset === preset.id && !customBannerUrl
                          ? "border-neon ring-2 ring-neon/40"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <img
                        src={preset.image}
                        alt={preset.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] font-bold text-white leading-tight">
                          {preset.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Or Enter Custom Image URL (Unsplash, Cloudinary, etc.)
                  </label>
                  <input
                    type="url"
                    value={customBannerUrl}
                    onChange={(e) => setCustomBannerUrl(e.target.value)}
                    placeholder="https://example.com/poster.jpg"
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                  />
                </div>
              </div>
            </div>

            {/* 5. Contact & Community */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="grid size-6 place-items-center rounded-full bg-neon text-primary-foreground text-xs font-black">
                  5
                </span>
                Organizer & Community Connect
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Organizer / College / Company Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={organizer}
                      onChange={(e) => setOrganizer(e.target.value)}
                      placeholder="e.g. CSI CRCE or Tech Club"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Organizer Contact Email
                    </label>
                    <input
                      type="email"
                      value={organizerEmail}
                      onChange={(e) => setOrganizerEmail(e.target.value)}
                      placeholder="organizer@college.edu"
                      className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Organizer Phone (for participant queries)
                  </label>
                  <input
                    type="tel"
                    value={organizerPhone}
                    onChange={(e) => setOrganizerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    WhatsApp Group or Discord Invite Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={groupUrl}
                    onChange={(e) => setGroupUrl(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Registered participants will get direct one-click access to join your group!
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Optional External Form / Website Link (if also accepting registrations elsewhere)
                  </label>
                  <input
                    type="url"
                    value={registrationUrl}
                    onChange={(e) => setRegistrationUrl(e.target.value)}
                    placeholder="https://unstop.com/... or Google Form"
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={publishing}
                className="w-full rounded-full bg-gradient-brand text-primary-foreground font-black py-4 text-base shadow-glow hover:brightness-105"
              >
                {publishing ? (
                  "Saving Event..."
                ) : isEditing ? (
                  <>
                    <Save className="mr-2 size-5" />
                    Save Changes to Event
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 size-5" />
                    Publish Event on Vybe Driven
                  </>
                )}
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {isEditing
                  ? "Changes will immediately update the live public event page."
                  : "Your event will be live immediately across Hackathons, Events, and Search."}
              </p>
            </div>
          </div>

          {/* Right Column: Live Sticky Preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-neon mb-3 flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Live Discovery Card Preview
              </p>

              {/* Card Replica */}
              <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={activeBannerImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <span className="rounded-full border border-border bg-popover/90 px-2.5 py-0.5 text-[11px] font-semibold text-popover-foreground backdrop-blur">
                      {type}
                    </span>
                    <span className="rounded-full bg-neon px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      {isEditing ? eventStatus : "Registration open"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-bold text-neon uppercase">
                    {tag || "OPPORTUNITY"}
                  </p>
                  <h3 className="mt-1 font-bold text-foreground text-base line-clamp-1">
                    {title || "Your Event Title"}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {description || "A compelling short summary of what builders will achieve."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-neon" />
                      {date || "Event Date"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-neon" />
                      {locationValue || "Location"}
                    </span>
                    {prize && (
                      <span className="flex items-center gap-1">
                        <Trophy className="size-3 text-neon" />
                        {prize}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </div>

            <div className="rounded-2xl border border-border bg-surface/50 p-4 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="size-4 text-neon" /> What happens after publishing?
              </div>
              <p>
                1. Your event gets its own dedicated, shareable URL: <br />
                <code className="text-neon font-mono">/opportunities/your-event-slug</code>
              </p>
              <p>
                2. Only authenticated builders can apply. Their verified profiles and team rosters link directly to your dashboard.
              </p>
              <p>
                3. You can manage applicants, edit details anytime, and export spreadsheet data in 1 click.
              </p>
            </div>
          </aside>
        </form>
      </main>

      <Footer />
    </div>
  );
}
