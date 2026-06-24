"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded border border-f7-border2 bg-transparent px-3 py-1 text-xs text-f7-text2 transition-colors hover:border-f7-red hover:text-f7-red"
    >
      Cerrar sesión
    </button>
  );
}
