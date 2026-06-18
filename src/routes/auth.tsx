import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin-Login · Startup Marketing Audit" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setInfo(
          "Konto erstellt. Du kannst dich jetzt anmelden. Hinweis: Admin-Rechte müssen separat freigeschaltet werden.",
        );
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-primary text-center">
          {mode === "login" ? "Admin-Login" : "Admin-Konto erstellen"}
        </h1>
        <p className="text-xs text-muted-foreground text-center mt-1 mb-5">
          Nur für Trainer/Admin – Teilnehmer benötigen keinen Login.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-foreground">{info}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Registrieren"}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              Noch kein Konto?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setInfo(null);
                }}
                className="underline hover:text-foreground"
              >
                Registrieren
              </button>
            </>
          ) : (
            <>
              Bereits ein Konto?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setInfo(null);
                }}
                className="underline hover:text-foreground"
              >
                Anmelden
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
