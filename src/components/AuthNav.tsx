import { createClient } from "@/lib/supabase/server";
import { getMyUsage } from "@/lib/usage";
import { UserMenu } from "@/components/UserMenu";

/** Server-rendered auth nav: reads the session cookie, then hydrates UserMenu. */
export async function AuthNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const usage = user ? await getMyUsage() : null;

  return (
    <UserMenu
      initialUser={user}
      initialRemaining={usage?.remaining ?? null}
    />
  );
}
