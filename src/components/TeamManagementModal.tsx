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
  Users,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Copy,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  X,
} from "lucide-react";
import {
  updateTeamRoster,
  confirmTeammateInvitation,
  findOpportunity,
  isPlatformAdmin,
  mergeRemoteRegistrations,
  getStoredRegistrations,
  type EventRegistration,
  type TeammateDetail,
} from "@/data/events-store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { IdeaSubmissionModal } from "@/components/IdeaSubmissionModal";

interface TeamManagementModalProps {
  registration: EventRegistration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updated: EventRegistration) => void;
}

export function TeamManagementModal({
  registration,
  open,
  onOpenChange,
  onUpdated,
}: TeamManagementModalProps) {
  const { user } = useAuth();

  const [teamName, setTeamName] = useState("");
  const [editingTeamName, setEditingTeamName] = useState(false);
  const [lookingForTeammates, setLookingForTeammates] = useState(false);
  const [teammates, setTeammates] = useState<TeammateDetail[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);

  // New member form fields
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newYear, setNewYear] = useState("");

  const [saving, setSaving] = useState(false);

  // Initialize from registration and fetch latest cloud state
  useEffect(() => {
    if (registration) {
      setTeamName(registration.teamName || "My Squad");
      setLookingForTeammates(Boolean(registration.lookingForTeammates));
      setTeammates(
        (registration.teammates || []).map((t) => ({
          ...t,
          status: t.status || "pending",
        }))
      );
      setShowAddForm(false);
    }

    if (open && registration?.id) {
      import("@/integrations/supabase/client")
        .then(({ supabase }) => {
          supabase
            .from("registrations" as any)
            .select("*")
            .eq("id", registration.id)
            .maybeSingle()
            .then(({ data }) => {
              if (data) {
                mergeRemoteRegistrations([data]);
                const fresh = getStoredRegistrations().find((r) => r.id === registration.id);
                if (fresh) {
                  setTeamName(fresh.teamName || "My Squad");
                  setLookingForTeammates(Boolean(fresh.lookingForTeammates));
                  setTeammates(
                    (fresh.teammates || []).map((t) => ({
                      ...t,
                      status: t.status || "pending",
                    }))
                  );
                }
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    }
  }, [registration, open]);

  if (!registration) return null;

  const opportunity = findOpportunity(registration.opportunitySlug);
  const isLeader = Boolean(
    user &&
      ((user.id && registration.userId === user.id) ||
        (user.email && registration.email.toLowerCase() === user.email.toLowerCase()))
  );

  const isEventClosed = Boolean(
    opportunity &&
      (opportunity.status === "Event full" || opportunity.status === "Sold out")
  );

  const isTeammate = Boolean(
    user?.email &&
      registration.teammates?.some(
        (t) =>
          typeof t === "object" &&
          t &&
          typeof t.email === "string" &&
          t.email.toLowerCase() === user.email!.toLowerCase()
      )
  );

  const isAdmin = isPlatformAdmin(user);

  // Anyone in the squad (Leader, Members) or Platform Admin can manage & invite teammates!
  const canManageTeam = !isEventClosed && (isLeader || isTeammate || isAdmin);

  const totalMembers = 1 + teammates.length;
  const maxMembers = 4;
  const remainingSlots = Math.max(0, maxMembers - totalMembers);

  // Add Member to local list
  const handleAddMember = (e: FormEvent) => {
    e.preventDefault();
    if (teammates.length >= 3) {
      toast.error("Maximum 4 members allowed per team.");
      return;
    }
    if (!newName.trim()) {
      toast.error("Please enter teammate's full name.");
      return;
    }
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast.error("Please enter a valid teammate email address.");
      return;
    }

    const target = newEmail.trim().toLowerCase();
    const alreadyAdded =
      teammates.some(
        (t) =>
          typeof t === "object" &&
          t &&
          typeof t.email === "string" &&
          t.email.toLowerCase() === target
      ) ||
      (typeof registration.email === "string" &&
        registration.email.toLowerCase() === target);

    if (alreadyAdded) {
      toast.error("A member with this email address is already in the team.");
      return;
    }

    const newTeammate: TeammateDetail = {
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || undefined,
      collegeOrCompany: newCollege.trim() || undefined,
      department: newDept.trim() || undefined,
      graduationYear: newYear.trim() || undefined,
      status: "pending",
      role: "member",
    };

    setTeammates([...teammates, newTeammate]);

    // Reset inputs
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewCollege("");
    setNewDept("");
    setNewYear("");
    setShowAddForm(false);
    toast.success(`${newTeammate.name} added! Click "Save & Update Team Details" below to save.`);
  };

  const handleRemoveMember = (index: number) => {
    const memberName = teammates[index]?.name || "Member";
    setTeammates(teammates.filter((_, i) => i !== index));
    toast.info(`${memberName} removed from list. Remember to save changes.`);
  };

  const teamCode = registration.teamCode || registration.id;

  const getTeamInviteLink = () => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://www.vybedriven.in";
    return `${base}/opportunities/${registration.opportunitySlug}?joinCode=${encodeURIComponent(teamCode)}`;
  };

  const handleCopyTeamCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(teamCode);
      toast.success(`📋 Team Code "${teamCode}" copied to clipboard!`);
    } else {
      toast.info(teamCode);
    }
  };

  const handleCopyTeamInviteLink = () => {
    const link = getTeamInviteLink();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success("🔗 Team invite link copied to clipboard!");
    } else {
      toast.info(link);
    }
  };

  const handleShareTeamOnWhatsApp = () => {
    const link = getTeamInviteLink();
    const msg = encodeURIComponent(
      `🚀 Join my team "${teamName}" for ${registration.opportunityTitle} on Vybe Driven!\n\n` +
      `🔑 Official Team Code: ${teamCode}\n\n` +
      `🔗 Click link to join directly: ${link}\n\n` +
      `Simply sign in, enter our Team Code, and you'll instantly get your verified participant pass! 🎟️`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  // Generate Invite Link & Mailto
  const getInviteLink = (memberEmail: string) => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://www.vybedriven.in";
    return `${base}/opportunities/${registration.opportunitySlug}?confirmTeam=${registration.id}&email=${encodeURIComponent(
      memberEmail
    )}`;
  };

  const handleCopyInviteLink = (memberEmail: string) => {
    const link = getInviteLink(memberEmail);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success("📋 Team invitation link copied to clipboard!");
    } else {
      toast.info(link);
    }
  };

  const handleSendEmailInvite = (member: TeammateDetail) => {
    const link = getInviteLink(member.email);
    const subject = encodeURIComponent(`Invitation to join Team "${teamName}" for ${registration.opportunityTitle}`);
    const body = encodeURIComponent(
      `Hey ${member.name},\n\n` +
      `You have been invited by ${registration.fullName} to join Team "${teamName}" for ${registration.opportunityTitle} on Vybe Driven!\n\n` +
      `Click the link below to confirm and join the official team roster:\n${link}\n\n` +
      `Once confirmed, your official participant pass will be available in your Vybe Driven builder profile.\n\n` +
      `See you at the hackathon!\n— Team Vybe Driven`
    );
    window.open(`mailto:${member.email}?subject=${subject}&body=${body}`, "_blank");
    toast.success(`Mail client opened to invite ${member.name}!`);
  };

  // Save changes to store and Supabase
  const handleSaveTeam = () => {
    if (!canManageTeam) {
      toast.error("Only team members or administrators can modify team details.");
      return;
    }
    if (isEventClosed) {
      toast.error("Hackathon registration is closed. Team roster has been locked.");
      return;
    }
    if (!teamName.trim()) {
      toast.error("Please enter a valid team name.");
      return;
    }

    setSaving(true);
    try {
      const updated = updateTeamRoster(
        registration.id,
        {
          teamName: teamName.trim(),
          teammates,
          lookingForTeammates,
        },
        user
      );

      toast.success("✅ Team details successfully updated and saved!");
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update team details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto border-border bg-[#070e0a] p-5 sm:p-7 text-foreground shadow-2xl">
        <DialogHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon">
                <Users className="size-4" /> Team Management &amp; Roster Hub
              </div>
              <DialogTitle className="mt-1 text-xl sm:text-2xl font-black text-foreground">
                {registration.opportunityTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Manage your team roster, invite friends, and track member confirmations in real-time.
              </DialogDescription>
            </div>

            {/* Lock / Open Badge */}
            <div className="self-start sm:self-auto">
              {isEventClosed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">
                  🔒 Roster Locked (Event Closed)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/50 bg-neon/15 px-3 py-1 text-xs font-bold text-neon shadow-glow-soft">
                  <CheckCircle2 className="size-3.5" /> Editable until Deadline
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Team Name Header Card */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Team Name
              </span>
              {editingTeamName && canManageTeam ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="rounded-lg border border-neon bg-background px-3 py-1.5 text-base font-bold text-foreground outline-none focus:ring-2 focus:ring-neon"
                    placeholder="Enter team name"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => setEditingTeamName(false)}
                    className="rounded-lg bg-neon text-black text-xs font-bold px-3"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {teamName}
                  </h3>
                  {canManageTeam && (
                    <button
                      type="button"
                      onClick={() => setEditingTeamName(true)}
                      className="rounded-full p-1 text-muted-foreground hover:bg-surface-2 hover:text-neon transition"
                      title="Edit Team Name"
                    >
                      <Edit2 className="size-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Teammates Counter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold">
                <span className="text-muted-foreground">Teammates: </span>
                <span className="font-bold text-foreground">
                  ({totalMembers}/{maxMembers})
                </span>
              </div>
            </div>
          </div>

          {/* Team Code & Direct Share Box */}
          <div className="rounded-2xl border-2 border-neon/40 bg-gradient-to-br from-neon/15 via-emerald-950/30 to-black p-4 sm:p-5 shadow-glow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-neon flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> Official Team Code
                </span>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-foreground tracking-wider bg-black/60 px-4 py-1 rounded-xl border border-neon/50 shadow-inner">
                    {teamCode}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyTeamCode}
                    className="rounded-full bg-neon text-black font-extrabold text-xs shadow-glow hover:brightness-110"
                  >
                    <Copy className="size-3.5 mr-1" /> Copy Code
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Give this code to your teammates. When they click "Register" and choose <strong className="text-foreground">"Join Team with Code"</strong>, they will instantly appear in your roster as verified members!
                </p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTeamInviteLink}
                  className="rounded-full border-neon/40 text-xs font-bold text-neon hover:bg-neon hover:text-black"
                >
                  <Copy className="size-3.5 mr-1.5" /> Copy Invite Link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleShareTeamOnWhatsApp}
                  className="rounded-full bg-[#25D366] text-white font-extrabold text-xs hover:brightness-110 shadow-sm"
                >
                  <MessageCircle className="size-3.5 mr-1.5" /> Share on WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Round 1 PPT Submission Quick Access */}
          {totalMembers >= 2 ? (
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-glow-soft">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Round 1 Live: Idea Submission (PPT Round)
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {registration.submission?.pptUrl
                    ? `✓ Submitted: "${registration.submission.projectTitle}" (${registration.submission.track})`
                    : "Squad size is 2+! Any verified squad member can submit the PPT deck."}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setIdeaModalOpen(true)}
                className="rounded-xl bg-neon text-primary-foreground font-black text-xs px-4 py-2.5 shadow-glow hover:brightness-105 shrink-0"
              >
                {registration.submission?.pptUrl ? "Edit PPT Deck ✓" : "Submit Round 1 PPT 🚀"}
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-400 shrink-0" />
              <span>
                <strong>Round 1 PPT Locked:</strong> Share your team code above with at least 1 friend to unlock PPT submission.
              </span>
            </div>
          )}

          {/* Members Roster List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>TEAM MEMBERS &amp; INVITATIONS</span>
              {remainingSlots > 0 && canManageTeam && (
                <span className="text-neon">You can add {remainingSlots} more member{remainingSlots > 1 ? "s" : ""}</span>
              )}
            </div>

            {/* 1. TEAM LEADER (Always Green & Verified) */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 transition shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-lg border border-emerald-500/40 shrink-0">
                    {(registration.fullName || "L").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-foreground">
                        {registration.fullName}
                      </h4>
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                        Team Leader
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="size-3 text-emerald-400" /> {registration.email}
                      </span>
                      {registration.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3 text-emerald-400" /> {registration.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3 text-emerald-400" /> {registration.collegeOrCompany}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="size-3.5 text-emerald-400" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* 2. TEAMMATES LIST */}
            {teammates.map((member, index) => {
              const isVerified = member.status === "verified";
              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-4 transition shadow-sm ${
                    isVerified
                      ? "border-emerald-500/40 bg-emerald-950/20"
                      : "border-amber-500/40 bg-amber-950/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`grid size-11 place-items-center rounded-xl font-extrabold text-lg border shrink-0 ${
                          isVerified
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        }`}
                      >
                        {(member.name || "M").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-foreground">
                            {member.name}
                          </h4>
                          <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            Member #{index + 2}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" /> {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3" /> {member.phone}
                            </span>
                          )}
                          {member.collegeOrCompany && (
                            <span className="flex items-center gap-1">
                              <Building2 className="size-3" /> {member.collegeOrCompany}
                            </span>
                          )}
                          {member.department && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="size-3" /> {member.department} ({member.graduationYear || "Grad"})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Leader Controls */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="size-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
                          <Clock className="size-3.5" /> Confirmation Pending
                        </span>
                      )}

                      {/* Action buttons */}
                      {canManageTeam && (
                        <div className="flex items-center gap-1">
                          {!isVerified && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendEmailInvite(member)}
                                className="rounded-lg border border-border bg-surface p-1.5 text-muted-foreground hover:border-neon hover:text-neon transition"
                                title="Send / Resend Email Invitation"
                              >
                                <Send className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyInviteLink(member.email)}
                                className="rounded-lg border border-border bg-surface p-1.5 text-muted-foreground hover:border-neon hover:text-neon transition"
                                title="Copy 1-Click Invite Link"
                              >
                                <Copy className="size-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            className="rounded-lg border border-border bg-surface p-1.5 text-muted-foreground hover:border-red-500 hover:text-red-400 transition"
                            title="Remove Member"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Invite Teammates via Team Code notice */}
            {canManageTeam && remainingSlots > 0 ? (
              <div className="rounded-2xl border border-neon/40 bg-gradient-to-br from-neon/10 via-surface-2 to-surface p-4 sm:p-5 space-y-3 shadow-glow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-neon" />
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {remainingSlots} Teammate Slot{remainingSlots > 1 ? "s" : ""} Available
                    </span>
                  </div>
                  <span className="rounded-full bg-neon/15 px-2.5 py-0.5 text-[10px] font-bold text-neon">
                    Team Code Instant Joining
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Share your <strong>Team Code</strong> or <strong>Invite Link</strong> with your teammates. They will open Vybe Driven, click &quot;Join Team with Code&quot;, and enter your code to join your squad with zero email hassles!
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neon/30 bg-black/60 p-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Official Team Code
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-neon select-all">
                      {registration.teamCode || registration.id}
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
                      onClick={handleShareTeamOnWhatsApp}
                      className="rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold"
                    >
                      <MessageCircle className="size-3.5 mr-1" /> WhatsApp Invite
                    </Button>
                  </div>
                </div>
              </div>
            ) : canManageTeam && remainingSlots === 0 ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-xs font-bold text-emerald-400">
                🎉 Team Roster Full (4/4 Members Verified)
              </div>
            ) : null}
          </div>

          {/* Unstop Legend */}
          <div className="flex flex-wrap items-center gap-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>Verified / Joined</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400" />
              <span>Confirmation Pending (Click send mail)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-400" />
              <span>Locked after deadline</span>
            </span>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-xs"
            >
              Close
            </Button>

            {canManageTeam && (
              <Button
                type="button"
                disabled={saving}
                onClick={handleSaveTeam}
                className="rounded-full bg-gradient-brand text-primary-foreground font-bold px-6 text-xs shadow-glow hover:brightness-110"
              >
                {saving ? "Saving Changes..." : "Save & Update Team Details"}
              </Button>
            )}
          </div>
        </div>

        <IdeaSubmissionModal
          registration={registration}
          open={ideaModalOpen}
          onOpenChange={setIdeaModalOpen}
          onSubmitted={() => {
            if (registration) {
              const fresh = getStoredRegistrations().find((r) => r.id === registration.id);
              if (fresh && onUpdated) onUpdated(fresh);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

