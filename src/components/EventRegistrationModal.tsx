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
  UserPlus,
  Trash2,
  Download,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  User,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Opportunity } from "@/data/opportunities";
import {
  submitRegistration,
  getRegistrationsBySlug,
  type EventRegistration,
  type TeammateDetail,
} from "@/data/events-store";
import { toast } from "sonner";

interface EventRegistrationModalProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const GENDERS = [
  "Male",
  "Female",
  "Transgender",
  "Intersex",
  "Non-binary",
  "Prefer not to say",
  "Other",
];

const USER_TYPES = [
  { label: "College Students", icon: "🎓" },
  { label: "Professional", icon: "💼" },
  { label: "School Student", icon: "🎒" },
  { label: "Fresher", icon: "🚀" },
];

export function EventRegistrationModal({
  opportunity,
  open,
  onOpenChange,
  onSuccess,
}: EventRegistrationModalProps) {
  const { user, profile } = useAuth();

  // Wizard Step: 1 = Basic/User Details, 2 = Team Setup, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [location, setLocation] = useState("");
  const [organization, setOrganization] = useState("");
  const [userType, setUserType] = useState("College Students");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [stayInLoop, setStayInLoop] = useState(true);

  // Step 2: Team Setup
  const [teamMode, setTeamMode] = useState<"create_team" | "join_team">("create_team");
  const [teamName, setTeamName] = useState("");
  const [lookingForTeammates, setLookingForTeammates] = useState(false);
  const [teammates, setTeammates] = useState<TeammateDetail[]>([]);

  // Submitting & Confirmed state
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReg, setConfirmedReg] = useState<EventRegistration | null>(null);

  // Inline Auth State for unauthenticated visitors
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleGoogleAuth = async () => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const redirectTo = `${window.location.origin}/opportunities/${opportunity.slug}?register=1`;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        setAuthBusy(false);
        setAuthError(oauthError.message);
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err: unknown) {
      setAuthBusy(false);
      setAuthError(
        err instanceof Error ? err.message : "Unable to initiate Google sign-in."
      );
    }
  };

  const handleInlineAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");

    if (!authEmail.trim() || !authEmail.includes("@")) {
      setAuthBusy(false);
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthBusy(false);
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    try {
      if (authMode === "signup") {
        if (!authName.trim()) {
          setAuthBusy(false);
          setAuthError("Please enter your Full Name.");
          return;
        }

        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: {
              full_name: authName.trim(),
              phone: authPhone.trim() || undefined,
            },
            emailRedirectTo: `${window.location.origin}/opportunities/${opportunity.slug}?register=1`,
          },
        });

        if (signUpErr) {
          setAuthBusy(false);
          setAuthError(signUpErr.message);
          return;
        }

        if (!signUpData.session) {
          setAuthBusy(false);
          toast.success("Verification email sent!");
          setAuthError(
            `📩 Verification email sent to ${authEmail.trim()}! Please check your inbox (and Spam folder) to verify your account and complete your registration.`
          );
          return;
        }

        toast.success("Account created successfully!");
        setAuthBusy(false);

        const names = authName.trim().split(" ");
        setFirstName(names[0] || "");
        setLastName(names.slice(1).join(" ") || "");
        setEmail(authEmail.trim());
        if (authPhone.trim()) setPhone(authPhone.trim());
        setStep(1);
        return;
      }

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (signInErr) {
        setAuthBusy(false);
        if (signInErr.message.toLowerCase().includes("email not confirmed")) {
          setAuthError(
            "⚠️ Your email address is not verified yet. Please check your inbox and spam folder for the confirmation link to activate your account."
          );
        } else {
          setAuthError(signInErr.message);
        }
        return;
      }

      toast.success("Signed in successfully! Let's complete your registration.");
      setAuthBusy(false);

      const names = (data.user.user_metadata?.["full_name"] || authEmail.split("@")[0]).trim().split(" ");
      setFirstName(names[0] || "");
      setLastName(names.slice(1).join(" ") || "");
      setEmail(authEmail.trim());
      if (authPhone.trim()) setPhone(authPhone.trim());
      setStep(1);
    } catch (err: unknown) {
      setAuthBusy(false);
      setAuthError(err instanceof Error ? err.message : "Authentication error.");
    }
  };

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
        setStep(3);
      } else {
        setConfirmedReg(null);
        setStep(1);

        // Pre-fill from logged-in builder profile
        if (profile) {
          const names = (profile.display_name || user?.user_metadata?.["full_name"] || "").trim().split(" ");
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
          setEmail(user?.email || "");
          setOrganization(profile.college_or_company || "");
          setLocation(profile.location || "");
        } else if (user) {
          const names = (user.user_metadata?.["full_name"] || user.email?.split("@")[0] || "").trim().split(" ");
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
          setEmail(user.email || "");
        }
      }
    }
  }, [open, user, profile, existingReg]);

  // Handle Step 1 Validation & Proceed
  const handleProceedToTeam = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("Please enter your First Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.replace(/[^\d]/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!organization.trim()) {
      toast.error("Please enter your College or Organization Name.");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to proceed.");
      return;
    }

    setStep(2);
  };

  // Add Teammate helper (Max 3 additional members + 1 leader = 4 total)
  const handleAddTeammate = () => {
    if (teammates.length >= 3) {
      toast.error("A team can have a maximum of 4 members.");
      return;
    }
    setTeammates([...teammates, { name: "", email: "", phone: "" }]);
  };

  const handleUpdateTeammate = (index: number, field: keyof TeammateDetail, value: string) => {
    const updated = [...teammates];
    updated[index] = { ...updated[index], [field]: value };
    setTeammates(updated);
  };

  const handleRemoveTeammate = (index: number) => {
    setTeammates(teammates.filter((_, i) => i !== index));
  };

  // Final Submit Handler
  const handleFinalSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (teamMode === "create_team" && !teamName.trim()) {
      toast.error("Please enter a team name.");
      return;
    }

    // Validate teammate emails if added
    for (let i = 0; i < teammates.length; i++) {
      const tm = teammates[i];
      if (!tm.name.trim()) {
        toast.error(`Please enter a name for Teammate #${i + 2}.`);
        return;
      }
      if (!tm.email.trim() || !tm.email.includes("@")) {
        toast.error(`Please enter a valid email for Teammate #${i + 2}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const fullParticipantName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const teamSummary = teammates.map((t) => `${t.name.trim()} (${t.email.trim()})`).join(", ");

      const reg = submitRegistration({
        opportunitySlug: opportunity.slug,
        opportunityTitle: opportunity.title,
        userId: user?.id,
        fullName: fullParticipantName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        gender,
        location: location.trim(),
        collegeOrCompany: organization.trim(),
        userType,
        teamType: teamMode === "create_team" ? "team" : "solo",
        teamName: teamMode === "create_team" ? teamName.trim() : undefined,
        teamSize: teamMode === "create_team" ? `${1 + teammates.length} members` : "Solo",
        teamMembers: teamMode === "create_team" ? teamSummary : undefined,
        teammates: teamMode === "create_team" ? teammates : [],
        lookingForTeammates,
        termsAccepted,
        experienceLevel: "Intermediate",
      });

      setConfirmedReg(reg);
      setStep(3);
      toast.success("Registration confirmed! See you in Goa.");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(opportunity.title);
    const details = encodeURIComponent(
      `${opportunity.description}\n\nFormat: ${opportunity.format}\nOrganized by: ${opportunity.organizer}\nRegistration ID: ${confirmedReg?.id || ""}`
    );
    const loc = encodeURIComponent(opportunity.location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}`;
  };

  const downloadPassSummary = () => {
    if (!confirmedReg) return;
    const textContent = `========================================================
VYBE DRIVEN — OFFICIAL PARTICIPANT CONFIRMATION PASS
========================================================
Event: ${opportunity.title}
Format: ${opportunity.format}
Location: ${opportunity.location}
Date: ${opportunity.date}

REGISTRATION DETAILS:
--------------------------------------------------------
Registration ID : ${confirmedReg.id}
Registration Date: ${new Date(confirmedReg.createdAt).toLocaleString()}
Full Name       : ${confirmedReg.fullName}
Email           : ${confirmedReg.email}
Phone           : ${confirmedReg.phone}
Gender          : ${confirmedReg.gender || "-"}
Location        : ${confirmedReg.location || "-"}
College / Org   : ${confirmedReg.collegeOrCompany}
User Category   : ${confirmedReg.userType || "-"}
Participation   : ${confirmedReg.teamType.toUpperCase()}
Team Name       : ${confirmedReg.teamName || "N/A (Solo / Squad matching)"}
Team Size       : ${confirmedReg.teamSize || "1"}
Teammates       : ${confirmedReg.teamMembers || "None"}
Status          : ${confirmedReg.status}

IMPORTANT STAGES:
1. Idea Submission (PPT Round) — Active now until Dec 31, 2026
2. 36-Hour Offline Hackathon — Grand Finale in Goa (Jan 16–17, 2027)

Official Desk: hello@goabuilds.com
Platform Support: vybedriven@gmail.com
========================================================`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${confirmedReg.id}-${opportunity.slug}-pass.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Confirmation pass downloaded.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto border-border bg-[#070d09] p-5 sm:p-7 text-foreground shadow-2xl">
        {/* Top Header */}
        <DialogHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-11 sm:size-12 rounded-xl border border-neon/30 bg-surface flex items-center justify-center overflow-hidden shrink-0 shadow-glow-soft">
                <img
                  src={opportunity.image}
                  alt={opportunity.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  {opportunity.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {opportunity.organizer}
                </DialogDescription>
              </div>
            </div>

            {/* User Session Pill */}
            {user ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs text-muted-foreground self-start sm:self-auto">
                <span className="size-2 rounded-full bg-neon animate-pulse" />
                <span className="truncate max-w-[170px] text-foreground font-medium">
                  {user.email}
                </span>
              </div>
            ) : null}
          </div>

          {/* Stepper Indicator */}
          {step !== 3 && (
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/50 pt-3 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                    step === 1 ? "bg-neon text-black" : "bg-neon/20 text-neon"
                  }`}
                >
                  1
                </span>
                <span className={step === 1 ? "font-bold text-foreground" : "text-muted-foreground"}>
                  Basic &amp; User Details
                </span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                    step === 2 ? "bg-neon text-black" : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  2
                </span>
                <span className={step === 2 ? "font-bold text-foreground" : "text-muted-foreground"}>
                  Team Setup
                </span>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* AUTH REQUIRED IF NOT LOGGED IN */}
        {!user && step !== 3 ? (
          <div className="mt-4 space-y-5 text-xs sm:text-sm">
            <div className="rounded-2xl border border-neon/40 bg-neon/5 p-4 sm:p-5">
              <div className="flex items-center gap-2.5 text-neon font-bold text-sm sm:text-base">
                <Lock className="size-5 shrink-0" />
                <span>Login or Sign Up Required to Register</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                To link your registration with your profile, access your team roster, and view your entry pass, please sign in or create an account below.
              </p>
            </div>

            {/* 1-Click Google Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleAuth}
              disabled={authBusy}
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

            {/* Toggle Switcher */}
            <div className="flex rounded-xl border border-border bg-surface p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                }}
                className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition ${
                  authMode === "signin"
                    ? "bg-neon/15 text-neon border border-neon/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
                className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition ${
                  authMode === "signup"
                    ? "bg-neon/15 text-neon border border-neon/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account (Instant)
              </button>
            </div>

            {authError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                {authError}
              </div>
            )}

            <form onSubmit={handleInlineAuth} className="space-y-4">
              {authMode === "signup" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      Full Name <span className="text-neon">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Satyam Pandey"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      Mobile Number <span className="text-neon">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  Email Address <span className="text-neon">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  Password <span className="text-neon">*</span>
                </label>
                <input
                  required
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border-border text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={authBusy}
                  className="rounded-full bg-neon text-primary-foreground font-bold shadow-glow-soft hover:brightness-105 text-xs sm:text-sm flex-1 sm:flex-initial px-6"
                >
                  {authBusy
                    ? "Please wait..."
                    : authMode === "signin"
                    ? "Sign In & Proceed"
                    : "Create Account & Proceed"}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {/* STEP 1: BASIC & USER DETAILS */}
        {user && step === 1 && (
          <form onSubmit={handleProceedToTeam} className="mt-4 space-y-5 text-xs sm:text-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <User className="size-4 text-neon" /> Basic Details
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official participant information shared with the Goa Buildathon organizer.
              </p>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  First Name <span className="text-neon">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  Last Name <span className="text-muted-foreground font-normal">(if applicable)</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                />
              </div>
            </div>

            {/* Email & Phone with +91 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  Email Address <span className="text-neon">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter email"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  Mobile Number <span className="text-neon">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-border bg-surface overflow-hidden focus-within:border-neon focus-within:ring-1 focus-within:ring-neon">
                  <span className="flex items-center gap-1 bg-surface-2 px-3 py-2.5 text-xs font-bold text-foreground border-r border-border shrink-0 select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Gender Pill Selector */}
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-2">
                Gender <span className="text-neon">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      gender === g
                        ? "bg-neon text-black font-bold shadow-glow-soft"
                        : "border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-border/80"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1 flex items-center justify-between">
                  <span>Location <span className="text-neon">*</span></span>
                  <span className="text-[10px] text-muted-foreground">City, State</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. South Goa, Goa or Mumbai"
                    className="w-full rounded-xl border border-border bg-surface pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                  <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  Organization / College Name <span className="text-neon">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Search or enter your college / company"
                    className="w-full rounded-xl border border-border bg-surface pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                  <Building2 className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* User Type Pill Selector */}
            <div className="pt-2 border-t border-border/60">
              <label className="block text-xs font-semibold text-foreground/90 mb-2">
                User Details &amp; Category <span className="text-neon">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {USER_TYPES.map((ut) => (
                  <button
                    key={ut.label}
                    type="button"
                    onClick={() => setUserType(ut.label)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-xs font-semibold transition ${
                      userType === ut.label
                        ? "border border-neon bg-neon/15 text-neon shadow-glow-soft"
                        : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{ut.icon}</span>
                    <span className="truncate">{ut.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notice Note */}
            <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-3 text-xs text-sky-300 flex items-start gap-2.5">
              <Sparkles className="size-4 shrink-0 text-sky-400 mt-0.5" />
              <span>
                <strong>Note:</strong> You can create your squad and add teammates on the next step. Teams can have 2 to 4 members.
              </span>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border text-neon focus:ring-neon"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  By registering for this opportunity, you agree to share the data mentioned in this form or any form henceforth on this opportunity with the organizer of this opportunity for further analysis, processing, and outreach. You also agree to the privacy policy and terms of use of Vybe Driven.
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stayInLoop}
                  onChange={(e) => setStayInLoop(e.target.checked)}
                  className="size-4 rounded border-border text-neon focus:ring-neon"
                />
                <span className="text-xs text-foreground font-medium">
                  Stay in the loop — Get relevant updates curated for you!
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/70">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </Button>

              <Button
                type="submit"
                className="rounded-full bg-gradient-brand text-primary-foreground font-bold px-7 shadow-glow hover:brightness-110"
              >
                Next Step <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: TEAM SETUP & SQUAD FORMATION */}
        {user && step === 2 && (
          <form onSubmit={handleFinalSubmit} className="mt-4 space-y-5 text-xs sm:text-sm">
            {/* Important Notes Banner */}
            <div className="rounded-2xl border border-sky-400/35 bg-gradient-to-r from-sky-500/15 via-surface to-surface p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> Important Notes
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                <li>Your team must have at least 2 and no more than 4 members for the offline sprint.</li>
                <li>If you select &quot;Join A Team / Solo&quot;, you can explore squads seeking teammates before the roster locks.</li>
                <li>As one or more rounds are live, you cannot delete the registration once confirmed.</li>
              </ul>
            </div>

            {/* Choice: Create A Team vs Join A Team / Solo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setTeamMode("create_team")}
                className={`flex flex-col items-center justify-center rounded-2xl p-4 text-center transition ${
                  teamMode === "create_team"
                    ? "border-2 border-neon bg-neon/10 text-foreground shadow-glow-soft"
                    : "border border-border bg-surface text-muted-foreground hover:border-border/80"
                }`}
              >
                <div className="grid size-12 place-items-center rounded-xl bg-neon/15 text-neon mb-2.5">
                  <UserPlus className="size-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Create A Team</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Form a squad &amp; invite your teammates now or add their details.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTeamMode("join_team")}
                className={`flex flex-col items-center justify-center rounded-2xl p-4 text-center transition ${
                  teamMode === "join_team"
                    ? "border-2 border-cyan-400 bg-cyan-500/10 text-foreground shadow-glow-soft"
                    : "border border-border bg-surface text-muted-foreground hover:border-border/80"
                }`}
              >
                <div className="grid size-12 place-items-center rounded-xl bg-cyan-400/15 text-cyan-400 mb-2.5">
                  <Users className="size-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Join A Team / Solo</h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Participate individually or join squads seeking members.
                </p>
              </button>
            </div>

            {/* CREATE TEAM FORM */}
            {teamMode === "create_team" ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Team Name <span className="text-neon">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name (e.g. CodeBrewers)"
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                </div>

                {/* Teammates Header with Counter */}
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-neon" />
                    <span className="font-bold text-foreground">
                      Teammates ({1 + teammates.length}/4)
                    </span>
                  </div>
                  {teammates.length < 1 && (
                    <span className="text-[11px] font-semibold text-amber-400">
                      Add at least 1 more member to complete the team
                    </span>
                  )}
                </div>

                {/* Leader Card (Member 1) */}
                <div className="flex items-center justify-between rounded-xl border border-neon/40 bg-neon/10 p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-neon text-black font-extrabold flex items-center justify-center shrink-0">
                      {firstName.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-xs sm:text-sm">
                        {firstName} {lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {phone} · {email}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-neon/20 px-2.5 py-0.5 text-[10px] font-bold text-neon uppercase">
                    Team Leader
                  </span>
                </div>

                {/* Additional Teammates */}
                {teammates.map((tm, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-surface/70 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neon">
                        Member #{idx + 2} Details
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeammate(idx)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        value={tm.name}
                        onChange={(e) => handleUpdateTeammate(idx, "name", e.target.value)}
                        placeholder="Member name *"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-neon"
                      />
                      <input
                        type="email"
                        required
                        value={tm.email}
                        onChange={(e) => handleUpdateTeammate(idx, "email", e.target.value)}
                        placeholder="Member email *"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-neon"
                      />
                      <input
                        type="tel"
                        value={tm.phone || ""}
                        onChange={(e) => handleUpdateTeammate(idx, "phone", e.target.value)}
                        placeholder="Mobile (optional)"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-neon"
                      />
                    </div>
                  </div>
                ))}

                {/* Add Member Button */}
                {teammates.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddTeammate}
                    className="w-full rounded-xl border border-dashed border-neon/50 bg-neon/5 py-3 text-xs font-bold text-neon transition hover:bg-neon/15 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="size-4" />
                    + Add {teammates.length === 0 ? "2nd" : teammates.length === 1 ? "3rd" : "4th"} Member
                  </button>
                )}

                {/* Looking for Teammates Switch */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 mt-3">
                  <div>
                    <p className="text-xs font-bold text-foreground">Looking for More Teammates?</p>
                    <p className="text-[11px] text-muted-foreground">
                      Allow other ambitious builders on Vybe Driven to request to join your squad.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={lookingForTeammates}
                    onChange={(e) => setLookingForTeammates(e.target.checked)}
                    className="size-5 rounded border-border text-neon focus:ring-neon cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              /* JOIN TEAM / SOLO INFO */
              <div className="rounded-2xl border border-border bg-surface p-5 text-center space-y-2">
                <Sparkles className="size-6 text-cyan-400 mx-auto" />
                <h4 className="text-sm font-bold text-foreground">Individual / Squad Matching</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your registration will be submitted as an individual innovator. You can team up with fellow builders on Discord, WhatsApp community, or during kickoff before the hackathon begins.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/70">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5 mr-1" /> Back
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-gradient-brand text-primary-foreground font-bold px-7 shadow-glow hover:brightness-110"
              >
                {submitting ? "Submitting Registration..." : "Complete Registration 🚀"}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: REGISTRATION SUCCESSFUL CONFIRMATION SCREEN */}
        {step === 3 && confirmedReg && (
          <div className="mt-4 space-y-5 text-center py-2">
            {/* Big Green Glow Checkmark */}
            <div className="mx-auto grid size-16 sm:size-20 place-items-center rounded-full bg-neon/15 text-neon shadow-glow">
              <CheckCircle2 className="size-10 sm:size-12" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                Registration Successful!
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for registering for {opportunity.title}. Your spot has been officially recorded in the builder database.
              </p>
            </div>

            {/* Official Pass Card */}
            <div className="rounded-2xl border-2 border-neon/40 bg-surface-2/80 p-5 text-left shadow-glow-soft space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-black/60 border border-border flex items-center justify-center overflow-hidden shrink-0">
                    <img src={opportunity.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                      {opportunity.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {opportunity.format} · {opportunity.location}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Registration ID
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black text-neon">
                    {confirmedReg.id}
                  </span>
                </div>
              </div>

              {/* Summary Rows */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Primary Participant</span>
                  <span className="font-bold text-foreground">{confirmedReg.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">College / Org</span>
                  <span className="font-bold text-foreground truncate block">{confirmedReg.collegeOrCompany}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Participation Mode</span>
                  <span className="font-bold text-foreground">
                    {confirmedReg.teamType === "team" ? `Team (${confirmedReg.teamName})` : "Solo Builder"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Category</span>
                  <span className="font-bold text-foreground">{confirmedReg.userType || "College Student"}</span>
                </div>
              </div>

              {/* What's Next in Goa Buildathon */}
              <div className="border-t border-border/60 pt-3 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neon">
                  What&apos;s Next in {opportunity.title}?
                </p>
                <div className="rounded-xl bg-background/60 border border-border p-2.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      1. Idea Submission — PPT Round
                    </span>
                    <span className="rounded-full bg-neon/15 px-2 py-0.5 text-[10px] font-bold text-neon">
                      🟢 Live Now
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>2. 36-Hour Offline Hackathon — Grand Finale</span>
                    <span className="text-[11px] font-mono text-foreground font-semibold">Jan 16–17, 2027</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground transition hover:border-neon hover:text-neon"
              >
                <Calendar className="size-3.5 text-neon" /> Add to Calendar
              </a>

              {opportunity.groupUrl && (
                <a
                  href={opportunity.groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                >
                  <MessageCircle className="size-3.5" /> Join WhatsApp Community
                </a>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={downloadPassSummary}
                className="w-full sm:w-auto rounded-full text-xs font-semibold text-foreground"
              >
                <Download className="size-3.5 mr-1 text-neon" /> Download Pass
              </Button>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-full bg-neon text-black font-extrabold shadow-glow hover:brightness-110"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
