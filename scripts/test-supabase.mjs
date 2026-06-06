import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = readFileSync(envPath, "utf8");

const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) {
  console.error("ERROR: Faltan variables en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

// 1) Verificar que la API responde (auth)
const session = await supabase.auth.getSession();
if (session.error) {
  console.error("ERROR auth.getSession:", session.error.message);
  process.exit(1);
}

// 2) Consulta de prueba a la base de datos (tabla inexistente = conexión OK si el error es de tabla)
const query = await supabase.from("_connection_test_").select("*").limit(1);

if (query.error) {
  const msg = query.error.message ?? "";
  const code = query.error.code ?? "";

  // PGRST205 = tabla no existe → la conexión REST a Postgres funciona
  if (code === "PGRST205" || msg.includes("does not exist") || msg.includes("no existe")) {
    console.log("OK: Conexión a Supabase verificada");
    console.log("  - URL:", url);
    console.log("  - Auth API: responde correctamente");
    console.log("  - REST API: responde correctamente (tabla de prueba no existe, esperado)");
    process.exit(0);
  }

  console.error("ERROR en consulta:", query.error.message, `(${code})`);
  process.exit(1);
}

console.log("OK: Conexión a Supabase verificada");
console.log("  - Consulta ejecutada sin errores");
console.log("  - Filas:", query.data?.length ?? 0);
