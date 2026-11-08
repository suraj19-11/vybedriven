import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "4o5pm1oHZ70Xwkp0j56F3sGtRlWxMMQjlv922S9betY" },
      { title: "Vybe Driven (Vybe) — Discover Nearest Hackathons, Coding Competitions & Tech Events" },
      { name: "description", content: "Vybe Driven (Vybe / Vibe) is India's leading platform discovering nearest hackathons, coding competitions, developer meetups, and creator awards in Mumbai and all-India." },
      { name: "keywords", content: "vybe driven, vybe, vibe driven, vibe, vybedriven, nearest hackathon, hackathons near me, hackathons in mumbai, hackathons in india, tech events, coding competitions, upcoming hackathons 2026 2027, student hackathons, luminar creators award, idea competition" },
      { name: "author", content: "Vybe Driven" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow" },
      { name: "theme-color", content: "#030704" },
      { name: "geo.region", content: "IN-MH" },
      { name: "geo.placename", content: "Mumbai, Maharashtra, India" },
      { property: "og:site_name", content: "Vybe Driven" },
      { property: "og:title", content: "Vybe Driven (Vybe) — Discover Nearest Hackathons & Tech Events" },
      { property: "og:description", content: "Find the nearest hackathons, coding competitions, and developer events on Vybe Driven (Vybe / Vibe Driven)." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:image", content: "https://www.vybedriven.in/vybe-driven.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@vybedriven" },
      { name: "twitter:creator", content: "@vybedriven" },
      { name: "twitter:image", content: "https://www.vybedriven.in/vybe-driven.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.vybedriven.in/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.vybedriven.in/#organization",
        "name": "Vybe Driven",
        "alternateName": ["Vybe", "Vybedriven", "Vibe Driven", "Vibe", "VybeDriven India"],
        "url": "https://www.vybedriven.in",
        "logo": "https://www.vybedriven.in/favicon.png",
        "image": "https://www.vybedriven.in/vybe-driven.png",
        "description": "Vybe Driven (Vybe / Vibe) is India's premier community platform discovering upcoming hackathons, coding competitions, technology summits, and creator opportunities for ambitious developers and builders.",
        "sameAs": [
          "https://www.instagram.com/vybedriven",
          "https://github.com/vaibhav-tx/vybedriven"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "vybedriven@gmail.com",
          "contactType": "customer support"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.vybedriven.in/#website",
        "url": "https://www.vybedriven.in",
        "name": "Vybe Driven",
        "alternateName": ["Vybe", "Vibe Driven", "Vybedriven", "Vibe"],
        "description": "Discover national hackathons, competitions and technology events across Mumbai, Bangalore, Pune and India.",
        "publisher": { "@id": "https://www.vybedriven.in/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.vybedriven.in/discover?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('dark');try{localStorage.setItem('hd-theme','dark')}catch(e){}` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<import("@/lib/auth").Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      setProfile((data as import("@/lib/auth").Profile) ?? null);
    } catch {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let active = true;
    // Instant local session restoration (0ms blocking latency)
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider value={{ user, profile, loading, refreshProfile }}>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
