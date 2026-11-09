import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  getStoredRegistrations,
  confirmTeammateInvitation,
  EVENT_CHANGE_SIGNAL,
  type EventRegistration,
} from "@/data/events-store";
import { CheckCircle2, Users, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TeamInviteBanner() {
  const { user } = useAuth();
  const [pendingInvite, setPendingInvite] = useState<{
    registration: EventRegistration;
    memberEmail: string;
  } | null>(null);

  // Check URL params (?confirmTeam=...&email=...) and logged-in user pending invitations
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkInvites = () => {
      try {
        const url = new URL(window.location.href);
        const confirmTeamId = url.searchParams.get("confirmTeam");
        const inviteEmail = url.searchParams.get("email");

        const allRegs = getStoredRegistrations();

        // 1. Check direct URL query param invite
        if (confirmTeamId) {
          const matched = allRegs.find((r) => r && r.id === confirmTeamId);
          if (matched && Array.isArray(matched.teammates)) {
            const targetEmail = (inviteEmail || user?.email || "").trim().toLowerCase();
            if (targetEmail) {
              const tm = matched.teammates.find(
                (t) =>
                  typeof t === "object" &&
                  t &&
                  typeof t.email === "string" &&
                  t.email.trim().toLowerCase() === targetEmail &&
                  t.status !== "verified"
              );
              if (tm && tm.email) {
                setPendingInvite({ registration: matched, memberEmail: tm.email });
                return;
              }
            }
          }
        }

        // 2. Check logged-in user email against all stored registrations
        if (user?.email) {
          const userEmail = user.email.trim().toLowerCase();
          for (const reg of allRegs) {
            if (reg && Array.isArray(reg.teammates)) {
              const tm = reg.teammates.find(
                (t) =>
                  typeof t === "object" &&
                  t &&
                  typeof t.email === "string" &&
                  t.email.trim().toLowerCase() === userEmail &&
                  t.status !== "verified"
              );
              if (tm && tm.email) {
                setPendingInvite({ registration: reg, memberEmail: tm.email });
                return;
              }
            }
          }
        }

        setPendingInvite(null);
      } catch (err) {
        // Guarantee safety - never crash root router
        setPendingInvite(null);
      }
    };

    checkInvites();
    window.addEventListener(EVENT_CHANGE_SIGNAL, checkInvites);
    window.addEventListener("storage", checkInvites);

    return () => {
      window.removeEventListener(EVENT_CHANGE_SIGNAL, checkInvites);
      window.removeEventListener("storage", checkInvites);
    };
  }, [user]);

  if (!pendingInvite || !pendingInvite.registration) return null;

  const { registration, memberEmail } = pendingInvite;

  const handleAccept = () => {
    try {
      if (!registration || !memberEmail) return;
      const ok = confirmTeammateInvitation(registration.id, memberEmail);
      if (ok) {
        toast.success(`🎉 You've officially joined Team "${registration.teamName || "Squad"}" for ${registration.opportunityTitle || "Hackathon"}!`);
        setPendingInvite(null);

        // Clean URL query params if present
        if (typeof window !== "undefined" && window.location.search.includes("confirmTeam")) {
          const url = new URL(window.location.href);
          url.searchParams.delete("confirmTeam");
          url.searchParams.delete("email");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to confirm team invitation.");
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border-2 border-neon bg-[#07130a]/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon/20 text-neon shadow-glow-soft">
              <Sparkles className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-neon">
                  Team Invitation Received
                </span>
                <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <p className="mt-1 text-sm font-bold text-foreground">
                {registration.fullName || "A teammate"} invited you to join Team "{registration.teamName || "Squad"}"
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Event: {registration.opportunityTitle || "Hackathon"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPendingInvite(null)}
            className="text-muted-foreground hover:text-foreground p-1"
            title="Dismiss for now"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPendingInvite(null)}
            className="rounded-full text-xs"
          >
            Later
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAccept}
            className="rounded-full bg-neon text-black font-extrabold text-xs shadow-glow hover:brightness-110 px-5"
          >
            <CheckCircle2 className="size-3.5 mr-1" /> Accept &amp; Join Team 🚀
          </Button>
        </div>
      </div>
    </div>
  );
}

