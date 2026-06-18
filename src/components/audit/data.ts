export type Question = {
  id: string;
  title: string;
  text: string;
  isNew?: boolean;
  /** Optional per-question scale labels (length 5, for values 0..4). Falls back to SCALE_LABELS. */
  scaleLabels?: string[];
  /** Optional per-question label for the N/A button. Falls back to "N/A". */
  naLabel?: string;
  /** Render mode for the answer input. Default: "scale". */
  kind?: "scale" | "number";
  /** For numeric questions: placeholder in the textual question (replaces "X"). */
  numberUnit?: string;
};

export type Module = {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  note?: string;
  isNew?: boolean;
  questions: Question[];
};

export const SCALE_LABELS = [
  "Nicht vorhanden",
  "Erste Ansätze",
  "Teilweise",
  "Regelmäßig",
  "Optimiert",
  "N/A",
];

export const SCALE_VALS: Array<0 | 1 | 2 | 3 | 4 | "na"> = [0, 1, 2, 3, 4, "na"];

export type AnswerValue = 0 | 1 | 2 | 3 | 4 | "na";

/** Map a numeric input (e.g. number of customer interviews) to a 0–4 score. */
export function numberToScore(n: number): 0 | 1 | 2 | 3 | 4 {
  if (n <= 0) return 0;
  if (n <= 3) return 1;
  if (n <= 6) return 2;
  if (n <= 9) return 3;
  return 4;
}

export const MODULES: Module[] = [
  {
    id: 0,
    key: "M0",
    title: "Marktvalidierung",
    subtitle:
      "Bevor Marketing und Vertrieb aufgebaut werden: Ist das Problem relevant und besteht ausreichend Nachfrage?",
    isNew: true,
    questions: [
      {
        id: "0.1",
        title: "Kundeninterviews",
        text: "Ich habe bisher mit X potenziellen Kunden über deren Herausforderungen gesprochen.",
        kind: "number",
        numberUnit: "Kunden",
        naLabel: "Nicht relevant",
      },
      {
        id: "0.2",
        title: "Problemvalidierung",
        text: "Ich habe überprüft, ob das Problem meiner Zielgruppe tatsächlich relevant und dringend ist.",
        scaleLabels: [
          "Ich habe nicht überprüft, ob das Problem meiner Zielgruppe tatsächlich besteht",
          "Ich habe erste Annahmen über das Problem mit potenziellen Kunden besprochen",
          "Mehrere potenzielle Kunden haben das Problem bestätigt",
          "Das Problem wurde von zahlreichen potenziellen Kunden als relevant und dringend bestätigt",
          "Ich kann belegen, dass das Problem für die Zielgruppe so relevant ist, dass aktiv nach Lösungen gesucht wird",
        ],
        naLabel: "Aktuell nicht relevant",
      },
      {
        id: "0.3",
        title: "Angebotsvalidierung",
        text: "Ich habe mein Angebot bereits echten Interessenten vorgestellt und Feedback erhalten.",
        scaleLabels: [
          "Mein Angebot wurde noch keinen potenziellen Kunden vorgestellt",
          "Ich habe mein Angebot einzelnen Personen vorgestellt",
          "Ich habe mehreren potenziellen Kunden mein Angebot vorgestellt und Feedback erhalten",
          "Ich habe mein Angebot wiederholt vorgestellt und systematisch Feedback gesammelt",
          "Das Kundenfeedback hat mein Angebot bestätigt und zu konkreten Verbesserungen geführt",
        ],
        naLabel: "Aktuell nicht relevant",
      },
      {
        id: "0.4",
        title: "Anpassungen",
        text: "Ich habe mein Angebot aufgrund von Kundenfeedback bereits verändert oder verbessert.",
        scaleLabels: [
          "Ich habe mein Angebot noch nicht auf Basis von Kundenfeedback angepasst",
          "Ich habe erste Verbesserungsideen aus Kundenfeedback gesammelt",
          "Ich habe einzelne Anpassungen an meinem Angebot vorgenommen",
          "Ich passe mein Angebot regelmäßig auf Basis von Kundenfeedback an",
          "Kundenfeedback ist ein fester Bestandteil meiner Angebotsentwicklung und führt kontinuierlich zu Verbesserungen",
        ],
        naLabel: "Aktuell nicht relevant",
      },
      {
        id: "0.5",
        title: "Erste Umsätze",
        text: "Ich habe bereits mindestens einen zahlenden Kunden gewonnen.",
        scaleLabels: [
          "Ich habe noch nicht überprüft, ob Kunden bereit sind, für die Lösung zu bezahlen",
          "Ich habe mit Kunden über Preise gesprochen",
          "Potenzielle Kunden haben grundsätzlich Kaufinteresse signalisiert",
          "Kunden haben konkrete Kaufabsichten gezeigt (z. B. Angebot angefragt, Vorbestellung, Testkunde)",
          "Kunden haben bereits für die Lösung bezahlt oder verbindlich zugesagt",
        ],
        naLabel: "Aktuell nicht relevant",
      },
      {
        id: "0.6",
        title: "Nachfragebeleg",
        text: "Ich kann anhand von Gesprächen, Anfragen oder Verkäufen belegen, dass Nachfrage besteht.",
        scaleLabels: [
          "Ich habe keine Hinweise darauf, dass Nachfrage nach meinem Angebot besteht",
          "Einzelne Personen haben Interesse an meinem Angebot gezeigt",
          "Es gab mehrere konkrete Anfragen oder Interessensbekundungen",
          "Es entstehen regelmäßig Anfragen oder Gespräche mit potenziellen Kunden",
          "Die Nachfrage ist durch wiederkehrende Anfragen, Testkunden oder Verkäufe klar nachgewiesen",
        ],
        naLabel: "Aktuell nicht relevant",
      },
      {
        id: "0.7",
        title: "Einwände",
        text: "Ich kenne die häufigsten Gründe, warum Kunden nicht kaufen.",
        scaleLabels: [
          "Ich kenne die Gründe nicht, warum Interessenten nicht kaufen",
          "Ich habe einzelne Vermutungen zu typischen Einwänden",
          "Ich habe wiederkehrende Einwände bei Interessenten erkannt",
          "Ich dokumentiere typische Einwände und kann darauf gezielt reagieren",
          "Ich kenne die häufigsten Einwände genau und habe wirksame Strategien entwickelt, um sie zu adressieren",
        ],
        naLabel: "Aktuell nicht relevant",
      },
    ],
  },
  {
    id: 1,
    key: "M1",
    title: "Angebot & Positionierung",
    questions: [
      { id: "1.1", title: "Problemidentifikation", text: "Ich kann das konkrete Problem, das ich löse, messerscharf benennen." },
      { id: "1.2", title: "Zielgruppendefinition", text: "Ich weiß ganz genau, für wen ich dieses Problem löse." },
      { id: "1.3", title: "Differenzierung", text: "Ich kann klar benennen, wodurch sich mein Angebot von relevanten Wettbewerbern unterscheidet." },
      { id: "1.4", title: "Visuelle Abgrenzung", text: "Mein Markenauftritt wirkt professionell und unterstützt die Wahrnehmung meines Angebots." },
      { id: "1.5", title: "Nutzenversprechen", text: "Ich habe ein glasklares, leicht verständliches Nutzenversprechen (Value Proposition) formuliert." },
      { id: "1.6", title: "Markenversprechen", text: "Ein Außenstehender versteht schnell, welches Problem wir lösen und welchen Nutzen wir bieten." },
      { id: "1.7", title: "Preisstrategie", text: "Meine Preisgestaltung basiert auf einer bewussten Strategie und nicht auf Schätzungen oder Bauchgefühl." },
      { id: "1.8", title: "Elevator Pitch", text: "Ich kann mein Angebot innerhalb von 30 Sekunden verständlich erklären.", isNew: true },
    ],
  },
  {
    id: 2,
    key: "M2",
    title: "Zielgruppe & Kundenverständnis",
    questions: [
      { id: "2.1", title: "Zielgruppenbeschreibung", text: "Ich habe eine detaillierte, schriftliche Beschreibung meiner Zielgruppe." },
      { id: "2.2", title: "Wunschkunden-Profil", text: "Ich habe ein klares Profil meines idealen Wunschkunden (Persona)." },
      { id: "2.3", title: "Kundenprobleme", text: "Ich kann die wichtigsten Probleme und Herausforderungen meiner Zielgruppe konkret benennen." },
      { id: "2.4", title: "Kaufmotive", text: "Ich kenne die wichtigsten Gründe, warum Kunden mein Angebot kaufen würden." },
      { id: "2.5", title: "Tonalität & Bildsprache", text: "Meine visuelle Kommunikation (Bilder, Design, Sprache) ist bewusst auf meine Zielgruppe abgestimmt." },
      {
        id: "2.6",
        title: "Kundeninterviews",
        text: "Ich führe regelmäßig Interviews mit potenziellen oder echten Kunden, um sie besser zu verstehen.",
        scaleLabels: [
          "Ich habe noch keine Kundeninterviews geführt",
          "Ich habe erste Gespräche mit potenziellen Kunden geführt",
          "Ich habe mehrere Kundeninterviews durchgeführt",
          "Ich führe regelmäßig Kundeninterviews durch und nutze die Erkenntnisse",
          "Kundeninterviews sind ein fester Bestandteil meiner Weiterentwicklung von Angebot und Marketing",
        ],
      },
      { id: "2.7", title: "Kundenreise", text: "Ich habe die einzelnen Schritte dokumentiert, die ein Kunde vom Erstkontakt bis zum Kauf durchläuft (Customer Journey)." },
      { id: "2.8", title: "Zielgruppenschärfe", text: "Ich kann klar benennen, welche Kunden ausdrücklich NICHT zu meiner Zielgruppe gehören.", isNew: true },
    ],
  },
  {
    id: 3,
    key: "M3",
    title: "Sichtbarkeit & Reichweite",
    questions: [
      { id: "3.1", title: "Website-Präsenz", text: "Wir haben eine eigene Website live geschaltet." },
      { id: "3.2", title: "Visueller Markenauftritt", text: "Unsere Website und Online- wie Offline-Kanäle vermitteln einen professionellen und konsistenten Eindruck." },
      { id: "3.3", title: "Website-Struktur & UX", text: "Unsere Website ist nutzerfreundlich aufgebaut, sodass Besucher sich intuitiv zurechtfinden." },
      { id: "3.4", title: "Google-Unternehmensprofil", text: "Unser Google-Unternehmensprofil ist vollständig eingerichtet, aktuell und wird regelmäßig gepflegt." },
      { id: "3.5", title: "LinkedIn-Präsenz", text: "Wir nutzen LinkedIn regelmäßig, um unsere Zielgruppe zu erreichen und geschäftliche Kontakte aufzubauen." },
      { id: "3.6", title: "Instagram-Präsenz", text: "Wir nutzen Instagram regelmäßig, um unsere Zielgruppe zu erreichen und unsere Marke sichtbar zu machen." },
      { id: "3.7", title: "Veranstaltungen", text: "Wir nutzen Veranstaltungen gezielt, um Sichtbarkeit, Kontakte oder Kunden zu gewinnen." },
      { id: "3.8", title: "PR & Pressearbeit", text: "Wir nutzen Pressearbeit gezielt, um unsere Bekanntheit und Glaubwürdigkeit zu erhöhen." },
      { id: "3.9", title: "Netzwerkaktivitäten", text: "Wir nehmen regelmäßig an Netzwerkveranstaltungen teil und bauen aktiv neue Kontakte auf." },
      { id: "3.10", title: "Kanalstrategie", text: "Wir haben bewusst entschieden, welche Marketingkanäle wir nutzen und welche nicht.", isNew: true },
    ],
  },
  {
    id: 4,
    key: "M4",
    title: "Content-Marketing",
    questions: [
      { id: "4.1", title: "Themenplanung", text: "Wir arbeiten mit einem strukturierten Redaktions- oder Themenplan." },
      { id: "4.2", title: "Content-Ideen", text: "Wir verfügen über einen strukturierten Prozess zur Sammlung und Entwicklung neuer Content-Ideen." },
      { id: "4.3", title: "LinkedIn-Content", text: "Wir veröffentlichen regelmäßig qualitativen Content auf LinkedIn." },
      { id: "4.4", title: "Instagram-Content", text: "Wir bespielen Instagram regelmäßig mit zielgruppengerechten Inhalten." },
      { id: "4.5", title: "Blog", text: "Wir nutzen einen eigenen Blog auf unserer Website, um Expertise und SEO-Reichweite aufzubauen." },
      { id: "4.6", title: "Newsletter-Inhalte", text: "Wir schreiben regelmäßig wertvollen Content für unsere E-Mail-Abonnenten." },
      { id: "4.7", title: "KI-Unterstützung", text: "Wir nutzen KI-Tools regelmäßig zur Unterstützung unserer Content-Erstellung." },
      { id: "4.8", title: "Rechtssicherheit & Lizenzen", text: "Wir haben geklärt, welche Bilder, Schriften und Inhalte wir rechtssicher verwenden dürfen." },
      { id: "4.9", title: "Content-Ziele", text: "Jeder veröffentlichte Inhalt verfolgt ein konkretes Ziel (Vertrauen, Reichweite, Leads oder Verkauf).", isNew: true },
    ],
  },
  {
    id: 5,
    key: "M5",
    title: "Leadgenerierung",
    questions: [
      { id: "5.1", title: "Leadquellen", text: "Wir wissen genau, über welche Kanäle unsere potenziellen Kontakte (Leads) kommen." },
      { id: "5.2", title: "Leadmagneten", text: "Wir haben attraktive 0€-Produkte (Whitepaper, Checklisten etc.), um Kontaktdaten einzusammeln." },
      { id: "5.3", title: "Landingpages", text: "Wir nutzen optimierte Landingpages, die speziell darauf ausgelegt sind, Kontakte zu generieren." },
      { id: "5.4", title: "Conversion-Optimierung", text: "Unsere Landingpages sind so gestaltet, dass die Hemmschwelle zur Eintragung minimal ist." },
      { id: "5.5", title: "Kontaktformulare", text: "Unsere Formulare auf der Website funktionieren technisch einwandfrei und sind einfach auszufüllen." },
      { id: "5.6", title: "Newsletter-Anmeldung", text: "Der Anmeldeprozess für unseren Newsletter ist prominent platziert und wird genutzt." },
      { id: "5.7", title: "Workshops & Events", text: "Wir nutzen eigene Mini-Events oder Webinare gezielt zur Gewinnung neuer Kontakte." },
      { id: "5.8", title: "Leadqualität", text: "Wir gewinnen regelmäßig Kontakte, die tatsächlich zu unserer Zielgruppe gehören.", isNew: true },
    ],
  },
  {
    id: 6,
    key: "M6",
    title: "Vertriebsprozess",
    questions: [
      { id: "6.1", title: "Buchungsweg", text: "Interessenten können auf unserer Website mit max. 2 Klicks unkompliziert ein Erstgespräch buchen (z. B. per Calendly)." },
      { id: "6.2", title: "Erstgespräch", text: "Wir haben einen klaren, erprobten Leitfaden für das erste Kennenlerngespräch." },
      { id: "6.3", title: "Bedarfsermittlung", text: "Wir können im Gespräch den genauen Bedarf und die Zahlungsbereitschaft des Kunden filtern." },
      { id: "6.4", title: "Angebotsprozess", text: "Unser Prozess zur Erstellung und Zusendung von Angeboten läuft schnell und standardisiert." },
      { id: "6.5", title: "Nachfassen", text: "Wir haken bei offenen Angeboten nach einem festen System und Zeitplan nach." },
      { id: "6.6", title: "Einwandbehandlung", text: "Wir können mit typischen Kundeneinwänden (z. B. „Zu teuer\", „Keine Zeit\") souverän umgehen." },
      { id: "6.7", title: "Abschluss", text: "Wir führen Verkaufsgespräche gezielt und erfolgreich zum Vertragsabschluss." },
      { id: "6.8", title: "Vertriebszahlen", text: "Wir wissen, wie viele Gespräche, Angebote und Abschlüsse wir durchschnittlich benötigen, um einen Kunden zu gewinnen.", isNew: true },
    ],
  },
  {
    id: 7,
    key: "M7",
    title: "Kundenbindung & Empfehlungen",
    note: "⚠️ Falls noch keine Kunden vorhanden sind, bitte bei allen Fragen N/A auswählen.",
    questions: [
      { id: "7.1", title: "Kundenzufriedenheit", text: "Wir messen und überprüfen systematisch die Zufriedenheit unserer bestehenden Kunden." },
      { id: "7.2", title: "Wiederkäufer", text: "Wir haben Angebote, die dazu führen, dass Kunden regelmäßig wieder bei uns kaufen." },
      { id: "7.3", title: "Cross-Selling", text: "Wir verkaufen bestehenden Kunden erfolgreich ergänzende Produkte oder Services." },
      { id: "7.4", title: "Upselling", text: "Wir schaffen es, Kunden erfolgreich in unsere höherpreisigen Angebote zu entwickeln." },
      { id: "7.5", title: "Referenzen", text: "Wir bereiten Kundenerfolge aktiv als Case Studies oder Referenzen für unser Marketing auf." },
      { id: "7.6", title: "Bewertungen", text: "Wir haben ein System, um kontinuierlich Sterne-Bewertungen (z. B. Google, Trustpilot) zu sammeln." },
      { id: "7.7", title: "Empfehlungsmarketing", text: "Wir fordern zufriedene Kunden aktiv und systematisch auf, uns weiterzuempfehlen." },
    ],
  },
  {
    id: 8,
    key: "M8",
    title: "Systeme & Automatisierung",
    questions: [
      { id: "8.1", title: "CRM", text: "Wir nutzen ein funktionierendes CRM-System (Customer-Relationship-Management) für unsere Kundendaten." },
      { id: "8.2", title: "Kontaktdatenbank", text: "Unsere Kontakte sind sauber segmentiert und gepflegt, statt in Excel-Listen verstreut zu sein." },
      { id: "8.3", title: "E-Mail-Marketing", text: "Wir nutzen ein professionelles Tool für den automatisierten Versand von E-Mails." },
      { id: "8.4", title: "Automatisierungen", text: "Standardprozesse (z. B. Rechnungsstellung, Terminbestätigung) laufen bei uns vollautomatisch." },
      { id: "8.5", title: "KI-Tools", text: "Wir nutzen KI im Alltag, um zeitraubende Routineaufgaben zu automatisieren." },
      { id: "8.6", title: "Dokumentation von Prozessen", text: "Unsere wichtigsten internen Abläufe sind schriftlich als Standard (SOP) dokumentiert." },
      { id: "8.7", title: "Datenschutzkonforme Plattformen", text: "Unser kompletter Tech-Stack (CRM, Hosting, Tools) ist absolut DSGVO-konform aufgesetzt (Serverstandorte, AV-Verträge)." },
      { id: "8.8", title: "Datensicherheit", text: "Wir haben klare Regeln für den Umgang mit Kundendaten und Zugriffsrechten.", isNew: true },
    ],
  },
  {
    id: 9,
    key: "M9",
    title: "Marketing- & Vertriebsplanung",
    questions: [
      { id: "9.1", title: "Ziele", text: "Wir haben smarte, messbare Umsatz- und Kundengewinnungsziele schriftlich fixiert." },
      { id: "9.2", title: "Maßnahmen", text: "Unsere täglichen Marketing-Aktionen leiten sich logisch aus unseren Jahreszielen ab." },
      { id: "9.3", title: "Prioritäten", text: "Ich weiß an jedem Arbeitstag ganz genau, welche Vertriebsaufgabe die höchste Priorität hat." },
      { id: "9.4", title: "Budget", text: "Wir haben ein klares Werbe- und Marketingbudget, das wir monatlich überwachen." },
      { id: "9.5", title: "Zeitplanung", text: "Unsere Kampagnen und Launches sind zeitlich präzise im Voraus geplant." },
      { id: "9.6", title: "90-Tage-Plan", text: "Wir steuern das Unternehmen nach einem agilen und fokussierten 90-Tage-Plan." },
      { id: "9.7", title: "Fokus", text: "Wir verfolgen konsequent wenige Prioritäten statt viele parallele Marketingmaßnahmen.", isNew: true },
    ],
  },
  {
    id: 10,
    key: "M10",
    title: "Partnerschaften & Netzwerke",
    questions: [
      { id: "10.1", title: "Strategische Partner", text: "Wir arbeiten mit festen Partnern zusammen, deren Angebot unseres perfekt ergänzt." },
      { id: "10.2", title: "Multiplikatoren", text: "Wir haben Kontakte zu Personen, die Zugang zu unserer gesamten Zielgruppe haben und uns empfehlen." },
      { id: "10.3", title: "Branchenverbände", text: "Wir nutzen die Mitgliedschaft in Branchenverbänden aktiv für unsere Positionierung und Kontakte." },
      { id: "10.4", title: "Gründernetzwerke", text: "Wir sind in Startup-Hubs und Gründernetzwerken aktiv integriert." },
      { id: "10.5", title: "Förderinstitutionen", text: "Wir stehen im Austausch mit Institutionen für Fördermittel oder Gründerstipendien." },
      { id: "10.6", title: "Kooperationen", text: "Wir führen gemeinsame Aktionen (z. B. Live-Events, Co-Marketing) mit anderen Unternehmen durch." },
      { id: "10.7", title: "Empfehlungsnetzwerke", text: "Wir sind Teil von festen Business-Netzwerken, die sich gegenseitig Aufträge zuspielen." },
      { id: "10.8", title: "Nutzen des Netzwerks", text: "Unsere Netzwerke und Partnerschaften führen regelmäßig zu Kontakten, Kunden oder Geschäftsmöglichkeiten.", isNew: true },
    ],
  },
];

export const STAGE_OPTIONS = [
  { value: "", label: "Bitte wählen ..." },
  { value: "idea", label: "Noch in der Ideen-/Planungsphase" },
  { value: "0-6m", label: "0–6 Monate nach Gründung" },
  { value: "6-12m", label: "6–12 Monate nach Gründung" },
  { value: "1-2y", label: "1–2 Jahre nach Gründung" },
  { value: "2y+", label: "Mehr als 2 Jahre nach Gründung" },
];
