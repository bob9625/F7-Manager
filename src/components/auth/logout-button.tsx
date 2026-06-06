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
      className="mt-8 rounded-lg border border-white/20 px-6 py-2 font-sans text-sm text-white/70 transition hover:border-f7-accent hover:text-f7-accent"
    >
      Cerrar sesión
    </button>
  );
}
