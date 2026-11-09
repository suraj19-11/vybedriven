import { opportunities, type Opportunity, type OpportunityType, type OpportunityPerk } from "./opportunities";
import evCool from "@/assets/ev-cool.jpg";
import evCyber from "@/assets/ev-cyber.jpg";
import vecnaVersePoster from "@/assets/events/vecna-verse-2026.jpeg.asset.json";
import iplPoster from "@/assets/events/ipl-innovation-pitch-league-2026.jpeg.asset.json";
import aiAtWorkPoster from "@/assets/events/ai-at-work.png.asset.json";
import durableDevOpsPoster from "@/assets/events/durable-devops-tech-meetup.png.asset.json";
import elevatePoster from "@/assets/events/elevate-1-0-2026.png.asset.json";
import { useEffect, useState } from "react";

export const PRESET_EVENT_BANNERS = [
  { id: "goa", title: "Goa Buildathon '27", image: "/events/goa-buildathon-2027.jpg" },
  { id: "luminar", title: "Luminar Creators Award Gala", image: "/events/luminar-creators-award-2027.jpg" },
  { id: "cyber", title: "Cyber & Security Matrix", image: evCyber },
  { id: "code", title: "Code & Hack Sprint", image: evCool },
  { id: "national", title: "National Arena / Web3", image: vecnaVersePoster.url },
  { id: "pitch", title: "Pitch League & Startup", image: iplPoster.url },
  { id: "ai", title: "AI & Future of Work", image: aiAtWorkPoster.url },
  { id: "devops", title: "DevOps & Cloud Tech", image: durableDevOpsPoster.url },
  { id: "elevate", title: "24h Hackathon Arena", image: elevatePoster.url },
];

export type HostedEvent = Opportunity & {
  organizerId: string;
  organizerEmail?: string;
  organizerPhone?: string;
  isHosted: true;
  createdAt: string;
  updatedAt?: string;
  registrationType: "direct" | "external" | "both";
};

export type TeammateDetail = {
  name: string;
  email: string;
  phone?: string;
};

export type EventRegistration = {
  id: string;
  opportunitySlug: string;
  opportunityTitle: string;
  userId?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  gender?: string;
  location?: string;
  collegeOrCompany: string;
  userType?: string;
  teamType: "solo" | "team";
  teamName?: string;
  teamSize?: string;
  teamMembers?: string;
  teammates?: TeammateDetail[];
  lookingForTeammates?: boolean;
  termsAccepted?: boolean;
  experienceLevel?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  projectIdea?: string;
  status: "Registered" | "Shortlisted" | "Confirmed" | "Attended" | "Cancelled";
  createdAt: string;
};

const STORAGE_HOSTED_EVENTS = "hd_hosted_events";
const STORAGE_REGISTRATIONS = "hd_event_registrations";
export const EVENT_CHANGE_SIGNAL = "hd_events_store_updated";

function notifyStoreChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_CHANGE_SIGNAL));
}

// Initial registrations (empty by default so no dummy/fake attendees ever appear)
const SEED_REGISTRATIONS: EventRegistration[] = [];

// Helper to safely get stored hosted events
export function getStoredHostedEvents(): HostedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_HOSTED_EVENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HostedEvent[];
    // Filter out test events
    const cleaned = parsed.filter(
      (e) => !e.slug.includes("satyam") && !e.title?.toLowerCase().includes("satyam")
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_HOSTED_EVENTS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (error) {
    console.error("Failed to parse hosted events:", error);
    return [];
  }
}

// Helper to safely get stored registrations
export function getStoredRegistrations(): EventRegistration[] {
  if (typeof window === "undefined") return SEED_REGISTRATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_REGISTRATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(SEED_REGISTRATIONS));
      return SEED_REGISTRATIONS;
    }
    return JSON.parse(raw) as EventRegistration[];
  } catch (error) {
    console.error("Failed to parse registrations:", error);
    return SEED_REGISTRATIONS;
  }
}

// Generate URL friendly slug
export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "event-" + Math.random().toString(36).substring(2, 8);
}

// Return all opportunities (Built-in + Hosted by users)
export function getAllMergedOpportunities(): Opportunity[] {
  const hosted = getStoredHostedEvents();
  // User hosted events appear at the top so new hosts immediately see their listing
  return [...hosted, ...opportunities];
}

// Get single opportunity by slug
export function findOpportunity(slug: string): Opportunity | undefined {
  const hosted = getStoredHostedEvents().find((e) => e.slug === slug);
  if (hosted) return hosted;
  return opportunities.find((e) => e.slug === slug);
}

// Create and publish a new hosted event
export function createHostedOpportunity(input: {
  title: string;
  type: OpportunityType;
  tag: string;
  description: string;
  overview: string;
  date: string;
  location: string;
  format: "Online" | "In person" | "Hybrid";
  prize?: string;
  perks?: OpportunityPerk[];
  image: string;
  imageFit?: "cover" | "contain";
  organizer: string;
  organizerId: string;
  organizerEmail?: string;
  organizerPhone?: string;
  registrationDeadline: string;
  eligibility: string;
  teamSize: string;
  fee: string;
  status?: Opportunity["status"];
  registrationType?: "direct" | "external" | "both";
  registrationUrl?: string;
  registrationLabel?: "Register now" | "Request to join" | "Join waitlist";
  registrationNote?: string;
  groupUrl?: string;
  groupLabel?: string;
  schedule?: { title: string; date: string; description: string }[];
  contacts?: { name: string; phone: string }[];
}): HostedEvent {
  const existingHosted = getStoredHostedEvents();
  let candidateSlug = slugifyTitle(input.title);
  
  // Ensure unique slug
  let counter = 1;
  while (findOpportunity(candidateSlug)) {
    candidateSlug = `${slugifyTitle(input.title)}-${counter}`;
    counter++;
  }

  const newEvent: HostedEvent = {
    ...input,
    slug: candidateSlug,
    status: input.status || "Registration open",
    registrationType: input.registrationType || "direct",
    isHosted: true,
    createdAt: new Date().toISOString(),
    schedule: input.schedule?.length
      ? input.schedule
      : [
          {
            title: "Registrations Open",
            date: "Open Now",
            description: "Apply and submit your team details on Vybe Driven.",
          },
          {
            title: "Registration Closes",
            date: input.registrationDeadline || "TBA",
            description: "Final team roster freeze and verification.",
          },
          {
            title: "Main Event / Hack Sprint",
            date: input.date,
            description: `Event kicks off ${input.format.toLowerCase()} at ${input.location}.`,
          },
        ],
  };

  const updatedList = [newEvent, ...existingHosted];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_HOSTED_EVENTS, JSON.stringify(updatedList));
    notifyStoreChange();
  }

  return newEvent;
}

const envAdminEmails = (
  typeof import.meta !== "undefined" && import.meta.env?.["VITE_ADMIN_EMAILS"]
    ? String(import.meta.env["VITE_ADMIN_EMAILS"])
    : ""
)
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAILS = [
  "vybedriven@gmail.com",
  "admin@vybedriven.in",
  "hello@goabuilds.com",
  "pandeysatyam2030@gmail.com",
  ...envAdminEmails,
];

export function isPlatformAdmin(user?: { id?: string; email?: string | null } | null): boolean {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
}

// Check strictly if the logged-in user is the creator/organizer of an event
export function isEventOrganizer(
  event?: Opportunity | null,
  user?: { id?: string; email?: string | null } | null
): boolean {
  if (!event || !user) return false;
  const hosted = event as Partial<HostedEvent>;
  const uId = user.id?.trim();
  const uEmail = user.email?.trim().toLowerCase();

  // Platform admins can manage all events and view registrations
  if (uEmail && ADMIN_EMAILS.includes(uEmail)) return true;

  // Specific check for Goa Buildathon 2027
  if (event.slug === "goa-buildathon-2027") {
    if (uEmail && (ADMIN_EMAILS.includes(uEmail) || uEmail.includes("goabuilds"))) return true;
  }

  const orgId = hosted.organizerId?.trim();
  const orgEmail = hosted.organizerEmail?.trim().toLowerCase();

  if (uId && orgId && uId === orgId) return true;
  if (uEmail && orgEmail && uEmail === orgEmail) return true;
  return false;
}

// Update existing hosted event
export function updateHostedOpportunity(
  slug: string,
  updates: Partial<HostedEvent>,
  user?: { id?: string; email?: string | null } | null
): HostedEvent | null {
  const list = getStoredHostedEvents();
  const index = list.findIndex((e) => e.slug === slug);
  if (index === -1) return null;

  // Authorization check: Only the actual host can edit
  if (user && !isEventOrganizer(list[index], user)) {
    throw new Error("Unauthorized: Only the event creator can edit this event.");
  }

  const updated: HostedEvent = {
    ...list[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  list[index] = updated;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_HOSTED_EVENTS, JSON.stringify(list));
    notifyStoreChange();
  }
  return updated;
}

// Delete hosted event
export function deleteHostedOpportunity(
  slug: string,
  user?: { id?: string; email?: string | null } | null
): boolean {
  const list = getStoredHostedEvents();
  const target = list.find((e) => e.slug === slug);
  if (!target) return false;

  if (user && !isEventOrganizer(target, user)) {
    throw new Error("Unauthorized: Only the event creator can delete this event.");
  }

  const filtered = list.filter((e) => e.slug !== slug);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_HOSTED_EVENTS, JSON.stringify(filtered));
    notifyStoreChange();
  }
  return true;
}

// Register for an opportunity with multi-step support and Supabase sync
export function submitRegistration(data: {
  opportunitySlug: string;
  opportunityTitle: string;
  userId?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  gender?: string;
  location?: string;
  collegeOrCompany: string;
  userType?: string;
  teamType: "solo" | "team";
  teamName?: string;
  teamSize?: string;
  teamMembers?: string;
  teammates?: TeammateDetail[];
  lookingForTeammates?: boolean;
  termsAccepted?: boolean;
  experienceLevel?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  projectIdea?: string;
}): EventRegistration {
  const allRegistrations = getStoredRegistrations();

  // Check if already registered with this email
  const existing = allRegistrations.find(
    (r) =>
      r.opportunitySlug === data.opportunitySlug &&
      (r.email.trim().toLowerCase() === data.email.trim().toLowerCase() ||
        (data.userId && r.userId === data.userId))
  );

  if (existing) {
    return existing;
  }

  // Generate branded confirmation ID
  const isGoa = data.opportunitySlug === "goa-buildathon-2027";
  const idPrefix = isGoa ? "GB27" : "REG-2026";
  const idNumber = Math.floor(10000 + Math.random() * 90000);
  const newId = `${idPrefix}-${idNumber}`;

  const newReg: EventRegistration = {
    ...data,
    id: newId,
    status: "Registered",
    createdAt: new Date().toISOString(),
  };

  const updated = [newReg, ...allRegistrations];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(updated));
    notifyStoreChange();

    // Background sync to Supabase database
    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        supabase
          .from("registrations" as any)
          .insert([
            {
              id: newReg.id,
              opportunity_slug: newReg.opportunitySlug,
              opportunity_title: newReg.opportunityTitle,
              user_id: newReg.userId || null,
              full_name: newReg.fullName,
              first_name: newReg.firstName || null,
              last_name: newReg.lastName || null,
              email: newReg.email.toLowerCase().trim(),
              phone: newReg.phone,
              gender: newReg.gender || null,
              location: newReg.location || null,
              college_or_company: newReg.collegeOrCompany,
              user_type: newReg.userType || null,
              team_type: newReg.teamType,
              team_name: newReg.teamName || null,
              team_size: newReg.teamSize || "Solo",
              team_members: newReg.teamMembers || null,
              teammates: newReg.teammates || [],
              looking_for_teammates: newReg.lookingForTeammates ?? false,
              terms_accepted: newReg.termsAccepted ?? true,
              status: newReg.status,
              created_at: newReg.createdAt,
            },
          ])
          .then(({ error }) => {
            if (error) {
              console.warn("[Database Sync] Supabase notice:", error.message);
            } else {
              console.log("[Database Sync] Successfully persisted registration to Supabase cloud.");
            }
          })
          .catch((err) => {
            console.warn("[Database Sync] Supabase sync attempt:", err);
          });
      })
      .catch((err) => {
        console.warn("[Database Sync] Supabase client import:", err);
      });
  }

  return newReg;
}

// Merge remote Supabase registrations into local store
export function mergeRemoteRegistrations(remoteRows: any[]): void {
  if (typeof window === "undefined" || !Array.isArray(remoteRows) || !remoteRows.length) return;
  const localList = getStoredRegistrations();
  const map = new Map<string, EventRegistration>();

  // Add existing local registrations to map
  for (const r of localList) {
    map.set(r.id, r);
  }

  // Overlay remote records from Supabase
  for (const row of remoteRows) {
    const parsed: EventRegistration = {
      id: row.id,
      opportunitySlug: row.opportunity_slug,
      opportunityTitle: row.opportunity_title,
      userId: row.user_id,
      fullName: row.full_name || `${row.first_name || ""} ${row.last_name || ""}`.trim(),
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      gender: row.gender,
      location: row.location,
      collegeOrCompany: row.college_or_company,
      userType: row.user_type,
      teamType: row.team_type || "solo",
      teamName: row.team_name,
      teamSize: row.team_size,
      teamMembers: row.team_members,
      teammates: row.teammates,
      lookingForTeammates: row.looking_for_teammates,
      termsAccepted: row.terms_accepted,
      status: row.status || "Registered",
      createdAt: row.created_at,
    };
    map.set(parsed.id, parsed);
  }

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(merged));
  notifyStoreChange();
}

// Get all registrations for an opportunity (organizer view)
export function getRegistrationsBySlug(slug: string): EventRegistration[] {
  return getStoredRegistrations().filter((r) => r.opportunitySlug === slug);
}

// Get count of registrations for an opportunity
export function getRegistrationCount(slug: string): number {
  return getRegistrationsBySlug(slug).length;
}

// Get all registrations made by a user (builder profile view)
export function getUserRegistrations(
  userId?: string,
  userEmail?: string | null
): EventRegistration[] {
  if (!userId && !userEmail) return [];
  const uId = userId?.trim();
  const uEmail = userEmail?.trim().toLowerCase();

  return getStoredRegistrations().filter((r) => {
    if (uId && r.userId && r.userId === uId) return true;
    if (uEmail && r.email && r.email.trim().toLowerCase() === uEmail) return true;
    return false;
  });
}

// Update participant registration status
export function updateRegistrationStatus(
  registrationId: string,
  newStatus: EventRegistration["status"]
): boolean {
  const list = getStoredRegistrations();
  const index = list.findIndex((r) => r.id === registrationId);
  if (index === -1) return false;

  list[index].status = newStatus;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(list));
    notifyStoreChange();
  }
  return true;
}

// Check if user is registered for an opportunity
export function isUserRegistered(slug: string, userIdOrEmail?: string): boolean {
  if (!userIdOrEmail) return false;
  const list = getRegistrationsBySlug(slug);
  const query = userIdOrEmail.toLowerCase().trim();
  return list.some(
    (r) => (r.userId && r.userId === userIdOrEmail) || r.email.toLowerCase().trim() === query
  );
}

// Export CSV of registrants (Organizers & Admins only)
export function exportRegistrationsToCSV(
  slug: string,
  eventTitle: string,
  user?: { id?: string; email?: string | null } | null
) {
  if (typeof window === "undefined") return;
  const targetEvent = findOpportunity(slug);
  if (!targetEvent) {
    alert("Event not found.");
    return;
  }

  // Strict host / admin verification
  if (user && !isEventOrganizer(targetEvent, user)) {
    alert("Unauthorized: You can only export registration data for events you organized.");
    return;
  }

  const list = getRegistrationsBySlug(slug);
  if (!list.length) {
    alert("No registrations to export yet.");
    return;
  }

  const headers = [
    "Registration ID",
    "Registration Date",
    "Full Name",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Gender",
    "Location",
    "College / Organization",
    "User Type",
    "Participation Type",
    "Team Name",
    "Team Size",
    "Teammates Breakdown",
    "Looking for Teammates",
    "Status",
  ];

  const escapeCSV = (str?: string | null) => {
    if (!str) return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const rows = list.map((r) => [
    escapeCSV(r.id),
    escapeCSV(new Date(r.createdAt).toLocaleString()),
    escapeCSV(r.fullName),
    escapeCSV(r.firstName || "-"),
    escapeCSV(r.lastName || "-"),
    escapeCSV(r.email),
    escapeCSV(r.phone),
    escapeCSV(r.gender || "-"),
    escapeCSV(r.location || "-"),
    escapeCSV(r.collegeOrCompany),
    escapeCSV(r.userType || "-"),
    escapeCSV(r.teamType),
    escapeCSV(r.teamName || "-"),
    escapeCSV(r.teamSize || "-"),
    escapeCSV(
      r.teammates && r.teammates.length
        ? r.teammates.map((t) => `${t.name} (${t.email}${t.phone ? ", " + t.phone : ""})`).join(" | ")
        : r.teamMembers || "-"
    ),
    escapeCSV(r.lookingForTeammates ? "Yes" : "No"),
    escapeCSV(r.status),
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `${slugifyTitle(eventTitle)}-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// React Hook: live synced all opportunities
export function useOpportunities() {
  const [data, setData] = useState<Opportunity[]>(() => getAllMergedOpportunities());

  useEffect(() => {
    const handleUpdate = () => {
      setData(getAllMergedOpportunities());
    };
    window.addEventListener(EVENT_CHANGE_SIGNAL, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EVENT_CHANGE_SIGNAL, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return data;
}

function getOrganizerEvents(userId?: string, userEmail?: string | null): HostedEvent[] {
  if (!userId && !userEmail) return [];
  const stored = getStoredHostedEvents().filter((e) =>
    isEventOrganizer(e, { id: userId, email: userEmail })
  );

  // Platform admins & Goa organizers get Goa Buildathon 2027 in their management portal
  if (isPlatformAdmin({ id: userId, email: userEmail })) {
    const goa = findOpportunity("goa-buildathon-2027");
    if (goa && !stored.some((e) => e.slug === "goa-buildathon-2027")) {
      const hostedGoa: HostedEvent = {
        ...goa,
        organizerId: userId || "admin",
        organizerEmail: userEmail || "hello@goabuilds.com",
        isHosted: true,
        createdAt: "2026-11-08T00:00:00.000Z",
        registrationType: "direct",
      };
      return [hostedGoa, ...stored];
    }
  }
  return stored;
}

// React Hook: live synced hosted events strictly belonging to the logged-in organizer
export function useHostedEvents(userId?: string, userEmail?: string | null) {
  const [events, setEvents] = useState<HostedEvent[]>(() => getOrganizerEvents(userId, userEmail));

  useEffect(() => {
    const update = () => {
      setEvents(getOrganizerEvents(userId, userEmail));
    };
    update();
    window.addEventListener(EVENT_CHANGE_SIGNAL, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT_CHANGE_SIGNAL, update);
      window.removeEventListener("storage", update);
    };
  }, [userId, userEmail]);

  return events;
}

// React Hook: live synced registrations for an event with cloud Supabase polling
export function useEventRegistrations(slug: string) {
  const [list, setList] = useState<EventRegistration[]>(() => getRegistrationsBySlug(slug));

  useEffect(() => {
    const update = () => {
      setList(getRegistrationsBySlug(slug));
    };
    update();
    window.addEventListener(EVENT_CHANGE_SIGNAL, update);
    window.addEventListener("storage", update);

    // Fetch and merge latest cloud registrations from Supabase
    let active = true;
    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        supabase
          .from("registrations" as any)
          .select("*")
          .eq("opportunity_slug", slug)
          .then(({ data, error }) => {
            if (!active || error || !data || !Array.isArray(data)) return;
            mergeRemoteRegistrations(data);
            setList(getRegistrationsBySlug(slug));
          })
          .catch(() => {});
      })
      .catch(() => {});

    return () => {
      active = false;
      window.removeEventListener(EVENT_CHANGE_SIGNAL, update);
      window.removeEventListener("storage", update);
    };
  }, [slug]);

  return list;
}

