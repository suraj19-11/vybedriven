import { describe, it, expect, beforeEach } from "vitest";
import {
  createHostedOpportunity,
  findOpportunity,
  submitRegistration,
  getRegistrationsBySlug,
  updateRegistrationStatus,
  slugifyTitle,
  isEventOrganizer,
  updateHostedOpportunity,
  getUserRegistrations,
} from "@/data/events-store";

describe("Events Store & Vybe Driven Host Hub", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("slugifies titles cleanly", () => {
    expect(slugifyTitle("Mumbai Web3 & AI Hackathon 2026!")).toBe(
      "mumbai-web3-ai-hackathon-2026"
    );
  });

  it("creates a hosted event and retrieves it by slug", () => {
    const hosted = createHostedOpportunity({
      title: "Fintech Innovation Sprint 2026",
      type: "Hackathon",
      tag: "Fintech · Open Banking",
      description: "Build rapid banking and payments prototypes.",
      overview: "Full 24-hour sprint details.",
      date: "Nov 30, 2026",
      location: "BKC, Mumbai",
      format: "In person",
      prize: "₹1,00,000",
      image: "/test.jpg",
      organizer: "Fintech Club",
      organizerId: "alex-uuid-1",
      organizerEmail: "alex@vybedriven.in",
      registrationDeadline: "Nov 25, 2026",
      eligibility: "Open to all",
      teamSize: "1–4 Members",
      fee: "Free",
    });

    expect(hosted.slug).toBe("fintech-innovation-sprint-2026");
    expect(hosted.isHosted).toBe(true);

    const found = findOpportunity("fintech-innovation-sprint-2026");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Fintech Innovation Sprint 2026");
  });

  it("strictly enforces multi-user isolation and authorization", () => {
    const event = createHostedOpportunity({
      title: "Global Builder Sprint",
      type: "Hackathon",
      tag: "AI",
      description: "Exclusive builder hackathon.",
      overview: "Overview",
      date: "Dec 1, 2026",
      location: "Mumbai",
      format: "Online",
      image: "/test.jpg",
      organizer: "Alex",
      organizerId: "alex-user-id",
      organizerEmail: "alex@test.com",
      registrationDeadline: "Nov 28, 2026",
      eligibility: "Students",
      teamSize: "2–4",
      fee: "Free",
    });

    const alexUser = { id: "alex-user-id", email: "alex@test.com" };
    const guestUser = { id: "guest-user-id", email: "guest@test.com" };

    // Alex is the organizer
    expect(isEventOrganizer(event, alexUser)).toBe(true);

    // Guest is NOT the organizer of Alex's event
    expect(isEventOrganizer(event, guestUser)).toBe(false);

    // Anonymous visitor is NOT organizer
    expect(isEventOrganizer(event, null)).toBe(false);

    // Guest cannot edit Alex's event
    expect(() => {
      updateHostedOpportunity(event.slug, { title: "Hacked by Guest" }, guestUser);
    }).toThrow(/Unauthorized/);

    // Alex CAN edit his event
    const updated = updateHostedOpportunity(
      event.slug,
      { title: "Global Builder Sprint 2.0" },
      alexUser
    );
    expect(updated?.title).toBe("Global Builder Sprint 2.0");
  });

  it("handles event registration and isolates participant records", () => {
    const reg = submitRegistration({
      opportunitySlug: "fintech-innovation-sprint-2026",
      opportunityTitle: "Fintech Innovation Sprint 2026",
      userId: "guest-user-id",
      fullName: "Guest Builder",
      email: "guest@test.com",
      phone: "+91 99999 88888",
      collegeOrCompany: "IIT Bombay",
      teamType: "team",
      teamName: "CodeNinjas",
      teamSize: "3 members",
    });

    expect(reg.id).toMatch(/^REG-2026-/);
    expect(reg.status).toBe("Registered");

    // Guest can see their own registration
    const guestRegs = getUserRegistrations("guest-user-id", "guest@test.com");
    expect(guestRegs.length).toBe(1);
    expect(guestRegs[0].email).toBe("guest@test.com");

    // Alex does NOT see Guest's personal registration in his "My Registrations" tab
    const alexRegs = getUserRegistrations("alex-user-id", "alex@test.com");
    expect(alexRegs.length).toBe(0);

    // The event organizer can see all participants registered for that event
    const eventApplicants = getRegistrationsBySlug("fintech-innovation-sprint-2026");
    expect(eventApplicants.length).toBe(1);
    expect(eventApplicants[0].fullName).toBe("Guest Builder");
  });

  it("allows updating registration status by organizer", () => {
    const reg = submitRegistration({
      opportunitySlug: "fintech-innovation-sprint-2026",
      opportunityTitle: "Fintech Innovation Sprint 2026",
      fullName: "Rahul Roy",
      email: "rahul@example.com",
      phone: "+91 99999 77777",
      collegeOrCompany: "VJTI",
      teamType: "solo",
    });

    const updated = updateRegistrationStatus(reg.id, "Shortlisted");
    expect(updated).toBe(true);

    const list = getRegistrationsBySlug("fintech-innovation-sprint-2026");
    const target = list.find((r) => r.id === reg.id);
    expect(target?.status).toBe("Shortlisted");
  });
});

