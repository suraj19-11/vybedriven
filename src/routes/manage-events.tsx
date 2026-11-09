import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Calendar,
  Trophy,
  Download,
  ExternalLink,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  Eye,
  Trash2,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  Ticket,
} from "lucide-react";
import { Navbar, Footer } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TeamManagementModal } from "@/components/TeamManagementModal";
import { useAuth } from "@/lib/auth";
import {
  useHostedEvents,
  getStoredRegistrations,
  getRegistrationsBySlug,
  exportRegistrationsToCSV,
  updateRegistrationStatus,
  updateHostedOpportunity,
  deleteHostedOpportunity,
  getUserRegistrations,
  isEventOrganizer,
  mergeRemoteRegistrations,
  EVENT_CHANGE_SIGNAL,
  type EventRegistration,
  type HostedEvent,
} from "@/data/events-store";
import { toast } from "sonner";

type ManageSearch = {
  tab?: "events" | "registrations" | "my-registrations";
  slug?: string;
};

export const Route = createFileRoute("/manage-events")({
  validateSearch: (search: Record<string, unknown>): ManageSearch => ({
    tab: search["tab"] === "registrations"
      ? "registrations"
      : search["tab"] === "my-registrations"
      ? "my-registrations"
      : "events",
    slug: typeof search["slug"] === "string" ? search["slug"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Organizer Dashboard & Registrations — Vybe Driven" },
      { name: "description", content: "Manage your hosted hackathons and attendee registrations." },
    ],
  }),
  component: ManageEventsPage,
});

function ManageEventsPage() {
  const { user, loading } = useAuth();
  const search = Route.useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  // Enforce Login
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Please sign in to access your organizer dashboard.");
      navigate({
        to: "/auth",
        search: { mode: "signin", next: location.href },
        replace: true,
      });
    }
  }, [user, loading, navigate, location.href]);

  const [activeTab, setActiveTab] = useState<"events" | "registrations" | "my-registrations">(
    search.tab || "events"
  );
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>(search.slug || "");
  const [applicantQuery, setApplicantQuery] = useState("");
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>("All");
  const [syncTick, setSyncTick] = useState(0);
  const [inspectingApplicant, setInspectingApplicant] = useState<EventRegistration | null>(null);
  const [managingTeamReg, setManagingTeamReg] = useState<EventRegistration | null>(null);

  // Sync Supabase registrations on mount and listen to store changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onSync = () => setSyncTick((t) => t + 1);
    window.addEventListener(EVENT_CHANGE_SIGNAL, onSync);
    window.addEventListener("storage", onSync);

    let active = true;
    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        supabase
          .from("registrations" as any)
          .select("*")
          .then(({ data, error }) => {
            if (!active || error || !data || !Array.isArray(data)) return;
            mergeRemoteRegistrations(data);
            setSyncTick((t) => t + 1);
          })
          .catch(() => {});
      })
      .catch(() => {});

    return () => {
      active = false;
      window.removeEventListener(EVENT_CHANGE_SIGNAL, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

  // Strictly get only the events hosted by this authenticated user
  const myEvents = useHostedEvents(user?.id, user?.email);

  // Selected event for applicants view (must be owned by the current organizer)
  const currentEvent = useMemo(() => {
    if (!myEvents.length) return null;
    if (selectedEventSlug) {
      const matched = myEvents.find((e) => e.slug === selectedEventSlug);
      if (matched) return matched;
    }
    return myEvents[0];
  }, [myEvents, selectedEventSlug]);

  // Registrations strictly for this organizer's selected event
  const eventRegistrations = useMemo(() => {
    if (!currentEvent || !isEventOrganizer(currentEvent, user)) return [];
    return getRegistrationsBySlug(currentEvent.slug);
  }, [currentEvent, user, syncTick]);

  // Registrations user personally made as a builder
  const myRegistrations = useMemo(() => {
    return getUserRegistrations(user?.id, user?.email);
  }, [user, syncTick]);

  // Overall stats strictly for this organizer
  const totalRegistrations = useMemo(() => {
    return myEvents.reduce((acc, e) => acc + getRegistrationsBySlug(e.slug).length, 0);
  }, [myEvents, syncTick]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return eventRegistrations.filter((r) => {
      const matchesStatus =
        applicantStatusFilter === "All" || r.status === applicantStatusFilter;
      const haystack = `${r.fullName} ${r.email} ${r.phone} ${r.collegeOrCompany} ${r.teamName || ""}`.toLowerCase();
      const matchesQuery = !applicantQuery || haystack.includes(applicantQuery.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [eventRegistrations, applicantStatusFilter, applicantQuery]);

  const handleStatusChange = (
    regId: string,
    newStatus: EventRegistration["status"]
  ) => {
    updateRegistrationStatus(regId, newStatus);
    toast.success(`Updated status to ${newStatus}`);
  };

  const handleToggleEventStatus = (event: HostedEvent) => {
    const nextStatus =
      event.status === "Registration open" ? "Event full" : "Registration open";
    updateHostedOpportunity(event.slug, { status: nextStatus }, user);
    toast.success(`Event status changed to "${nextStatus}"`);
  };

  const handleDeleteEvent = (slug: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
      deleteHostedOpportunity(slug, user);
      toast.success("Event deleted.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon">
              <Sparkles className="size-4" /> Vybe Driven Host Hub
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black text-foreground">
              Organizer Dashboard
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Track hosted events, view registered participants, and export rosters in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="rounded-full bg-gradient-brand text-primary-foreground font-bold shadow-glow hover:brightness-105">
              <Link to="/host">
                <PlusCircle className="mr-1.5 size-4" /> Host New Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hosted Events
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">
              {myEvents.length}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Active in discovery</p>
          </div>

          <div className="rounded-2xl border border-neon/40 bg-neon/10 p-4 sm:p-5 shadow-glow-soft">
            <p className="text-xs font-semibold text-neon uppercase tracking-wider">
              Total Applicants
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-neon">
              {totalRegistrations}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Across all your listings</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Selected Event
            </p>
            <p className="mt-2 text-lg sm:text-xl font-bold text-foreground truncate">
              {currentEvent?.title || "No event selected"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {eventRegistrations.length} registrations
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              My Registrations
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-foreground">
              {myRegistrations.length}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Events you joined</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === "events"
                ? "bg-neon text-primary-foreground shadow-glow-soft"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <Calendar className="size-4" />
            <span>My Hosted Events ({myEvents.length})</span>
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
            <Users className="size-4" />
            <span>Applicant Explorer ({eventRegistrations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my-registrations")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === "my-registrations"
                ? "bg-neon text-primary-foreground shadow-glow-soft"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <Ticket className="size-4" />
            <span>My Registrations ({myRegistrations.length})</span>
          </button>
        </div>

        {/* TAB 1: HOSTED EVENTS LIST */}
        {activeTab === "events" && (
          <div className="mt-6">
            {myEvents.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Calendar className="size-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-bold">You haven't hosted any events yet</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Host your first hackathon or tech meetup in under 2 minutes. Publish and start collecting registrations right away!
                </p>
                <Button asChild className="mt-5 rounded-full bg-gradient-brand text-primary-foreground font-bold">
                  <Link to="/host">Host an Event Now →</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {myEvents.map((event) => {
                  const regCount = getRegistrationsBySlug(event.slug).length;
                  return (
                    <article
                      key={event.slug}
                      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-neon/40 hover:shadow-glow-soft"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute left-3 top-3 flex gap-1.5">
                          <span className="rounded-full border border-border bg-black/80 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
                            {event.type}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              event.status === "Registration open"
                                ? "bg-neon text-primary-foreground"
                                : "bg-destructive text-destructive-foreground"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-neon">{event.tag}</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-neon/15 px-2.5 py-0.5 text-xs font-bold text-neon font-mono">
                            <Users className="size-3" /> {regCount} Registered
                          </span>
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-foreground line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                          <span>📅 {event.date}</span>
                          <span>📍 {event.location}</span>
                        </div>

                        {/* Event Action Buttons */}
                        <div className="mt-5 grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedEventSlug(event.slug);
                              setActiveTab("registrations");
                            }}
                            className="rounded-xl bg-neon text-primary-foreground font-bold hover:brightness-105 text-xs"
                          >
                            <Users className="mr-1.5 size-3.5" />
                            View ({regCount})
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportRegistrationsToCSV(event.slug, event.title, user)}
                            disabled={regCount === 0}
                            className="rounded-xl border-border text-xs"
                          >
                            <Download className="mr-1.5 size-3.5" />
                            Export CSV
                          </Button>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-xs">
                          <div className="flex items-center gap-3">
                            <Link
                              to="/opportunities/$slug"
                              params={{ slug: event.slug }}
                              className="inline-flex items-center gap-1 font-semibold text-neon hover:underline"
                            >
                              View Public Page <ExternalLink className="size-3" />
                            </Link>
                            <Link
                              to="/host"
                              search={{ edit: event.slug }}
                              className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-neon transition"
                            >
                              ✏️ Edit Details
                            </Link>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleEventStatus(event)}
                              className="text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              {event.status === "Registration open" ? "Mark Full" : "Reopen"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event.slug, event.title)}
                              className="text-[11px] text-destructive hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICANT EXPLORER & CSV EXPORT */}
        {activeTab === "registrations" && (
          <div className="mt-6 space-y-6">
            {/* Event Selector & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-1 items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Event:
                </span>
                <select
                  value={currentEvent?.slug || ""}
                  onChange={(e) => setSelectedEventSlug(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:text-sm font-semibold text-foreground outline-none focus:border-neon max-w-md truncate"
                >
                  {myEvents.map((ev) => (
                    <option key={ev.slug} value={ev.slug}>
                      {ev.title} ({getRegistrationsBySlug(ev.slug).length} registered)
                    </option>
                  ))}
                </select>
              </div>

              {currentEvent && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => exportRegistrationsToCSV(currentEvent.slug, currentEvent.title, user)}
                    disabled={eventRegistrations.length === 0}
                    className="rounded-full bg-neon text-primary-foreground font-bold shadow-glow-soft hover:brightness-105 text-xs sm:text-sm"
                  >
                    <Download className="mr-2 size-4" /> Download Excel/CSV
                  </Button>
                </div>
              )}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row">
              <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-surface px-4 focus-within:ring-2 focus-within:ring-ring">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={applicantQuery}
                  onChange={(e) => setApplicantQuery(e.target.value)}
                  placeholder="Search applicants by name, email, phone, college or team..."
                  className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>

              <select
                value={applicantStatusFilter}
                onChange={(e) => setApplicantStatusFilter(e.target.value)}
                className="min-h-11 rounded-xl border border-border bg-surface px-4 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="All">All Statuses</option>
                <option value="Registered">Registered</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Attended">Attended</option>
              </select>
            </div>

            {/* Applicant Table */}
            {filteredApplicants.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Users className="size-8 text-muted-foreground" />
                <h4 className="mt-3 text-base font-semibold">No participants found</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {eventRegistrations.length === 0
                    ? "Registrations for this event have not started or no one has applied yet."
                    : "No participants matched your current search filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-border bg-surface text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Participant</th>
                        <th className="px-4 py-3">Contact & Links</th>
                        <th className="px-4 py-3">College / Company</th>
                        <th className="px-4 py-3">Team Details</th>
                        <th className="px-4 py-3">Applied At</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredApplicants.map((applicant) => (
                        <tr key={applicant.id} className="transition hover:bg-surface/50">
                          {/* Name */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-foreground">
                              {applicant.fullName}
                            </div>
                            <span className="font-mono text-[10px] text-neon">
                              {applicant.id}
                            </span>
                            {applicant.projectIdea && (
                              <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1 italic max-w-xs">
                                "{applicant.projectIdea}"
                              </p>
                            )}
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                              <Mail className="size-3 text-muted-foreground" />
                              <a href={`mailto:${applicant.email}`} className="hover:text-neon">
                                {applicant.email}
                              </a>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="size-3 text-muted-foreground" />
                              <a
                                href={`https://wa.me/${applicant.phone.replace(/[^\d]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-neon text-[11px] flex items-center gap-1"
                              >
                                {applicant.phone}
                                <MessageCircle className="size-2.5 text-green-500" />
                              </a>
                            </div>
                            <div className="mt-1.5 flex gap-2 text-[11px]">
                              {applicant.githubUrl && (
                                <a
                                  href={applicant.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-neon hover:underline"
                                >
                                  GitHub
                                </a>
                              )}
                              {applicant.linkedinUrl && (
                                <a
                                  href={applicant.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-neon hover:underline"
                                >
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </td>

                          {/* College */}
                          <td className="px-4 py-3.5 text-xs text-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="size-3 text-muted-foreground shrink-0" />
                              <span className="font-medium">{applicant.collegeOrCompany}</span>
                              {applicant.gender && (
                                <span className="text-[10px] text-muted-foreground">({applicant.gender})</span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {applicant.userType && (
                                <span className="rounded bg-neon/10 px-1.5 py-0.5 text-[10px] font-semibold text-neon">
                                  {applicant.userType}
                                </span>
                              )}
                              {applicant.location && (
                                <span className="text-[11px] text-muted-foreground">
                                  📍 {applicant.location}
                                </span>
                              )}
                            </div>
                            {applicant.experienceLevel && !applicant.userType && (
                              <span className="mt-1 inline-block rounded bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {applicant.experienceLevel}
                              </span>
                            )}
                          </td>

                          {/* Team Details */}
                          <td className="px-4 py-3.5 text-xs">
                            {applicant.teamType === "team" ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-neon">
                                    {applicant.teamName || "Squad"}
                                  </span>
                                  <span className="rounded-full bg-surface-2 border border-border px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                                    {applicant.teammates && applicant.teammates.length > 0
                                      ? `${applicant.teammates.length + 1} Members`
                                      : applicant.teamSize || "Team"}
                                  </span>
                                  {applicant.lookingForTeammates && (
                                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-neon">
                                      Seeking teammates
                                    </span>
                                  )}
                                </div>

                                {/* Quick Member Status Chips */}
                                <div className="flex flex-wrap gap-1">
                                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                                    <span className="size-1.5 rounded-full bg-emerald-400" />
                                    {applicant.fullName.split(" ")[0]} (Leader)
                                  </span>
                                  {applicant.teammates &&
                                    applicant.teammates.map((m, idx) => {
                                      const isVer = m.status === "verified";
                                      return (
                                        <span
                                          key={idx}
                                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                                            isVer
                                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                              : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                          }`}
                                        >
                                          <span
                                            className={`size-1.5 rounded-full ${
                                              isVer ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                                            }`}
                                          />
                                          {m.name.split(" ")[0] || `Member ${idx + 2}`} {isVer ? "✓" : "⏳"}
                                        </span>
                                      );
                                    })}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setInspectingApplicant(applicant)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-neon hover:underline cursor-pointer pt-0.5"
                                >
                                  <Users className="size-3" /> View Team Roster Details →
                                </button>
                              </div>
                            ) : (
                              <div>
                                <span className="text-muted-foreground">Solo Entry</span>
                                {applicant.lookingForTeammates && (
                                  <span className="ml-1 inline-block rounded bg-primary/20 px-1 py-0.5 text-[9px] font-bold text-neon">
                                    Looking for teammates
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Applied date */}
                          <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(applicant.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          {/* Status Dropdown */}
                          <td className="px-4 py-3.5">
                            <select
                              value={applicant.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  applicant.id,
                                  e.target.value as EventRegistration["status"]
                                )
                              }
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold outline-none border transition ${
                                applicant.status === "Confirmed"
                                  ? "border-green-500/50 bg-green-500/10 text-green-400"
                                  : applicant.status === "Shortlisted"
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                                  : "border-neon/50 bg-neon/10 text-neon"
                              }`}
                            >
                              <option value="Registered">Registered</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Attended">Attended</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY REGISTRATIONS (AS A PARTICIPANT) */}
        {activeTab === "my-registrations" && (
          <div className="mt-6 space-y-4">
            {myRegistrations.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Ticket className="size-8 text-muted-foreground" />
                <h4 className="mt-3 text-base font-semibold">No registrations yet</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Explore exciting hackathons and tech competitions and join them in one click.
                </p>
                <Button asChild className="mt-4 rounded-full bg-gradient-brand text-primary-foreground font-bold">
                  <Link to="/discover">Explore Events & Hackathons →</Link>
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

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/opportunities/$slug"
                          params={{ slug: reg.opportunitySlug }}
                          className="text-xs font-semibold text-neon hover:underline"
                        >
                          View Event →
                        </Link>
                        {reg.teamType === "team" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setManagingTeamReg(reg)}
                            className="rounded-full text-[11px] font-bold border-neon/50 text-neon hover:bg-neon hover:text-black py-0.5 px-2.5 h-7"
                          >
                            <Users className="size-3 mr-1" /> Manage Team Roster
                          </Button>
                        )}
                      </div>
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

        {/* Organizer Team Roster Inspector Dialog */}
        <Dialog open={Boolean(inspectingApplicant)} onOpenChange={(open) => !open && setInspectingApplicant(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-[#070e0a] p-5 sm:p-7 text-foreground shadow-2xl">
            <DialogHeader className="border-b border-border/70 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon">
                <Users className="size-4" /> Organizer Roster Inspector
              </div>
              <DialogTitle className="mt-1 text-xl sm:text-2xl font-black text-foreground">
                Team: {inspectingApplicant?.teamName || "Squad"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Event: {inspectingApplicant?.opportunityTitle} · Registration ID: {inspectingApplicant?.id}
              </DialogDescription>
            </DialogHeader>

            {inspectingApplicant && (
              <div className="mt-4 space-y-4">
                {/* Team Leader */}
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                          {inspectingApplicant.fullName}
                        </h4>
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                          Team Leader
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>📧 Email: <a href={`mailto:${inspectingApplicant.email}`} className="text-foreground hover:text-neon">{inspectingApplicant.email}</a></p>
                        <p>📱 Phone: <a href={`https://wa.me/${inspectingApplicant.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="text-foreground hover:text-neon">{inspectingApplicant.phone}</a></p>
                        <p>🏛️ College/Org: {inspectingApplicant.collegeOrCompany}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="size-3" /> Verified
                    </span>
                  </div>
                </div>

                {/* Teammates List */}
                {inspectingApplicant.teammates && inspectingApplicant.teammates.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Invited Teammates ({inspectingApplicant.teammates.length})
                    </p>
                    {inspectingApplicant.teammates.map((m, idx) => {
                      const isVer = m.status === "verified";
                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border p-4 ${
                            isVer
                              ? "border-emerald-500/40 bg-emerald-950/20"
                              : "border-amber-500/40 bg-amber-950/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-foreground">{m.name}</h4>
                                <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                                  Member #{idx + 2}
                                </span>
                              </div>
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>📧 Email: <a href={`mailto:${m.email}`} className="text-foreground hover:text-neon">{m.email}</a></p>
                                {m.phone && (
                                  <p>📱 Phone: <a href={`https://wa.me/${m.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="text-foreground hover:text-neon">{m.phone}</a></p>
                                )}
                                {m.collegeOrCompany && <p>🏛️ College: {m.collegeOrCompany}</p>}
                                {m.department && <p>🎓 Department: {m.department} ({m.graduationYear || "Year"})</p>}
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                                isVer
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                  : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {isVer ? "🟢 Confirmed & Joined" : "⏳ Confirmation Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No additional teammates invited yet.
                  </p>
                )}

                <div className="flex justify-end pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInspectingApplicant(null)}
                    className="rounded-full text-xs"
                  >
                    Close Roster
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Builder Team Management Modal */}
        <TeamManagementModal
          registration={managingTeamReg}
          open={Boolean(managingTeamReg)}
          onOpenChange={(open) => !open && setManagingTeamReg(null)}
          onUpdated={() => {
            // Signal store update
            setManagingTeamReg(null);
          }}
        />
      </main>

      <Footer />
    </div>
  );
}

