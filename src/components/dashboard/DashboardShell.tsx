import type { ReactNode } from "react";
import DashboardChrome from "@/components/dashboard/DashboardChrome";
import { getProfile } from "@/lib/supabase/auth";

/** Shared app frame: responsive sidebar drawer + top bar + scrollable content. */
export default async function DashboardShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const profile = await getProfile();
  const email = profile?.email ?? null;
  const isPro = profile?.is_pro ?? false;

  return (
    <DashboardChrome
      title={title}
      subtitle={subtitle}
      email={email}
      isPro={isPro}
    >
      {children}
    </DashboardChrome>
  );
}
