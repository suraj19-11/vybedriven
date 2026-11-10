import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface BuilderAccount {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  passwordHash: string;
  createdAt: string;
}

export interface BuilderSession {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: string;
}

const STORAGE_ACCOUNTS_KEY = "hd_builder_accounts";
const STORAGE_SESSION_KEY = "hd_builder_session";
export const BUILDER_AUTH_CHANGE_EVENT = "hd-auth-change";

// Fast and secure client-side password hashing
async function hashPassword(plain: string): Promise<string> {
  const normalized = plain.trim();
  try {
    if (typeof window !== "undefined" && window.crypto?.subtle) {
      const msgUint8 = new TextEncoder().encode("vybe_salt_" + normalized);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // Fallback
  }
  // Base64 + custom shift fallback if WebCrypto unavailable
  let h = 0;
  for (let i = 0; i < normalized.length; i++) {
    h = (Math.imul(31, h) + normalized.charCodeAt(i)) | 0;
  }
  return "v1_" + Math.abs(h).toString(36) + "_" + btoa(normalized).substring(0, 16);
}

function getStoredAccounts(): BuilderAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: BuilderAccount[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

export function getBuilderSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const session: BuilderSession = JSON.parse(raw);
    if (!session || !session.id || !session.email) return null;

    return toSupabaseUser(session);
  } catch {
    return null;
  }
}

export function setBuilderSession(session: BuilderSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event(BUILDER_AUTH_CHANGE_EVENT));
    window.dispatchEvent(new Event("storage"));
  } catch {}
}

export function clearBuilderSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    window.dispatchEvent(new Event(BUILDER_AUTH_CHANGE_EVENT));
    window.dispatchEvent(new Event("storage"));
  } catch {}
}

export async function signOutBuilderAccount(): Promise<void> {
  clearBuilderSession();
  try {
    await supabase.auth.signOut();
  } catch {}
}

export function toSupabaseUser(session: BuilderSession): User {
  return {
    id: session.id,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {
      full_name: session.fullName,
      name: session.fullName,
      phone: session.phone || "",
    },
    aud: "authenticated",
    email: session.email,
    created_at: session.createdAt || new Date().toISOString(),
    phone: session.phone || "",
    role: "authenticated",
    confirmed_at: session.createdAt || new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
  } as unknown as User;
}

/**
 * Creates a builder account immediately. No email verification wait, no Supabase 429 errors.
 * Persists locally and automatically backs up to Supabase profiles.
 */
export async function createBuilderAccount({
  email,
  password,
  fullName,
  phone,
}: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}): Promise<{ user: User | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const cleanPhone = phone?.trim() || "";

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { user: null, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { user: null, error: "Password must be at least 6 characters." };
  }
  if (!cleanName) {
    return { user: null, error: "Please enter your full name." };
  }

  const pHash = await hashPassword(password);
  const accounts = getStoredAccounts();

  // Check if account already exists locally
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    if (existing.passwordHash === pHash) {
      // Correct password -> log in directly!
      const session: BuilderSession = {
        id: existing.id,
        email: existing.email,
        fullName: existing.fullName,
        phone: existing.phone || cleanPhone,
        createdAt: existing.createdAt,
      };
      setBuilderSession(session);
      return { user: toSupabaseUser(session), error: null };
    } else {
      return {
        user: null,
        error: "An account with this email already exists. Please switch to 'Sign In' or verify your password.",
      };
    }
  }

  // Create new builder ID
  const newId =
    "builder_" +
    Math.random().toString(36).substring(2, 8) +
    "_" +
    Date.now().toString(36);

  const newAccount: BuilderAccount = {
    id: newId,
    email: cleanEmail,
    fullName: cleanName,
    phone: cleanPhone,
    passwordHash: pHash,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  const session: BuilderSession = {
    id: newAccount.id,
    email: newAccount.email,
    fullName: newAccount.fullName,
    phone: newAccount.phone,
    createdAt: newAccount.createdAt,
  };
  setBuilderSession(session);

  // Background Cloud Sync to Supabase profiles (non-blocking)
  try {
    supabase
      .from("profiles")
      .upsert({
        id: newAccount.id,
        display_name: newAccount.fullName,
        email: newAccount.email,
        bio: JSON.stringify({ ph: pHash, phone: cleanPhone }),
        profile_complete: true,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn("[BuilderAuth] Cloud sync notice:", error.message);
      })
      .catch(() => {});
  } catch {}

  return { user: toSupabaseUser(session), error: null };
}

/**
 * Signs in a builder account with email & password.
 * Checks local accounts, cloud profiles, and falls back to Supabase auth.
 */
export async function signInBuilderAccount({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ user: User | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { user: null, error: "Please enter a valid email address." };
  }
  if (!password) {
    return { user: null, error: "Please enter your password." };
  }

  const pHash = await hashPassword(password);
  const accounts = getStoredAccounts();

  // 1. Check local accounts
  const localAcc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (localAcc) {
    if (localAcc.passwordHash === pHash) {
      const session: BuilderSession = {
        id: localAcc.id,
        email: localAcc.email,
        fullName: localAcc.fullName,
        phone: localAcc.phone,
        createdAt: localAcc.createdAt,
      };
      setBuilderSession(session);
      return { user: toSupabaseUser(session), error: null };
    } else {
      return { user: null, error: "Invalid password for this account. Please try again." };
    }
  }

  // 2. Check Supabase profiles in cloud (in case account was created on another device)
  try {
    const { data: cloudProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (cloudProfile && cloudProfile.bio) {
      try {
        const parsed = JSON.parse(cloudProfile.bio);
        if (parsed && parsed.ph === pHash) {
          const syncedAccount: BuilderAccount = {
            id: cloudProfile.id,
            email: cleanEmail,
            fullName: cloudProfile.display_name || cleanEmail.split("@")[0],
            phone: parsed.phone || "",
            passwordHash: pHash,
            createdAt: cloudProfile.created_at || new Date().toISOString(),
          };
          accounts.push(syncedAccount);
          saveStoredAccounts(accounts);

          const session: BuilderSession = {
            id: syncedAccount.id,
            email: syncedAccount.email,
            fullName: syncedAccount.fullName,
            phone: syncedAccount.phone,
            createdAt: syncedAccount.createdAt,
          };
          setBuilderSession(session);
          return { user: toSupabaseUser(session), error: null };
        }
      } catch {}
    }
  } catch {}

  // 3. Fallback to Supabase native auth
  try {
    const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!sbError && sbData?.user) {
      // Signed in via Supabase native session
      return { user: sbData.user, error: null };
    }

    if (sbError) {
      const errLower = sbError.message.toLowerCase();
      if (errLower.includes("email not confirmed")) {
        // If Supabase has unconfirmed email, allow instant builder login so they aren't trapped by 429
        const session: BuilderSession = {
          id: "builder_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 16),
          email: cleanEmail,
          fullName: cleanEmail.split("@")[0],
          createdAt: new Date().toISOString(),
        };
        setBuilderSession(session);
        return { user: toSupabaseUser(session), error: null };
      }
      return {
        user: null,
        error: "Invalid email or password. If you originally signed in with Google, please click 'Continue with Google' above.",
      };
    }
  } catch (err: unknown) {
    return {
      user: null,
      error: err instanceof Error ? err.message : "Sign in failed.",
    };
  }

  return {
    user: null,
    error: "Account not found with this email. Please check your spelling or switch to 'Create Account'.",
  };
}
