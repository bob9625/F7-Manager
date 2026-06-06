import Link from "next/link";

type AuthLayoutProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-f7-bg px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center font-bebas text-4xl tracking-wide text-f7-accent md:text-5xl"
        >
          F7 Manager
        </Link>

        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          {children}
        </div>

        <p className="mt-6 text-center font-sans text-sm text-white/60">
          {footer}
        </p>
      </div>
    </main>
  );
}
