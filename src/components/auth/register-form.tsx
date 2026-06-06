"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage("Revisa tu email para confirmar tu cuenta.");
    setLoading(false);
  }

  return (
    <>
      <h2 className="mb-6 text-center font-bebas text-2xl tracking-wide text-white">
        Crear cuenta
      </h2>

      <form onSubmit={handleRegister} className="space-y-4 font-sans">
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
            autoComplete="new-password"
            className="w-full rounded-lg border border-white/10 bg-f7-bg px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-f7-accent focus:ring-1 focus:ring-f7-accent"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm text-white/70"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-white/10 bg-f7-bg px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-f7-accent focus:ring-1 focus:ring-f7-accent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg bg-f7-accent/10 px-3 py-2 text-sm text-f7-accent">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-f7-accent py-3 font-bebas text-lg tracking-wide text-f7-bg transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 font-sans text-sm text-white/40">
        <span className="h-px flex-1 bg-white/10" />
        o
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleLoginButton
        onError={(message) => {
          if (message) setError(message);
          setLoading(false);
        }}
      />
    </>
  );
}

export function RegisterFooter() {
  return (
    <>
      ¿Ya tienes cuenta?{" "}
      <Link href="/login" className="text-f7-accent hover:underline">
        Inicia sesión
      </Link>
    </>
  );
}
