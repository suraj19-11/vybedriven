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
  Sparkles,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Link as LinkIcon,
  Github,
  Users,
} from "lucide-react";
import {
  saveIdeaSubmission,
  type EventRegistration,
  type IdeaSubmission,
} from "@/data/events-store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface IdeaSubmissionModalProps {
  registration: EventRegistration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

const TRACK_OPTIONS = [
  "Artificial Intelligence & AI Agents",
  "Web Development & Software Engineering",
  "Automation & Workflow Optimization",
  "Data Science & Analytics",
  "Software & Developer Tools",
  "Electronics & Emerging Technology",
  "Open Innovation",
];

export function IdeaSubmissionModal({
  registration,
  open,
  onOpenChange,
  onSubmitted,
}: IdeaSubmissionModalProps) {
  const { user } = useAuth();

  const [projectTitle, setProjectTitle] = useState("");
  const [track, setTrack] = useState(TRACK_OPTIONS[0]);
  const [summary, setSummary] = useState("");
  const [pptUrl, setPptUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Load existing submission data when opened
  useEffect(() => {
    if (!open || !registration) return;

    if (registration.submission) {
      setProjectTitle(registration.submission.projectTitle || "");
      setTrack(registration.submission.track || TRACK_OPTIONS[0]);
      setSummary(registration.submission.summary || "");
      setPptUrl(registration.submission.pptUrl || "");
      setDemoUrl(registration.submission.demoUrl || "");
    } else {
      setProjectTitle(registration.projectIdea || "");
      setTrack(TRACK_OPTIONS[0]);
      setSummary("");
      setPptUrl("");
      setDemoUrl("");
    }
  }, [open, registration?.id, registration?.submission]);

  if (!registration) return null;

  const totalMembers = 1 + (registration.teammates?.length || 0);
  const isMinMembersMet = totalMembers >= 2;
  const isSubmitted = Boolean(registration.submission?.pptUrl);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isMinMembersMet) {
      toast.error("At least 2 team members are required to submit Round 1!");
      return;
    }

    const trimmedTitle = projectTitle.trim();
    const trimmedSummary = summary.trim();
    const trimmedPpt = pptUrl.trim();

    if (!trimmedTitle) {
      toast.error("Please enter your Project / Idea Title.");
      return;
    }
    if (!trimmedPpt) {
      toast.error("Please provide your Google Drive, Canva, or Slides presentation link.");
      return;
    }
    if (!trimmedPpt.startsWith("http://") && !trimmedPpt.startsWith("https://")) {
      toast.error("Please enter a valid URL starting with https://");
      return;
    }

    try {
      setSaving(true);
      const submitterName = user?.user_metadata?.full_name || user?.email || registration.fullName;

      saveIdeaSubmission(
        registration.id,
        {
          projectTitle: trimmedTitle,
          track,
          summary: trimmedSummary,
          pptUrl: trimmedPpt,
          demoUrl: demoUrl.trim() || undefined,
          submittedBy: submitterName,
        }
      );

      toast.success(
        isSubmitted
          ? "Round 1 submission updated successfully!"
          : "🎉 Round 1 Idea Submission submitted successfully for your squad!"
      );
      onSubmitted?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save submission. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-card border-border p-5 sm:p-7">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/50 bg-neon/15 px-3 py-1 text-[11px] font-bold text-neon uppercase tracking-wider">
              <span className="size-1.5 rounded-full bg-neon animate-pulse" />
              Round 1 Live · PPT Round
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Deadline: Dec 31, 2026
            </span>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Idea Submission — Goa Buildathon '27
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Submit your team's proposed solution deck. Both team leader and verified teammates can submit or update this entry before the deadline.
          </DialogDescription>
        </DialogHeader>

        {/* Team Context Banner */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-xs">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-neon" />
            <span className="text-muted-foreground">Team:</span>
            <span className="font-extrabold text-foreground">
              {registration.teamName || "Your Squad"}
            </span>
            <span className="rounded-md bg-neon/15 px-2 py-0.5 text-[10px] font-bold text-neon font-mono">
              Code: {registration.teamCode || registration.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${
                isMinMembersMet ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="font-bold text-foreground">
              {totalMembers}/4 Members
            </span>
            {!isMinMembersMet && (
              <span className="text-[11px] font-bold text-amber-400">
                (Need 2+ to submit)
              </span>
            )}
          </div>
        </div>

        {/* Min 2 Members Warning if locked */}
        {!isMinMembersMet && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-300">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="size-4 text-amber-400" />
              <span>Round 1 Locked — Minimum 2 Members Required</span>
            </div>
            <p className="mt-1 leading-relaxed text-amber-200/90">
              Your squad currently has {totalMembers} member. Share your team code (<strong>{registration.teamCode || registration.id}</strong>) with your teammates to join. Once at least 2 members have joined, Round 1 PPT submission unlocks automatically!
            </p>
          </div>
        )}

        {/* Existing Submission Notice */}
        {isSubmitted && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Submission Received!</strong> Last updated by{" "}
                <span className="underline">{registration.submission?.submittedBy || "Team"}</span>
              </span>
            </div>
            {registration.submission?.pptUrl && (
              <a
                href={registration.submission.pptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
              >
                Open Submitted Slides <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          {/* 1. Project Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Project / Idea Title <span className="text-neon">*</span>
            </label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              disabled={!isMinMembersMet}
              placeholder="e.g. MedBot AI, SolarGrid Autonomous Balancer"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon transition disabled:opacity-50"
            />
          </div>

          {/* 2. Track / Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Domain / Track <span className="text-neon">*</span>
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              disabled={!isMinMembersMet}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon transition disabled:opacity-50"
            >
              {TRACK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 3. 1-Sentence Summary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              One-Sentence Solution Summary <span className="text-neon">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={!isMinMembersMet}
              placeholder="Describe in 1-2 lines what problem your idea solves and how it works..."
              className="w-full rounded-xl border border-border bg-surface p-3 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon transition disabled:opacity-50 resize-none"
            />
          </div>

          {/* 4. PPT Presentation Link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Presentation / PPT Link (Google Drive / Canva / Slides) <span className="text-neon">*</span>
              </label>
              <span className="text-[10px] text-neon font-bold">100% Free Cloud Link</span>
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="url"
                required
                value={pptUrl}
                onChange={(e) => setPptUrl(e.target.value)}
                disabled={!isMinMembersMet}
                placeholder="https://drive.google.com/file/d/... or https://canva.com/..."
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon transition disabled:opacity-50 font-mono text-xs"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="text-neon font-bold">Important:</span> Ensure Google Drive / Canva sharing access is set to 
              <span className="font-semibold text-foreground"> "Anyone with the link can view"</span> so judges can evaluate.
            </p>
          </div>

          {/* Official PPT Checklist Box */}
          <div className="rounded-xl border border-neon/30 bg-neon/5 p-3.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-neon flex items-center gap-1">
              <Sparkles className="size-3" /> Official Slide Deck Checklist
            </span>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="text-neon font-bold">✓</span> Problem statement
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neon font-bold">✓</span> Proposed solution
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neon font-bold">✓</span> Innovation & uniqueness
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neon font-bold">✓</span> Target users & impact
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neon font-bold">✓</span> Proposed tech stack
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neon font-bold">✓</span> Implementation plan
              </div>
            </div>
          </div>

          {/* 5. Optional Prototype / GitHub Link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Prototype / GitHub / Demo Link <span className="text-[10px] lowercase text-muted-foreground">(Optional)</span>
            </label>
            <div className="relative">
              <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                disabled={!isMinMembersMet}
                placeholder="https://github.com/... or https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-neon focus:ring-1 focus:ring-neon transition disabled:opacity-50 font-mono text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isMinMembersMet || saving}
              className="rounded-xl bg-neon text-primary-foreground font-black text-xs sm:text-sm px-6 py-2.5 shadow-glow hover:brightness-105 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isSubmitted
                ? "Update Submission ✓"
                : "Submit Round 1 Entry 🚀"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
