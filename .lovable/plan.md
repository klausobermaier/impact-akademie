## Problem

Die Übersicht „Modul 0: Marktvalidierung · Ø 2.6 · 🔴 0% kritisch …" wird aktuell **komplett von der KI als Markdown** generiert. Die KI wählt die Farb-Emoji frei – daher steht „0% kritisch" mit einem roten Punkt und der durchschnittliche Modulwert 2,6 bekommt einen grünen Badge, obwohl beide Signale nicht zusammenpassen. Das ist nicht der Code – die KI ist inkonsistent.

## Lösung

Die Modul-Übersicht **deterministisch im Code** rendern (auf Basis von `moduleStats`, die wir bereits haben), mit klarer, konsistenter Logik. Die KI soll diesen Block nicht mehr selbst erzeugen.

### 1. Neue Komponente `ModuleOverview` in `ResultsPanel.tsx`

Für jedes Modul eine Karte, oberhalb der KI-Auswertung:

```
Modul 0: Marktvalidierung                              Ø 2,6 / 4
7/7 beantwortet · 0% kritisch (Score 0–1) · 0% N/A
```

- **Ø-Badge**: einheitliche, neutrale Farbgebung (kein Rot/Gelb/Grün – wir haben das bereits in einer früheren Iteration so beschlossen) **und** Skala „/ 4" sichtbar, damit der Wert eingeordnet werden kann.
- **Meta-Zeile**: nur Zahlen, **ohne farbige Emoji-Punkte**. „0% kritisch" heißt: 0 von n Antworten liegen im Score 0–1. Hoher Wert = schlecht, niedriger Wert = gut → klare Beschriftung, keine Farbe.
- Module mit 100% N/A werden mit Hinweis „Nicht bewertet" angezeigt und im Gesamtschnitt ausgeschlossen (wie bisher).

### 2. Gesamtwert anzeigen

Oben in der Übersicht eine Summary-Zeile:

```
Gesamtdurchschnitt: 1,7 / 4   (Mittel über 10 bewertete Module)
```

### 3. KI-Prompt anpassen (`audit-ai.functions.ts`)

- Explizit ergänzen: „Erzeuge KEINEN Abschnitt ‚Ihre/Deine Ergebnisse im Überblick' und keine Modul-Karten mit Emoji-Indikatoren. Die Übersicht wird vom System gerendert."
- `stripOverviewSection` aus `admin.$id.tsx` in `ResultsPanel` hochziehen und auf **beide** Ansichten anwenden (Nutzer + Admin), damit etwaige Alt-Auswertungen und KI-Ausreißer ebenfalls bereinigt werden.

### 4. Geltungsbereich

- Nutzer-Auswertung **und** Admin-Detailansicht (beide nutzen `ResultsPanel`).
- Keine Änderung am Scoring-Modell selbst (Ø, redPct, naPct bleiben wie sie sind).
- Keine Änderung an der Live-Frageansicht (`ModuleCard`).

## Ergebnis

Die Modul-Übersicht ist danach konsistent, ohne widersprüchliche Farb-Emoji, mit klarer Skala „/ 4" und einem Gesamtdurchschnitt zur Einordnung.
