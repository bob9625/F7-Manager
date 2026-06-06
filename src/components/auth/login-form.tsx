"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError("No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.");
    }
  }, [searchParams]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h2 className="mb-6 text-center font-bebas text-2xl tracking-wide text-white">
        Iniciar sesión
      </h2>

      <GoogleLoginButton
        onError={(message) => {
          if (message) setError(message);
          setLoading(false);
        }}
      />

      <div className="my-6 flex items-center gap-3 font-sans text-sm text-white/40">
        <span className="h-px flex-1 bg-white/10" />
        o continúa con email
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4 font-sans">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-white/70">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-white/10 bg-f7-bg px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-f7-accent focus:ring-1 focus:ring-f7-accent"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-white/70"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-white/10 bg-f7-bg px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-f7-accent focus:ring-1 focus:ring-f7-accent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-f7-accent py-3 font-bebas text-lg tracking-wide text-f7-bg transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  );
}

export function LoginFooter() {
  return (
    <>
      ¿No tienes cuenta?{" "}
      <Link href="/registro" className="text-f7-accent hover:underline">
        Regístrate
      </Link>
    </>
  );
}
