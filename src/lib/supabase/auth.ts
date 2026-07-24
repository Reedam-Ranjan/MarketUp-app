import "server-only";
import { createClient } from "./server";

export type Profile = {
  id: string;
  email: string | null;
  is_pro: boolean;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
};

/** The currently signed-in auth user, or null. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The signed-in user's profile row (subscription state), or null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, is_pro, plan, stripe_customer_id, stripe_subscription_id, current_period_end",
    )
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}
