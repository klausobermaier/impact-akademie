import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Impact Akademie: Marketing & Vertrieb – Fragebogen" },
      {
        name: "description",
        content:
          "Bitte fülle dieses Self-Assessment bis spätestens zum 30. Juni 2026 aus. Die Inhalte des Workshops basieren dann exakt auf Euren Herausforderungen, die sich aus dem Self-Assement ergeben.",
      },
      { property: "og:title", content: "Impact Akademie: Marketing & Vertrieb" },
      {
        property: "og:description",
        content:
          "11 Module, Workshop-Vorbereitung. Ergebnisse werden direkt an den Trainer übermittelt.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-widest opacity-70 mb-4">
            Selbstcheck · Workshop-Vorbereitung
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            Impact Akademie: Marketing & Vertrieb
          </h1>
          <p className="mt-5 text-base sm:text-lg opacity-85 max-w-2xl mx-auto">
            Bitte fülle dieses Self-Assessment bis spätestens zum <span className="text-red-600 font-bold">30. Juni 2026</span> aus.<br />
            Die Inhalte des Workshops basieren dann exakt auf Euren Herausforderungen, die sich aus dem Self-Assement ergeben.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/audit"
              className="inline-flex items-center justify-center rounded-md bg-background text-primary px-6 py-3 text-base font-semibold hover:bg-background/90 transition-colors"
            >
              Fragebogen starten →
            </Link>
            <Link
              to="/admin"
              className="text-sm opacity-70 hover:opacity-100 underline underline-offset-4"
            >
              Admin-Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-16 grid sm:grid-cols-3 gap-6">
          {[
            {
              title: "11 Module",
              text: "Marktvalidierung, Positionierung, Zielgruppe, Sichtbarkeit, Content, Leads, Vertrieb, Kundenbindung, Systeme, Planung, Partnerschaften.",
            },
            {
              title: "Klare Skala",
              text: "0–4 plus N/A für jeden Bereich – ehrlich und schnell. Fortschritt sichtbar, Antworten lokal gesichert.",
            },
            {
              title: "KI-fertiger Export",
              text: "Am Ende erhältst du deine persönliche Auswertung. Der Trainer bekommt automatisch alle Ergebnisse zur Workshop-Vorbereitung.",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="font-semibold text-primary">{b.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {b.text}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Impact Akademie
      </footer>
    </div>
  );
}
