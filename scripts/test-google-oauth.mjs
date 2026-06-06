import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, "../.env.local"), "utf8");

const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const supabase = createClient(url, key);

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: "http://localhost:3000/auth/callback",
  },
});

if (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}

if (data.url?.includes("/auth/v1/authorize?provider=google")) {
  console.log("OK: Supabase genera URL de Google OAuth correctamente");
  console.log("  OAuth URL:", data.url);
  console.log("  Redirect URL configurada: http://localhost:3000/auth/callback");
  process.exit(0);
}

console.error("ERROR: URL inesperada:", data.url);
process.exit(1);
