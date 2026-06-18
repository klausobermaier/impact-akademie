## Ziel

Den bestehenden Audit-Fragebogen so erweitern, dass beliebige Personen ihn unabhängig via öffentlichem Link ausfüllen können. Ergebnisse (inkl. Name, Firma, alle Antworten) werden zentral gespeichert. Du als Admin hast einen geschützten Bereich, um alle Einreichungen aufzulisten, einzeln einzusehen, KI-Export zu kopieren und JSON zu exportieren.

## Lovable Cloud aktivieren

Backend per Lovable Cloud: PostgreSQL-Datenbank, Auth, automatische API-Generierung – ohne externes Setup. Wird zu Beginn einmalig aktiviert.

## Datenbank-Schema (Migration)

Tabelle `public.audit_submissions`:
- `id uuid pk default gen_random_uuid()`
- `created_at timestamptz default now()`
- `name text not null`
- `company text`
- `industry text`
- `stage text`
- `answers jsonb not null` – `{ "0.1": 3, "0.2": "na", ... }`
- `challenges int[] not null default '{}'`
- `open_answer text`
- `module_stats jsonb` – vorberechnete Auswertung pro Modul
- `answered_count int not null`
- `total_questions int not null`

Tabelle `public.user_roles` mit Enum `app_role` (`admin`, `user`) + Security-Definer-Funktion `has_role(user_id, role)` (Standard-Lovable-Pattern, kein Rollen-Feld auf Profil).

### RLS-Policies

`audit_submissions`:
- INSERT: `TO anon, authenticated` mit `WITH CHECK (true)` – jeder Besucher darf seine eigene Einreichung anlegen (öffentlicher Link).
- SELECT: nur `authenticated` mit `USING (public.has_role(auth.uid(), 'admin'))` – nur Admins sehen Einreichungen.
- UPDATE/DELETE: nur Admin.

`user_roles`:
- SELECT für `authenticated` (nur eigene Rolle): `USING (auth.uid() = user_id)`.
- INSERT/UPDATE/DELETE nur `service_role` – Rollen werden per Migration/Seed gesetzt, nicht über die App.

GRANTs entsprechend (`anon` INSERT auf `audit_submissions`, `authenticated` SELECT + Admin-Schreibrechte).

### Admin-Konto

Das Admin-Konto wird einmalig nach erstem Sign-up gesetzt – per Migration mit deiner E-Mail als Variable, oder per manuellem SQL-Snippet im Cloud-Backend nach dem Sign-up. Plan-Vorgehen:
1. Du registrierst dich nach dem Build über die Auth-Seite.
2. Du teilst mir deine E-Mail mit, ich lege eine Migration nach, die genau dieser User-ID die Admin-Rolle in `user_roles` zuweist.

## Routen-Struktur

- `/` – Landing (Kurzbeschreibung „Startup-Marketing-Audit", Button „Fragebogen starten"). Public.
- `/audit` – der bestehende Fragebogen. Public. Beim Klick auf „Auswertung erstellen" wird die Einreichung in die DB geschrieben und ein lokaler Erfolgs-Screen mit der eigenen Auswertung gezeigt (wie bisher, plus „Vielen Dank – wurde übermittelt").
- `/auth` – integrationsverwaltete Auth-Seite (Email/Passwort, Sign-Up + Login).
- `/_authenticated/admin` – Liste aller Einreichungen (Name, Firma, Datum, Ø-Score, Anzahl Fragen). Sortierbar nach Datum. Nicht-Admin → „Kein Zugriff".
- `/_authenticated/admin/$id` – Detailansicht einer Einreichung: Stammdaten, Modul-Übersicht (gleiches ResultsPanel wie bisher), Antwortliste, ausgewählte Herausforderungen, offene Frage, KI-Export-Textarea (kopieren / drucken / JSON).

## Komponenten

Bestehend:
- `AuditPage` bleibt; Submit-Logik wird erweitert.
- `ResultsPanel` wird so refaktoriert, dass es eine Einreichung aus Props rendern kann (statt nur aus dem aktuellen useAuditState).

Neu:
- `src/lib/audit-submissions.ts` – clientseitige Supabase-Calls: `submitAudit(payload)` (INSERT als anon), `listSubmissions()` (Admin), `getSubmission(id)` (Admin).
- `src/components/admin/SubmissionsTable.tsx` – Liste.
- `src/routes/admin.tsx` (unter `_authenticated`) und `admin.$id.tsx`.
- Landing `src/routes/index.tsx` wird zur Marketing-Seite; `audit.tsx` bleibt der Fragebogen.
- Admin-Check via clientseitigem `has_role`-Aufruf (RPC) oder per Such-Query auf `user_roles` mit eigener ID; bei fehlender Rolle wird „Kein Zugriff" gerendert.

## Submission-Flow

1. Nutzer füllt Fragebogen aus, klickt „Auswertung erstellen".
2. Wie bisher: clientseitige Validierung (≥50%), lokales `moduleStats` berechnen.
3. Neu: `submitAudit({ name, company, industry, stage, answers, challenges, openAnswer, moduleStats, answeredCount, totalQuestions })` – INSERT via Supabase JS Client (anon-Key, RLS erlaubt nur INSERT).
4. Bei Erfolg: Banner „Vielen Dank, Ihre Antworten wurden übermittelt." + ResultsPanel wie bisher.
5. Bei Fehler: Toast/Hinweis, lokaler State bleibt erhalten (Retry möglich).
6. Pflichtfeld „Name" wird erzwungen, damit zuordbar.

## Admin-Auswertung

- Tabelle: Datum, Name, Firma, Branche, Phase, Ø-Score (gemittelt über Module mit Wert), beantwortete Fragen, Button „Öffnen".
- Detail: identisches ResultsPanel + KI-Export, plus Möglichkeit „JSON exportieren". Optional „Alle als JSON exportieren" auf der Liste.
- Keine Bearbeitung, keine Löschung in V1 (kann später ergänzt werden).

## „Nur einmal" – Soft-Enforcement

Da es keinen Login für Teilnehmer gibt, ist eine echte „einmal pro Person"-Sperre serverseitig nicht zuverlässig möglich. Umsetzung:
- Nach erfolgreicher Übermittlung wird `submissionId` in `localStorage` gespeichert; UI zeigt dauerhaft „Bereits übermittelt" mit Hinweis. Erneutes Absenden ist im UI blockiert, aber per Inkognito umgehbar.
- Du kannst im Admin Duplikate (gleicher Name + Firma) optisch hervorheben.

Wenn echte Einmaligkeit gefordert wird, müsste Plan-Option „Persönlicher Einladungs-Link pro Person" gewählt werden – das ist hier explizit nicht gewünscht.

## Technische Hinweise

- Supabase JS Client (Lovable Cloud) im Browser mit Publishable Key – INSERT vom anon-User wird durch die Policy ausdrücklich erlaubt, alle anderen Operationen erfordern Auth + Admin-Rolle.
- Auth-Seite und `_authenticated`-Layout werden von der Cloud-Integration mitgeliefert.
- `lang="de"` ggf. später anpassen.
- Bestehende localStorage-Persistenz des Fragebogens bleibt erhalten, wird nach erfolgreicher Übermittlung geleert.

## Out of Scope

- E-Mail-Versand
- Individuelle Einladungs-Tokens
- Mehrere Admins / Rollenverwaltung im UI
- Bearbeiten/Löschen von Einreichungen
- KI-Auswertung direkt in der App
