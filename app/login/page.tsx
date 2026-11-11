"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import PerfumeLogoIcon from "@/components/ui/PerfumeLogoIcon";

/** Only allow same-origin paths after login (blocks "//evil.com" and "/\evil.com"). */
function isSafeRedirect(candidate: string | null): candidate is string {
  if (!candidate || !candidate.startsWith("/")) return false;
  try {
    return new URL(candidate, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function LoginPage() {
  // useSearchParams must sit under a Suspense boundary for static prerendering.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configError = params.get("error") === "config";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const candidate = params.get("next");
    const nextPath = isSafeRedirect(candidate) ? candidate : "/";
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Authentication failed");
      }

      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-sm animate-rise">
        <PerfumeLogoIcon className="mb-8 h-10 w-10 text-ink" />
        <p className="eyebrow mb-3">Private studio</p>
        <h1 className="text-5xl">
          Memories <em className="text-ink-soft">into</em> Perfumes
        </h1>
        <p className="mt-4 text-ink-soft">Enter the studio password to continue.</p>

        <div className="mt-6 space-y-3">
          {configError && <Notice tone="error">The server is missing its APP_PASSWORD configuration.</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
          />
          <Button type="submit" size="lg" className="w-full" disabled={!password} isLoading={loading}>
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}
