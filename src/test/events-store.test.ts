import { describe, it, expect, beforeEach } from "vitest";
import {
  createHostedOpportunity,
  findOpportunity,
  submitRegistration,
  getRegistrationsBySlug,
  updateRegistrationStatus,
  slugifyTitle,
} from "@/data/events-store";

describe("Events Store & Unstop-Style Hosting", () => {
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
      organizerId: "test-user-id-1",
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

  it("handles event registration and stores participant details", () => {
    const reg = submitRegistration({
      opportunitySlug: "fintech-innovation-sprint-2026",
      opportunityTitle: "Fintech Innovation Sprint 2026",
      fullName: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 99999 88888",
      collegeOrCompany: "IIT Bombay",
      teamType: "team",
      teamName: "CodeNinjas",
      teamSize: "3 members",
    });

    expect(reg.id).toMatch(/^REG-2026-/);
    expect(reg.status).toBe("Registered");

    const list = getRegistrationsBySlug("fintech-innovation-sprint-2026");
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((r) => r.email === "priya@example.com")).toBe(true);
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

