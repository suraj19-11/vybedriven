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
  Copy,
  Share2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Opportunity } from "@/data/opportunities";
import {
  submitRegistration,
  getRegistrationsBySlug,
  findTeamByCode,
  joinTeamWithCode,
  type EventRegistration,
  type TeammateDetail,
} from "@/data/events-store";
import { toast } from "sonner";
import { IdeaSubmissionModal } from "@/components/IdeaSubmissionModal";

interface EventRegistrationModalProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialJoinCode?: string;
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
  initialJoinCode,
}: EventRegistrationModalProps) {
  const { user, profile } = useAuth();

  // Mode: "create" (Leader creates team / solo) or "join" (Teammate joins with code)
  const [regFlow, setRegFlow] = useState<"create" | "join">(() => (initialJoinCode ? "join" : "create"));
  const [teamCodeInput, setTeamCodeInput] = useState(initialJoinCode || "");
  const [matchedTeam, setMatchedTeam] = useState<EventRegistration | null>(null);
  const [joinDept, setJoinDept] = useState("");
  const [joinYear, setJoinYear] = useState("");

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
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [guestProceed, setGuestProceed] = useState(false);

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
          const errLower = signUpErr.message.toLowerCase();
          if (errLower.includes("user already registered")) {
            setAuthError(
              "An account with this email already exists. Please switch to 'Sign In' or click 'Continue with Google' above!"
            );
            return;
          } else if (
            errLower.includes("rate limit") ||
            errLower.includes("too many") ||
            errLower.includes("429")
          ) {
            // Supabase email rate limit exceeded — auto-advance to direct registration
            toast.info("Proceeding directly to registration — no password needed!");
            const names = authName.trim().split(" ");
            setFirstName(names[0] || "");
            setLastName(names.slice(1).join(" ") || "");
            setEmail(authEmail.trim());
            if (authPhone.trim()) setPhone(authPhone.trim());
            setGuestProceed(true);
            setStep(1);
            return;
          } else {
            setAuthError(signUpErr.message);
            return;
          }
        }

        if (!signUpData.session) {
          // Email confirmation is active on Supabase — don't block registration!
          setAuthBusy(false);
          toast.success("Proceeding to complete your team registration!");
          const names = authName.trim().split(" ");
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
          setEmail(authEmail.trim());
          if (authPhone.trim()) setPhone(authPhone.trim());
          setGuestProceed(true);
          setStep(1);
          return;
        }

        toast.success("Account created successfully!");
        setAuthBusy(false);

        const names = authName.trim().split(" ");
        setFirstName(names[0] || "");
        setLastName(names.slice(1).join(" ") || "");
        setEmail(authEmail.trim());
        if (authPhone.trim()) setPhone(authPhone.trim());
        setGuestProceed(true);
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
        } else if (signInErr.message.toLowerCase().includes("invalid login credentials")) {
          setAuthError(
            "Invalid email or password. If you originally signed in with Google, please click 'Continue with Google' above. Or click 'Forgot password?' below to reset."
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

  // Check if existing registration exists (Leader or Teammate)
  const existingRegistrations = getRegistrationsBySlug(opportunity.slug);
  const userIdentifier = user?.email || email;
  const existingReg = existingRegistrations.find(
    (r) =>
      (user?.id && r.userId === user.id) ||
      (userIdentifier && typeof r.email === "string" && r.email.toLowerCase() === userIdentifier.toLowerCase()) ||
      (userIdentifier &&
        Array.isArray(r.teammates) &&
        r.teammates.some(
          (t) =>
            typeof t === "object" &&
            t &&
            typeof t.email === "string" &&
            t.email.toLowerCase() === userIdentifier.toLowerCase()
        ))
  );

  useEffect(() => {
    let active = true;
    if (initialJoinCode) {
      setRegFlow("join");
      setTeamCodeInput(initialJoinCode);
      findTeamByCode(initialJoinCode).then((found) => {
        if (active) setMatchedTeam(found);
      });
    }
    return () => {
      active = false;
    };
  }, [initialJoinCode, open]);

  useEffect(() => {
    let active = true;
    if (teamCodeInput.trim().length >= 4) {
      findTeamByCode(teamCodeInput.trim()).then((found) => {
        if (active) setMatchedTeam(found);
      });
    } else {
      setMatchedTeam(null);
    }
    return () => {
      active = false;
    };
  }, [teamCodeInput]);

  useEffect(() => {
    if (!open) return;
    if (existingReg && !initialJoinCode) {
      setConfirmedReg(existingReg);
      setStep(3);
    } else {
      setConfirmedReg(null);
      setStep(1);

      // Pre-fill from logged-in builder profile only once on initial open
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Handle Join Team with Code
  const handleJoinTeamSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in or create an account first.");
      return;
    }
    if (!teamCodeInput.trim()) {
      toast.error("Please enter a valid Team Code.");
      return;
    }
    if (!firstName.trim()) {
      toast.error("Please enter your First Name.");
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

    setSubmitting(true);
    try {
      const fullParticipantName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const updated = await joinTeamWithCode(teamCodeInput.trim(), {
        userId: user.id,
        fullName: fullParticipantName,
        email: user.email || email.trim().toLowerCase(),
        phone: phone.trim(),
        collegeOrCompany: organization.trim(),
        department: joinDept.trim() || undefined,
        graduationYear: joinYear.trim() || undefined,
      });

      setConfirmedReg(updated);
      setStep(3);
      toast.success(`🎉 You've officially joined Team "${updated.teamName || "Squad"}"!`);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to join team.");
    } finally {
      setSubmitting(false);
    }
  };

  const teamCode = confirmedReg?.teamCode || confirmedReg?.id || "";

  const handleCopyTeamCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(teamCode);
      toast.success(`📋 Team Code "${teamCode}" copied to clipboard!`);
    } else {
      toast.info(teamCode);
    }
  };

  const handleCopyTeamInviteLink = () => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://www.vybedriven.in";
    const link = `${base}/opportunities/${opportunity.slug}?joinCode=${encodeURIComponent(teamCode)}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success("🔗 Team invite link copied to clipboard!");
    } else {
      toast.info(link);
    }
  };

  const handleShareTeamWhatsApp = () => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://www.vybedriven.in";
    const link = `${base}/opportunities/${opportunity.slug}?joinCode=${encodeURIComponent(teamCode)}`;
    const msg = encodeURIComponent(
      `🚀 Join my team "${confirmedReg?.teamName || "Squad"}" for ${opportunity.title} on Vybe Driven!\n\n` +
      `🔑 Official Team Code: ${teamCode}\n\n` +
      `🔗 Click link to join directly: ${link}\n\n` +
      `Simply create your account, enter our Team Code, and you'll instantly get your official verified pass! 🎟️`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

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
    setTeammates([...teammates, { name: "", email: "", phone: "", status: "pending", role: "member" }]);
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
      const teamSummary = teammates
        .map((t) => `${(t.name || "Member").trim()} (${(t.email || "").trim()})`)
        .join(", ");

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
        teammates:
          teamMode === "create_team"
            ? teammates.map((t) => ({ ...t, status: t.status || "pending", role: "member" as const }))
            : [],
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

    try {
      // Create high-res canvas (1200 x 675, 16:9 ratio)
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas context unavailable");
      }

      // 1. Dark futuristic gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, "#030804");
      bgGrad.addColorStop(0.5, "#08130a");
      bgGrad.addColorStop(1, "#030a05");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // 2. Ambient neon green corner glows
      const glowGrad = ctx.createRadialGradient(100, 100, 10, 100, 100, 350);
      glowGrad.addColorStop(0, "rgba(34, 197, 94, 0.18)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1200, 675);

      const stubGlow = ctx.createRadialGradient(1000, 350, 10, 1000, 350, 300);
      stubGlow.addColorStop(0, "rgba(34, 197, 94, 0.12)");
      stubGlow.addColorStop(1, "transparent");
      ctx.fillStyle = stubGlow;
      ctx.fillRect(0, 0, 1200, 675);

      // 3. Cyber grid lines
      ctx.strokeStyle = "rgba(34, 197, 94, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 40; x < 1160; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x, 635);
        ctx.stroke();
      }
      for (let y = 40; y < 635; y += 40) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(1160, y);
        ctx.stroke();
      }

      // 4. Main Card Border with Neon Glow
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(40, 40, 1120, 595);

      // Corner tech brackets
      ctx.fillStyle = "#22c55e";
      const bracketSize = 24;
      const bThickness = 5;
      // Top-Left
      ctx.fillRect(38, 38, bracketSize, bThickness);
      ctx.fillRect(38, 38, bThickness, bracketSize);
      // Top-Right
      ctx.fillRect(1162 - bracketSize, 38, bracketSize, bThickness);
      ctx.fillRect(1162 - bThickness, 38, bThickness, bracketSize);
      // Bottom-Left
      ctx.fillRect(38, 637 - bThickness, bracketSize, bThickness);
      ctx.fillRect(38, 637 - bracketSize, bThickness, bracketSize);
      // Bottom-Right
      ctx.fillRect(1162 - bracketSize, 637 - bThickness, bracketSize, bThickness);
      ctx.fillRect(1162 - bThickness, 637 - bracketSize, bThickness, bracketSize);

      // 5. Header Bar
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(42, 42, 1116, 75);
      ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
      ctx.beginPath();
      ctx.moveTo(42, 117);
      ctx.lineTo(1158, 117);
      ctx.stroke();

      // Logo: VYBE DRIVEN
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("VYBE", 75, 88);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("DRIVEN", 152, 88);

      // Live green dot
      ctx.beginPath();
      ctx.arc(265, 80, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e";
      ctx.fill();

      // Pass Badge Pill on Header Right
      ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
      ctx.fillRect(830, 60, 290, 36);
      ctx.strokeStyle = "#22c55e";
      ctx.strokeRect(830, 60, 290, 36);
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("OFFICIAL PARTICIPANT PASS", 860, 83);

      // 6. Stub Vertical Perforated / Dashed Line (at x = 800)
      ctx.strokeStyle = "rgba(34, 197, 94, 0.35)";
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(800, 118);
      ctx.lineTo(800, 580);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Notches at the perforation ends
      ctx.fillStyle = "#030804";
      ctx.beginPath();
      ctx.arc(800, 118, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(800, 580, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 7. Left Section: Event & Attendee Info (Constrained to x <= 760, stub starts at x = 800)
      // Event Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px sans-serif";
      const displayTitle =
        opportunity.title.length > 30
          ? opportunity.title.slice(0, 28) + "..."
          : opportunity.title;
      ctx.fillText(displayTitle, 75, 165, 680);

      // Event Meta Line 1: Organizer (Clean & Clamped to left column)
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "14px sans-serif";
      const orgText = `Organized by: ${opportunity.organizer}`;
      ctx.fillText(orgText, 75, 193, 680);

      // Event Meta Line 2: Format, Location & Event Date
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 13px sans-serif";
      const locText = `${opportunity.format} · ${opportunity.location}  |  ${opportunity.date}`;
      ctx.fillText(locText, 75, 218, 680);

      // Horizontal subtle line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(75, 245);
      ctx.lineTo(760, 245);
      ctx.stroke();

      // Attendee Detail Grid
      const drawField = (label: string, val: string, x: number, y: number) => {
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(label.toUpperCase(), x, y);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        const trimmed = val.length > 30 ? val.slice(0, 28) + "..." : val;
        ctx.fillText(trimmed, x, y + 24, 320);
      };

      drawField("Primary Attendee", confirmedReg.fullName || "Builder", 75, 280);
      drawField("Contact Email", confirmedReg.email || "-", 430, 280);

      drawField(
        "College / Organization",
        confirmedReg.collegeOrCompany || "-",
        75,
        360
      );
      drawField(
        "Participation Mode",
        confirmedReg.teamType === "team"
          ? `Team (${confirmedReg.teamName || "Squad"})`
          : "Solo Builder",
        430,
        360
      );

      drawField("Phone / WhatsApp", confirmedReg.phone || "-", 75, 440);
      drawField("Category", confirmedReg.userType || "College Student", 430, 440);

      // Verified Status Ribbon
      ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
      ctx.fillRect(75, 510, 240, 36);
      ctx.strokeStyle = "#22c55e";
      ctx.strokeRect(75, 510, 240, 36);
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("● VERIFIED & CONFIRMED", 95, 533);

      // 8. Right Section: Pass Stub & Barcode
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("REGISTRATION ID", 830, 170);

      ctx.fillStyle = "#22c55e";
      ctx.font = "900 28px monospace";
      ctx.fillText(confirmedReg.id, 830, 205);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "13px sans-serif";
      ctx.fillText(
        `Issued: ${new Date(confirmedReg.createdAt).toLocaleDateString()}`,
        830,
        235
      );

      // Simulated High-Tech Barcode Graphic
      const barX = 830;
      const barY = 270;
      const barW = 285;
      const barH = 130;
      ctx.fillStyle = "#000000";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
      ctx.strokeRect(barX, barY, barW, barH);

      // Draw stylized barcode lines
      let currX = barX + 15;
      const seed = confirmedReg.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      let rand = seed;
      const nextRand = () => {
        rand = (rand * 9301 + 49297) % 233280;
        return rand / 233280;
      };

      while (currX < barX + barW - 18) {
        const lineW = nextRand() > 0.5 ? 3 : 1.5;
        const isNeon = nextRand() > 0.75;
        ctx.fillStyle = isNeon ? "#22c55e" : "#ffffff";
        ctx.fillRect(currX, barY + 12, lineW, barH - 40);
        currX += lineW + (nextRand() > 0.4 ? 4 : 2);
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`* ${confirmedReg.id} *`, barX + 65, barY + barH - 12);

      // Scan Instructions
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      ctx.fillText("Present this badge at event check-in.", 830, 435);
      ctx.fillText("Valid for entry with photo ID.", 830, 455);

      // 9. Card Footer
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(42, 580, 1116, 53);
      ctx.strokeStyle = "rgba(34, 197, 94, 0.2)";
      ctx.beginPath();
      ctx.moveTo(42, 580);
      ctx.lineTo(1158, 580);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "12px sans-serif";
      ctx.fillText(
        "Vybe Driven Platform  ·  Official Event Pass  ·  www.vybedriven.in  ·  Contact: vybedriven@gmail.com",
        75,
        612
      );

      // Export Canvas to PNG Blob and Download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create pass image blob");
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `pass-${confirmedReg.id}-${opportunity.slug}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("🎟️ Official Digital Pass downloaded as PNG image!");
      }, "image/png");
    } catch (err) {
      console.error("Canvas pass generation failed, falling back to summary:", err);
      // Fallback to text file only if browser canvas is restricted
      const textContent = `========================================================
VYBE DRIVEN — OFFICIAL PARTICIPANT CONFIRMATION PASS
========================================================
Event: ${opportunity.title}
Format: ${opportunity.format}
Location: ${opportunity.location}
Date: ${opportunity.date}

REGISTRATION DETAILS:
Registration ID : ${confirmedReg.id}
Registration Date: ${new Date(confirmedReg.createdAt).toLocaleString()}
Full Name       : ${confirmedReg.fullName}
Email           : ${confirmedReg.email}
Phone           : ${confirmedReg.phone}
College / Org   : ${confirmedReg.collegeOrCompany}
Participation   : ${confirmedReg.teamType.toUpperCase()}
Team Name       : ${confirmedReg.teamName || "Solo Builder"}
Status          : ${confirmedReg.status}

Official Desk: hello@goabuilds.com
Platform Support: vybedriven@gmail.com
========================================================`;
      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pass-${confirmedReg.id}-${opportunity.slug}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Confirmation pass downloaded.");
    }
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
        {!user && !guestProceed && step !== 3 ? (
          <div className="mt-4 space-y-5 text-xs sm:text-sm">
            <div className="rounded-2xl border border-neon/40 bg-neon/5 p-4 sm:p-5">
              <div className="flex items-center gap-2.5 text-neon font-bold text-sm sm:text-base">
                <Sparkles className="size-5 shrink-0" />
                <span>Quick Builder Registration</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Sign in with Google for 1-click access, or register your team directly below without a password.
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

            {/* Direct Registration Option */}
            <div className="rounded-2xl border-2 border-dashed border-neon/50 bg-card p-3.5 text-center shadow-sm">
              <p className="text-xs text-muted-foreground mb-2">
                Don&apos;t want to use Google or create a password?
              </p>
              <Button
                type="button"
                onClick={() => {
                  setGuestProceed(true);
                  setStep(1);
                }}
                className="w-full rounded-xl bg-neon text-primary-foreground font-black text-xs sm:text-sm py-2.5 shadow-glow hover:brightness-105"
              >
                ⚡ Register Directly (No Password Needed) →
              </Button>
            </div>

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
                      placeholder="e.g. Alex Johnson"
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

        {/* STEP 1: BASIC & USER DETAILS OR JOIN WITH CODE */}
        {(user || guestProceed) && step === 1 && (
          <div className="mt-4 space-y-4 text-xs sm:text-sm">
            {/* Registration Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface p-1.5">
              <button
                type="button"
                onClick={() => setRegFlow("create")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition cursor-pointer ${
                  regFlow === "create"
                    ? "bg-neon text-black shadow-glow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="size-3.5" />
                <span>Create Team / Solo</span>
              </button>
              <button
                type="button"
                onClick={() => setRegFlow("join")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition cursor-pointer ${
                  regFlow === "join"
                    ? "bg-neon text-black shadow-glow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="size-3.5" />
                <span>Join Team with Code 🤝</span>
              </button>
            </div>

            {regFlow === "join" ? (
              /* JOIN EXISTING TEAM WITH CODE FORM */
              <form onSubmit={handleJoinTeamSubmit} className="space-y-4 pt-1">
                <div className="rounded-2xl border border-neon/40 bg-neon/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-neon font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="size-4" /> Join Team via Code
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your Team Leader's Team Code below. Once submitted, your profile will immediately join their team roster with a verified pass!
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      Team Code <span className="text-neon">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={teamCodeInput}
                      onChange={(e) => setTeamCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. GB27-82035"
                      className="w-full rounded-xl border border-neon/50 bg-background px-3.5 py-2.5 font-mono text-sm uppercase text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                    />
                  </div>

                  {matchedTeam ? (
                    <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-3 text-xs text-emerald-300 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>✅ Team Found: {matchedTeam.teamName}</span>
                        <span className="font-mono">{1 + (matchedTeam.teammates?.length || 0)}/4 Members</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Leader: {matchedTeam.fullName} · {matchedTeam.collegeOrCompany}
                      </p>
                    </div>
                  ) : teamCodeInput.trim().length >= 4 ? (
                    <p className="text-[11px] text-amber-400">
                      Searching team code... Please verify the code with your Team Leader.
                    </p>
                  ) : null}
                </div>

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
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      Email Address <span className="text-neon">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email || user?.email || ""}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      Mobile Number <span className="text-neon">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-border bg-surface overflow-hidden">
                      <span className="flex items-center gap-1 bg-surface-2 px-3 py-2.5 text-xs font-bold text-foreground border-r border-border shrink-0 select-none">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm text-foreground outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      College / Organization <span className="text-neon">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Your college or organization"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      Branch / Department
                    </label>
                    <input
                      type="text"
                      value={joinDept}
                      onChange={(e) => setJoinDept(e.target.value)}
                      placeholder="e.g. Computer Engineering"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/70">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="rounded-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !matchedTeam}
                    className="rounded-full bg-gradient-brand text-primary-foreground font-bold px-7 shadow-glow hover:brightness-110"
                  >
                    {submitting ? "Joining..." : "Join Team & Get Pass 🚀"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleProceedToTeam} className="space-y-5">
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
      </div>
    )}

        {/* STEP 2: TEAM SETUP & SQUAD FORMATION */}
        {(user || guestProceed) && step === 2 && (
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

                {/* Teammates Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-neon" />
                    <span className="font-bold text-foreground">
                      Team Roster Formation
                    </span>
                  </div>
                  <span className="rounded-full bg-neon/15 px-2.5 py-0.5 text-[11px] font-bold text-neon">
                    Team Code Instant Joining
                  </span>
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

                {/* Team Code Explanatory Card */}
                <div className="rounded-xl border border-neon/30 bg-gradient-to-br from-neon/10 via-surface to-surface p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-neon">
                    <Sparkles className="size-4" />
                    <span>How Teammates Will Join Your Team</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Once you submit your registration, your team will get a unique <strong>Team Code</strong> &amp; <strong>Invite Link</strong>.
                  </p>
                  <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Share the Team Code on WhatsApp with your friends.</li>
                    <li>They will open Vybe Driven, click <strong className="text-foreground">"Join Team with Code"</strong>, and enter your code.</li>
                    <li>They will instantly get their verified entry pass and appear on your official roster — zero email verification hassle!</li>
                  </ul>
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

            {/* If Team registration, show Team Code & Share Invite */}
            {confirmedReg.teamType === "team" && (
              <div className="rounded-2xl border-2 border-neon/50 bg-gradient-to-br from-neon/15 via-surface-2 to-surface p-4 sm:p-5 text-left space-y-3.5 shadow-glow-soft">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 sm:size-5 text-neon" />
                    <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-neon">
                      Official Team Code &amp; Teammate Invite
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-muted-foreground truncate">
                    Squad: <span className="text-foreground">{confirmedReg.teamName}</span> ({1 + (confirmedReg.teammates?.length || 0)}/4)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neon/30 bg-black/50 p-3.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                      Team Code (Share with your friends)
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-neon select-all">
                      {confirmedReg.teamCode || confirmedReg.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCopyTeamCode}
                      className="rounded-lg bg-neon/15 text-neon border border-neon/30 hover:bg-neon/25 text-xs font-bold"
                    >
                      <Copy className="size-3.5 mr-1" /> Copy Code
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleShareTeamWhatsApp}
                      className="rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold"
                    >
                      <Share2 className="size-3.5 mr-1" /> WhatsApp Invite
                    </Button>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  💡 Teammates simply visit Vybe Driven, click <strong className="text-foreground">&quot;Join Team with Code&quot;</strong>, enter this code, and they&apos;ll instantly get verified on your roster and unlock their official entry pass!
                </p>
              </div>
            )}

            {/* Pass Lock Notice when team has fewer than 2 members */}
            {confirmedReg.teamType === "team" && (1 + (confirmedReg.teammates?.length || 0)) < 2 && (
              <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-black to-amber-950/20 p-4 sm:p-5 text-left space-y-2 shadow-glow-soft">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base">
                  <Lock className="size-5 shrink-0" />
                  <span>Entry Pass Locked — Minimum 2 Members Required</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your squad currently has <strong>1 member</strong> ({confirmedReg.fullName}). For the offline hackathon, a team must have <strong>at least 2 members</strong> (and up to 4).
                  Your official scannable entry pass and QR barcode will <strong>automatically unlock</strong> as soon as your teammate joins using your Team Code!
                </p>
              </div>
            )}

            {/* Official Pass Card (Only fully shown when unlocked) */}
            {confirmedReg.teamType === "team" && (1 + (confirmedReg.teammates?.length || 0)) < 2 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-surface/50 p-6 text-center space-y-2 opacity-75">
                <Lock className="size-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-foreground">Digital Pass &amp; Entry Barcode Locked</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Share your team code <strong>{confirmedReg.teamCode || confirmedReg.id}</strong> on WhatsApp. Once teammate #2 joins, the pass will activate instantly.
                </p>
              </div>
            ) : (
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

                    {confirmedReg.teamType === "team" && (1 + (confirmedReg.teammates?.length || 0)) >= 2 ? (
                      <div className="pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setIdeaModalOpen(true)}
                          className="w-full rounded-xl bg-neon text-primary-foreground font-black text-xs py-2 shadow-glow hover:brightness-105"
                        >
                          <Sparkles className="size-3.5 mr-1" />
                          {confirmedReg.submission?.pptUrl
                            ? "View / Edit Round 1 PPT Deck ✓"
                            : "Submit Round 1 Idea (PPT Deck) 🚀"}
                        </Button>
                      </div>
                    ) : confirmedReg.teamType === "team" ? (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-[11px] text-amber-300">
                        🔒 Round 1 PPT submission unlocks once teammate #2 joins.
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>2. 36-Hour Offline Hackathon — Grand Finale</span>
                      <span className="text-[11px] font-mono text-foreground font-semibold">To be announced (TBA)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

              {/* WhatsApp Community Link - Goa Buildathon dedicated link */}
              {((opportunity.slug === "goa-buildathon-2027") || opportunity.groupUrl) && (
                <a
                  href={
                    opportunity.slug === "goa-buildathon-2027"
                      ? "https://chat.whatsapp.com/HXLGLzUJ6G2Hr1FL8RE7yW"
                      : (opportunity.groupUrl || "https://chat.whatsapp.com/FTO9jg5AgW3CSZuA3PZVIU?s=cl&p=a&iam=2")
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                >
                  <MessageCircle className="size-3.5" /> Join WhatsApp Community
                </a>
              )}

              {confirmedReg.teamType === "team" && (1 + (confirmedReg.teammates?.length || 0)) < 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="w-full sm:w-auto rounded-full text-xs font-semibold text-muted-foreground border-border/60 opacity-60 cursor-not-allowed"
                >
                  <Lock className="size-3.5 mr-1" /> Pass Locked (Needs 2+ Members)
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadPassSummary}
                  className="w-full sm:w-auto rounded-full text-xs font-semibold text-foreground hover:border-neon hover:text-neon"
                >
                  <Download className="size-3.5 mr-1 text-neon" /> Download Digital Pass (PNG)
                </Button>
              )}
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

        <IdeaSubmissionModal
          registration={confirmedReg}
          open={ideaModalOpen}
          onOpenChange={setIdeaModalOpen}
          onSubmitted={() => {
            if (confirmedReg) {
              const fresh = getRegistrationsBySlug(opportunity.slug).find(
                (r) => r.id === confirmedReg.id
              );
              if (fresh) setConfirmedReg(fresh);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
