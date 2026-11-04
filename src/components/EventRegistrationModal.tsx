import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Opportunity } from "@/data/opportunities";
import {
  submitRegistration,
  isUserRegistered,
  getRegistrationsBySlug,
  type EventRegistration,
} from "@/data/events-store";
import { toast } from "sonner";

interface EventRegistrationModalProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EventRegistrationModal({
  opportunity,
  open,
  onOpenChange,
  onSuccess,
}: EventRegistrationModalProps) {
  const { user, profile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeOrCompany, setCollegeOrCompany] = useState("");
  const [teamType, setTeamType] = useState<"solo" | "team">("solo");
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState("2 members");
  const [teamMembers, setTeamMembers] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReg, setConfirmedReg] = useState<EventRegistration | null>(null);

  // Check if existing registration exists
  const existingRegistrations = getRegistrationsBySlug(opportunity.slug);
  const userIdentifier = user?.email || email;
  const existingReg = existingRegistrations.find(
    (r) =>
      (user?.id && r.userId === user.id) ||
      (userIdentifier && r.email.toLowerCase() === userIdentifier.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      if (existingReg) {
        setConfirmedReg(existingReg);
      } else {
        setConfirmedReg(null);
        if (profile) {
          setFullName(profile.display_name || user?.user_metadata?.["full_name"] || "");
          setEmail(user?.email || "");
          setCollegeOrCompany(profile.college_or_company || "");
          setGithubUrl(profile.github_url || "");
          setLinkedinUrl(profile.linkedin_url || "");
        } else if (user) {
          setEmail(user.email || "");
          setFullName(user.user_metadata?.["full_name"] || "");
        }
      }
    }
  }, [open, user, profile, existingReg]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !collegeOrCompany.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (teamType === "team" && !teamName.trim()) {
      toast.error("Please provide a team name.");
      return;
    }

    setSubmitting(true);
    try {
      const reg = submitRegistration({
        opportunitySlug: opportunity.slug,
        opportunityTitle: opportunity.title,
        userId: user?.id,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        collegeOrCompany: collegeOrCompany.trim(),
        teamType,
        teamName: teamType === "team" ? teamName.trim() : undefined,
        teamSize: teamType === "team" ? teamSize : "Solo",
        teamMembers: teamType === "team" ? teamMembers.trim() : undefined,
        experienceLevel,
        githubUrl: githubUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        projectIdea: projectIdea.trim() || undefined,
      });

      setConfirmedReg(reg);
      toast.success("Registration confirmed! See you at the event.");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(opportunity.title);
    const details = encodeURIComponent(
      `${opportunity.description}\n\nFormat: ${opportunity.format}\nOrganized by: ${opportunity.organizer}`
    );
    const location = encodeURIComponent(opportunity.location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto border-border bg-card p-6 sm:p-8 text-card-foreground">
        {confirmedReg ? (
          // Confirmation View
          <div className="py-3 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-neon/15 text-neon shadow-glow">
              <CheckCircle2 className="size-9" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-neon">
              Application Confirmed
            </p>
            <DialogTitle className="mt-1 text-2xl font-black sm:text-3xl">
              You're in! 🎉
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              Your registration for{" "}
              <strong className="text-foreground">{opportunity.title}</strong> has been
              received by the organizer.
            </DialogDescription>

            {/* Ticket Card */}
            <div className="mt-6 rounded-2xl border border-neon/40 bg-gradient-to-br from-surface via-surface-2 to-surface p-5 text-left shadow-glow-soft">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="size-4 text-neon" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Participant Pass
                  </span>
                </div>
                <span className="rounded-full bg-neon/20 px-2.5 py-0.5 text-xs font-bold text-neon font-mono">
                  {confirmedReg.id}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Participant</p>
                  <p className="font-semibold text-foreground text-sm">{confirmedReg.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">College / Organization</p>
                  <p className="font-semibold text-foreground text-sm">{confirmedReg.collegeOrCompany}</p>
                </div>
                {confirmedReg.teamType === "team" && confirmedReg.teamName && (
                  <div>
                    <p className="text-muted-foreground">Team</p>
                    <p className="font-semibold text-neon text-sm">{confirmedReg.teamName} ({confirmedReg.teamSize})</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Date & Venue</p>
                  <p className="font-semibold text-foreground">{opportunity.date} · {opportunity.location}</p>
                </div>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              {opportunity.groupUrl && (
                <a
                  href={opportunity.groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neon px-4 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-glow-soft transition hover:brightness-105"
                >
                  <MessageCircle className="size-4" />
                  <span>Join Organizer WhatsApp Group</span>
                </a>
              )}
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs sm:text-sm font-semibold transition hover:border-neon hover:text-neon"
              >
                <Calendar className="size-4" />
                <span>Add to Calendar</span>
              </a>
            </div>

            <Button
              variant="outline"
              className="mt-5 w-full rounded-full border-border text-xs sm:text-sm"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          // Registration Form View
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-neon">
                <Sparkles className="size-3.5" /> Direct Vybe Driven Registration
              </div>
              <DialogTitle className="text-2xl font-bold">
                Register for {opportunity.title}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                {opportunity.date} · {opportunity.format} · {opportunity.fee}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-neon/30 bg-neon/10 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-neon shrink-0" />
              <span>Applying with verified builder profile: <strong className="text-foreground">{user?.email}</strong></span>
            </div>

            {/* Personal Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Your Details
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Satyam Pandey"
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">
                    Phone / WhatsApp Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">
                    College / Organization <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeOrCompany}
                    onChange={(e) => setCollegeOrCompany(e.target.value)}
                    placeholder="e.g. Fr. CRCE Bandra or Google"
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                </div>
              </div>
            </div>

            {/* Team or Solo */}
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Participation Format
              </h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium">
                  <input
                    type="radio"
                    name="teamType"
                    checked={teamType === "solo"}
                    onChange={() => setTeamType("solo")}
                    className="accent-neon size-4"
                  />
                  <span>Solo Entry</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium">
                  <input
                    type="radio"
                    name="teamType"
                    checked={teamType === "team"}
                    onChange={() => setTeamType("team")}
                    className="accent-neon size-4"
                  />
                  <span>Team Entry ({opportunity.teamSize || "Up to 4"})</span>
                </label>
              </div>

              {teamType === "team" && (
                <div className="space-y-3 rounded-xl border border-border bg-surface/50 p-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-foreground">
                        Team Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. CodeMonks"
                        className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-neon"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">
                        Total Team Size
                      </label>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-neon"
                      >
                        <option>2 members</option>
                        <option>3 members</option>
                        <option>4 members</option>
                        <option>5+ members</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">
                      Teammate Names & Emails (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={teamMembers}
                      onChange={(e) => setTeamMembers(e.target.value)}
                      placeholder="e.g. John Doe (john@gmail.com), Jane Smith (jane@gmail.com)"
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-neon"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Profile & Portfolio */}
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Builder Profile & Links (Optional)
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-foreground">GitHub Profile</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-neon"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-neon"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">
                  Project Idea / Motivation
                </label>
                <textarea
                  rows={2}
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  placeholder="Tell the organizer briefly what you plan to build or explore..."
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-neon"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-border pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-brand text-primary-foreground font-bold py-3 text-sm sm:text-base shadow-glow transition hover:brightness-105"
              >
                {submitting ? "Submitting Registration..." : "Confirm & Complete Registration"}
              </Button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                By submitting, your details will be shared with the official organizer (
                {opportunity.organizer}).
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

