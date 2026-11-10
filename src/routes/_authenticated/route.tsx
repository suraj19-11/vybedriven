import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getBuilderSession } from "@/lib/builder-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const builderSession = getBuilderSession();
    if (builderSession) {
      return { user: builderSession };
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { mode: "signin", next: location.href } });
    return { user: data.user };
  },
  component: () => <Outlet />,
});