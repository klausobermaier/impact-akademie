## Ziel

Den Startup-Marketing-Audit-Fragebogen aus der hochgeladenen HTML-Datei vollständig als React/TanStack-Feature in die App integrieren – als Startseite UND als eigene Route, im Design-System des Projekts (Tailwind v4 + shadcn).

## Routen

- `/` (`src/routes/index.tsx`) – ersetzt den Platzhalter, zeigt den vollständigen Fragebogen
- `/audit` (`src/routes/audit.tsx`) – identische Audit-Seite unter dedizierter URL (für Sharing/Bookmarks)
- Beide Routen rendern dieselbe `<AuditPage />`-Komponente, mit eigenen `head()`-Metadaten (Titel/Description/OG)

## Komponenten-Struktur

`src/components/audit/`
- `AuditPage.tsx` – Container: Header, Progressbar (sticky), Skala-Legende, Intro-Formular, Module, Final-Block, Ergebnis-Block
- `ModuleCard.tsx` – ein Modul mit Header, Subtitle/Note, Mini-Fortschrittsbalken, Fragen
- `QuestionRow.tsx` – Fragetext + 6 Skalen-Buttons (0–4 + N/A), farbiger Selected-State
- `ChallengeSelector.tsx` – Mehrfachauswahl mit max. 3 Modulen
- `ResultsPanel.tsx` – Modul-Ergebnisse, priorisierte Workshop-Themen, KI-Export-Textarea, Buttons (Kopieren, Drucken, JSON-Download)
- `data.ts` – `MODULES`-Array (11 Module M0–M10, alle Fragen), `SCALE_LABELS`, `SCALE_VALS` aus der HTML übernommen
- `useAuditState.ts` – Hook für Antworten, ausgewählte Challenges, Intro-Felder, offene Antwort, abgeleitete Statistiken; Persistenz in `localStorage` für „nicht versehentlich verlieren"

## Design / Styling

Neutralisiertes Original-Branding in das Projekt-Design überführen:
- Verwenden von shadcn-Komponenten: `Card`, `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Progress`, `Badge`
- Semantische Tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-accent`) statt Hex-Werte
- Skala-Farbskala (rot→orange→gelb→lime→grün) als eigene Tokens in `src/styles.css` ergänzen: `--audit-scale-0` … `--audit-scale-4` (oklch), plus `@theme inline` Mapping → Tailwind-Klassen `bg-audit-scale-0` usw. Für die N/A-Variante `bg-muted`.
- „NEU"-Badge als shadcn `Badge variant="secondary"` mit Accent-Tönung
- Print-Styles (`@media print`) für PDF-Export beibehalten

## Funktionalität (1:1 zur HTML)

- Antwort wählen → State-Update, farbiger Button, Modul-Mini-Bar + globale Progressbar
- Max. 3 Challenges auswählbar (weitere disabled)
- „Auswertung erstellen": ≥50% beantwortet erforderlich, sonst Hinweistext
- Pro Modul: Ø-Wert (ohne N/A), % kritisch (0–1), % N/A, Score-Badge (rot < 1,5 / gelb < 2,5 / grün)
- Priorisierte Workshop-Themen aus selectedChallenges + Statistik
- KI-Export-Text exakt im Format der Original-Funktion `generateExportText`
- Buttons: Text kopieren (Clipboard API), Drucken (`window.print()`), JSON-Download (Blob)
- Smooth-Scroll zum Ergebnis-Block

## SEO / Head

- `/`: Title „Startup Marketing Audit – Selbstcheck", deutschsprachige Description, OG-Tags
- `/audit`: leicht abweichender Title („Audit · Startup Marketing Selbstcheck"), gleicher Inhaltskontext

## Technische Hinweise

- Reines Frontend-Feature, kein Backend nötig (kein Lovable Cloud)
- `lang="de"` durch deutschen Content gegeben (kein Eingriff in `<html lang>` von `__root.tsx` nötig, bleibt `en` – falls gewünscht später anpassen)
- localStorage-Persistenz nur clientseitig (SSR-sicher mit `useEffect`-Hydrate)
- Keine neuen Dependencies erforderlich (shadcn-Komponenten existieren bereits)

## Out of Scope

- Versand/Speicherung der Ergebnisse auf Server
- Auth / Mehrbenutzer
- KI-Auswertung direkt in der App (bleibt Copy-to-Clipboard für Claude/ChatGPT, wie im Original)
