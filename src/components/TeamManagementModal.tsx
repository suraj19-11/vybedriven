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
  X,
} from "lucide-react";
import {
  updateTeamRoster,
  confirmTeammateInvitation,
  findOpportunity,
  isPlatformAdmin,
  type EventRegistration,
  type TeammateDetail,
} from "@/data/events-store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

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

  // New member form fields
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newYear, setNewYear] = useState("");

  const [saving, setSaving] = useState(false);

  // Initialize from registration
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
  }, [registration]);

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

            {/* Teammates Counter & Looking for teammates toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold">
                <span className="text-muted-foreground">Teammates: </span>
                <span className="font-bold text-foreground">
                  ({totalMembers}/{maxMembers})
                </span>
              </div>

              {canManageTeam && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground select-none">
                  <span>Looking for teammates:</span>
                  <input
                    type="checkbox"
                    checked={lookingForTeammates}
                    onChange={(e) => setLookingForTeammates(e.target.checked)}
                    className="size-4 accent-neon rounded cursor-pointer"
                  />
                </label>
              )}
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

            {/* Add Teammate Form or Button */}
            {canManageTeam && remainingSlots > 0 && (
              <>
                {showAddForm ? (
                  <form
                    onSubmit={handleAddMember}
                    className="rounded-2xl border border-neon/40 bg-surface-2/90 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <UserPlus className="size-4 text-neon" /> Add Teammate #{totalMembers + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Alex Sharma"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <input
                          required
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="teammate@gmail.com"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Mobile / WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="10-digit number"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          College / Company / Job
                        </label>
                        <input
                          type="text"
                          value={newCollege}
                          onChange={(e) => setNewCollege(e.target.value)}
                          placeholder="e.g. IIT Bombay / Google"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Department / Branch
                        </label>
                        <input
                          type="text"
                          value={newDept}
                          onChange={(e) => setNewDept(e.target.value)}
                          placeholder="e.g. Computer Engineering"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Graduation Year
                        </label>
                        <input
                          type="text"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          placeholder="e.g. 2026 or 2027"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-neon"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                        className="rounded-full text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="rounded-full bg-neon text-black font-bold text-xs shadow-glow hover:brightness-110"
                      >
                        Add Member to Roster
                      </Button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full rounded-2xl border-2 border-dashed border-border py-4 px-4 text-center text-xs sm:text-sm font-bold text-muted-foreground hover:border-neon hover:text-neon hover:bg-neon/5 transition flex items-center justify-center gap-2"
                  >
                    <UserPlus className="size-4" />
                    <span>+ Add {totalMembers === 1 ? "2nd" : totalMembers === 2 ? "3rd" : "4th"} Member</span>
                  </button>
                )}
              </>
            )}
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
      </DialogContent>
    </Dialog>
  );
}

