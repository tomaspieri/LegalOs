"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/board");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[384px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center mb-4">
            <Scale size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            LegalOS
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-md)] flex flex-col gap-4"
        >
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@lawfirm.com"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {error && (
            <div className="rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-red-200 px-3 py-2.5 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-1"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
