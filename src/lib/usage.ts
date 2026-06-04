import { createClient } from "@/lib/supabase/server";

export type Usage = {
  conversationsUsed: number;
  freeConversationsLimit: number;
  remaining: number;
};

/**
 * Reads the signed-in user's conversation credits. Returns null if the request
 * is not authenticated. Uses the SECURITY DEFINER `get_my_usage` RPC, which is
 * scoped to `auth.uid()` so a user can only ever see their own credits.
 */
export async function getMyUsage(): Promise<Usage | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc("get_my_usage");
  if (error || !data || data.length === 0) {
    return { conversationsUsed: 0, freeConversationsLimit: 2, remaining: 2 };
  }
  const row = data[0] as {
    conversations_used: number;
    free_conversations_limit: number;
    remaining: number;
  };
  return {
    conversationsUsed: row.conversations_used,
    freeConversationsLimit: row.free_conversations_limit,
    remaining: row.remaining,
  };
}
