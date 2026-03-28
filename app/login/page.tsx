"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState("/");
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const candidate = params.get("next");
    setNextPath(candidate && candidate.startsWith("/") ? candidate : "/");
    setConfigError(params.get("error") === "config");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card variant="luxury" className="w-full max-w-md p-8">
        <h1 className="text-3xl font-playfair font-bold text-pale-blue mb-2">App Access</h1>
        <p className="text-pale-purple/80 mb-6">
          Enter your app password to continue.
        </p>

        {configError && (
          <p className="mb-4 text-sm text-red-400">
            Server is missing APP_PASSWORD configuration.
          </p>
        )}

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter app password"
          />

          <Button
            type="submit"
            variant="luxury"
            className="w-full !border-0"
            disabled={!password || loading}
            isLoading={loading}
          >
            Unlock App
          </Button>
        </form>
      </Card>
    </div>
  );
}
