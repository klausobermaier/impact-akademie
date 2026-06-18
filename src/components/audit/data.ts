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
      {
        id: "1.1",
        title: "Problemidentifikation",
        text: "Ich kann das konkrete Problem, das ich löse, messerscharf benennen.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Überlegungen vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "1.2",
        title: "Zielgruppendefinition",
        text: "Ich weiß ganz genau, für wen ich dieses Problem löse.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Überlegungen vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "1.3",
        title: "Differenzierung",
        text: "Ich kann klar benennen, wodurch sich mein Angebot von relevanten Wettbewerbern unterscheidet.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Unterscheidungsmerkmale identifiziert",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "1.4",
        title: "Visuelle Abgrenzung",
        text: "Mein Markenauftritt wirkt professionell und unterstützt die Wahrnehmung meines Angebots.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Ansätze vorhanden",
          "Teilweise umgesetzt",
          "Professionell umgesetzt",
          "Professionell umgesetzt und konsistent etabliert",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "1.5",
        title: "Nutzenversprechen",
        text: "Ich habe ein glasklares, leicht verständliches Nutzenversprechen (Value Proposition) formuliert.",
        scaleLabels: [
          "Nicht formuliert",
          "Erste Formulierungen vorhanden",
          "Teilweise ausgearbeitet",
          "Klar formuliert",
          "Klar formuliert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "1.6",
        title: "Markenversprechen",
        text: "Ein Außenstehender versteht schnell, welches Problem wir lösen und welchen Nutzen wir bieten.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Ansätze vorhanden",
          "Teilweise ausgearbeitet",
          "Klar verständlich kommuniziert",
          "Klar verständlich kommuniziert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "1.7",
        title: "Preisstrategie",
        text: "Meine Preisgestaltung basiert auf einer bewussten Strategie und nicht auf Schätzungen oder Bauchgefühl.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Preisüberlegungen vorhanden",
          "Preisstrategie teilweise ausgearbeitet",
          "Preisstrategie klar definiert",
          "Preisstrategie am Markt erprobt und bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "1.8",
        title: "Elevator Pitch",
        text: "Ich kann mein Angebot innerhalb von 30 Sekunden verständlich erklären.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Formulierung vorhanden",
          "Teilweise ausgearbeitet",
          "Klar und verständlich formuliert",
          "Klar formuliert und in Gesprächen erfolgreich erprobt",
        ],
        naLabel: "Nicht relevant",
      },
    ],
  },
  {
    id: 2,
    key: "M2",
    title: "Zielgruppe & Kundenverständnis",
    questions: [
      {
        id: "2.1",
        title: "Zielgruppenbeschreibung",
        text: "Ich habe eine detaillierte, schriftliche Beschreibung meiner Zielgruppe.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Erkenntnisse vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "2.2",
        title: "Wunschkunden-Profil",
        text: "Ich habe ein klares Profil meines idealen Wunschkunden (Persona).",
        scaleLabels: [
          "Nicht definiert",
          "Erste Erkenntnisse vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "2.3",
        title: "Kundenprobleme",
        text: "Ich kann die wichtigsten Probleme und Herausforderungen meiner Zielgruppe konkret benennen.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Erkenntnisse vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "2.4",
        title: "Kaufmotive",
        text: "Ich kenne die wichtigsten Gründe, warum Kunden mein Angebot kaufen würden.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Erkenntnisse vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "2.5",
        title: "Tonalität & Bildsprache",
        text: "Meine visuelle Kommunikation (Bilder, Design, Sprache) ist bewusst auf meine Zielgruppe abgestimmt.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Erkenntnisse vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "2.6",
        title: "Kundeninterviews",
        text: "Ich führe regelmäßig Interviews mit potenziellen oder echten Kunden, um sie besser zu verstehen.",
        scaleLabels: [
          "Keine Kundeninterviews geführt",
          "Erste Gespräche geführt",
          "Mehrere Kundeninterviews durchgeführt",
          "Regelmäßige Kundeninterviews durchgeführt",
          "Kundeninterviews sind fester Bestandteil der Weiterentwicklung",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "2.7",
        title: "Kundenreise",
        text: "Ich habe die einzelnen Schritte dokumentiert, die ein Kunde vom Erstkontakt bis zum Kauf durchläuft (Customer Journey).",
        scaleLabels: [
          "Nicht definiert",
          "Erste Erkenntnisse vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "2.8",
        title: "Zielgruppenschärfe",
        text: "Ich kann klar benennen, welche Kunden ausdrücklich NICHT zu meiner Zielgruppe gehören.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Erkenntnisse vorhanden",
          "Teilweise ausgearbeitet",
          "Klar definiert",
          "Klar definiert und durch Kundenfeedback bestätigt",
        ],
        naLabel: "Nicht relevant",
      },
    ],
  },
  {
    id: 3,
    key: "M3",
    title: "Sichtbarkeit & Reichweite",
    questions: [
      {
        id: "3.1",
        title: "Website-Präsenz",
        text: "Wir haben eine eigene Website live geschaltet.",
        scaleLabels: [
          "Nicht vorhanden",
          "In Planung oder im Aufbau",
          "Vorhanden, aber unvollständig",
          "Live und einsatzfähig",
          "Professionell aufgebaut und unterstützt aktiv die Kundengewinnung",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.2",
        title: "Visueller Markenauftritt",
        text: "Unsere Website und Online- wie Offline-Kanäle vermitteln einen professionellen und konsistenten Eindruck.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Ansätze vorhanden",
          "Teilweise umgesetzt",
          "Konsistent umgesetzt",
          "Professionell umgesetzt und unterstützt die Markenwahrnehmung",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.3",
        title: "Website-Struktur & UX",
        text: "Unsere Website ist nutzerfreundlich aufgebaut, sodass Besucher sich intuitiv zurechtfinden.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Ansätze vorhanden",
          "Teilweise umgesetzt",
          "Nutzerfreundlich aufgebaut",
          "Nutzerfreundlich aufgebaut und regelmäßig optimiert",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.4",
        title: "Google-Unternehmensprofil",
        text: "Unser Google-Unternehmensprofil ist vollständig eingerichtet, aktuell und wird regelmäßig gepflegt.",
        scaleLabels: [
          "Nicht vorhanden",
          "Angelegt",
          "Teilweise gepflegt",
          "Vollständig eingerichtet und gepflegt",
          "Aktiv genutzt und liefert regelmäßig Anfragen oder Sichtbarkeit",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.5",
        title: "LinkedIn-Präsenz",
        text: "Wir nutzen LinkedIn regelmäßig, um unsere Zielgruppe zu erreichen und geschäftliche Kontakte aufzubauen.",
        scaleLabels: [
          "Nicht vorhanden",
          "Profil vorhanden",
          "Gelegentliche Nutzung",
          "Regelmäßige Nutzung",
          "Regelmäßige Nutzung mit nachweisbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.6",
        title: "Instagram-Präsenz",
        text: "Wir nutzen Instagram regelmäßig, um unsere Zielgruppe zu erreichen und unsere Marke sichtbar zu machen.",
        scaleLabels: [
          "Nicht vorhanden",
          "Profil vorhanden",
          "Gelegentliche Nutzung",
          "Regelmäßige Nutzung",
          "Regelmäßige Nutzung mit nachweisbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.7",
        title: "Veranstaltungen",
        text: "Wir nutzen Veranstaltungen gezielt, um Sichtbarkeit, Kontakte oder Kunden zu gewinnen.",
        scaleLabels: [
          "Nicht genutzt",
          "Erste Teilnahme geplant",
          "Gelegentliche Nutzung",
          "Regelmäßige Nutzung",
          "Regelmäßige Nutzung mit messbarem Nutzen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.8",
        title: "PR & Pressearbeit",
        text: "Wir nutzen Pressearbeit gezielt, um unsere Bekanntheit und Glaubwürdigkeit zu erhöhen.",
        scaleLabels: [
          "Nicht genutzt",
          "Erste Ansätze vorhanden",
          "Gelegentliche Aktivitäten",
          "Regelmäßige Aktivitäten",
          "Regelmäßige Aktivitäten mit messbarer Wirkung",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.9",
        title: "Netzwerkaktivitäten",
        text: "Wir nehmen regelmäßig an Netzwerkveranstaltungen teil und bauen aktiv neue Kontakte auf.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Kontakte vorhanden",
          "Gelegentliche Aktivitäten",
          "Regelmäßige Aktivitäten",
          "Regelmäßige Aktivitäten mit konkreten Geschäftschancen oder Kundenkontakten",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "3.10",
        title: "Kanalstrategie",
        text: "Wir haben bewusst entschieden, welche Marketingkanäle wir nutzen und welche nicht.",
        scaleLabels: [
          "Nicht definiert",
          "Erste Überlegungen vorhanden",
          "Teilweise festgelegt",
          "Klar definiert",
          "Klar definiert und anhand von Ergebnissen regelmäßig überprüft",
        ],
        naLabel: "Nicht relevant",
      },
    ],
  },
  {
    id: 4,
    key: "M4",
    title: "Content-Marketing",
    questions: [
      {
        id: "4.1",
        title: "Themenplanung",
        text: "Wir arbeiten mit einem strukturierten Redaktions- oder Themenplan.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Ansätze vorhanden",
          "Teilweise geplant",
          "Regelmäßig geplant",
          "Systematisch geplant und umgesetzt",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "4.2",
        title: "Content-Ideen",
        text: "Wir verfügen über einen strukturierten Prozess zur Sammlung und Entwicklung neuer Content-Ideen.",
        scaleLabels: [
          "Keine Ideenquelle vorhanden",
          "Einzelne Ideen vorhanden",
          "Ideen werden gelegentlich gesammelt",
          "Kontinuierlicher Ideenpool vorhanden",
          "Systematischer Prozess zur Ideengenerierung etabliert",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "4.3",
        title: "LinkedIn-Content",
        text: "Wir veröffentlichen regelmäßig qualitativen Content auf LinkedIn.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Beiträge veröffentlicht",
          "Gelegentliche Veröffentlichung",
          "Regelmäßige Veröffentlichung",
          "Regelmäßige Veröffentlichung mit messbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "4.4",
        title: "Instagram-Content",
        text: "Wir bespielen Instagram regelmäßig mit zielgruppengerechten Inhalten.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Newsletter versendet",
          "Gelegentliche Versendung",
          "Regelmäßige Versendung",
          "Regelmäßige Versendung mit messbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "4.5",
        title: "Blog",
        text: "Wir nutzen einen eigenen Blog auf unserer Website, um Expertise und SEO-Reichweite aufzubauen.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Newsletter versendet",
          "Gelegentliche Versendung",
          "Regelmäßige Versendung",
          "Regelmäßige Versendung mit messbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "4.6",
        title: "Newsletter-Inhalte",
        text: "Wir schreiben regelmäßig wertvollen Content für unsere E-Mail-Abonnenten.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Newsletter versendet",
          "Gelegentliche Versendung",
          "Regelmäßige Versendung",
          "Regelmäßige Versendung mit messbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "4.7",
        title: "KI-Unterstützung",
        text: "Wir nutzen KI-Tools regelmäßig zur Unterstützung unserer Content-Erstellung.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Newsletter versendet",
          "Gelegentliche Versendung",
          "Regelmäßige Versendung",
          "Regelmäßige Versendung mit messbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "4.8",
        title: "Rechtssicherheit & Lizenzen",
        text: "Wir haben geklärt, welche Bilder, Schriften und Inhalte wir rechtssicher verwenden dürfen.",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Newsletter versendet",
          "Gelegentliche Versendung",
          "Regelmäßige Versendung",
          "Regelmäßige Versendung mit messbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
      {
        id: "4.9",
        title: "Content-Ziele",
        text: "Jeder veröffentlichte Inhalt verfolgt ein konkretes Ziel (Vertrauen, Reichweite, Leads oder Verkauf).",
        scaleLabels: [
          "Nicht vorhanden",
          "Erste Newsletter versendet",
          "Gelegentliche Versendung",
          "Regelmäßige Versendung",
          "Regelmäßige Versendung mit messbaren Ergebnissen",
        ],
        naLabel: "Nicht relevant",
      },
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
      { id: "5.4", title: "Conversion-Optimierung", text: "Unsere Kontakt- oder Leadgewinnungsprozesse sind darauf ausgelegt, Interessenten möglichst einfach zur Kontaktaufnahme zu bewegen." },
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
      { id: "6.1", title: "Buchungsweg", text: "Interessenten können unkompliziert mit uns Kontakt aufnehmen und ein Erstgespräch vereinbaren." },
      { id: "6.2", title: "Erstgespräch", text: "Wir haben einen klaren, erprobten Leitfaden für das erste Kennenlerngespräch." },
      { id: "6.3", title: "Bedarfsermittlung", text: "Wir können im Gespräch den genauen Bedarf und die Zahlungsbereitschaft des Kunden filtern." },
      { id: "6.4", title: "Angebotsprozess", text: "Unser Prozess zur Erstellung und Zusendung von Angeboten läuft schnell und standardisiert." },
      { id: "6.5", title: "Nachfassen", text: "Wir haken bei offenen Angeboten nach einem festen System und Zeitplan nach." },
      { id: "6.6", title: "Einwandbehandlung", text: "Wir können mit typischen Kundeneinwänden (z. B. „Zu teuer\", „Keine Zeit\") souverän umgehen." },
      { id: "6.7", title: "Abschluss", text: "Wir führen Verkaufsgespräche strukturiert und zielgerichtet bis zu einer Entscheidung." },
      { id: "6.8", title: "Vertriebszahlen", text: "Wir erfassen und analysieren regelmäßig die wichtigsten Kennzahlen unseres Vertriebsprozesses.", isNew: true },
    ],
  },
  {
    id: 7,
    key: "M7",
    title: "Kundenbindung & Empfehlungen",
    note: "⚠️ Falls noch keine Kunden vorhanden sind, bitte bei allen Fragen N/A auswählen.",
    questions: [
      { id: "7.1", title: "Kundenzufriedenheit", text: "Wir messen und überprüfen systematisch die Zufriedenheit unserer bestehenden Kunden." },
      { id: "7.2", title: "Wiederkäufer", text: "Wir haben Maßnahmen etabliert, die bestehende Kunden zu weiteren Käufen motivieren." },
      { id: "7.3", title: "Cross-Selling", text: "Wir bieten bestehenden Kunden passende ergänzende Produkte oder Dienstleistungen an." },
      { id: "7.4", title: "Upselling", text: "Wir bieten höherwertige Angebote an, die für bestehende Kunden attraktiv sind." },
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
      { id: "8.1", title: "CRM", text: "Wir verwalten Kunden- und Interessentendaten systematisch und zentral." },
      { id: "8.2", title: "Kontaktdatenbank", text: "Unsere Kontakte sind sauber segmentiert und gepflegt, statt in Excel-Listen verstreut zu sein." },
      { id: "8.3", title: "E-Mail-Marketing", text: "Wir nutzen geeignete Werkzeuge für die regelmäßige Kommunikation mit Interessenten und Kunden." },
      { id: "8.4", title: "Automatisierungen", text: "Standardprozesse (z. B. Rechnungsstellung, Terminbestätigung) laufen bei uns vollautomatisch." },
      { id: "8.5", title: "KI-Tools", text: "Wir nutzen KI-Tools, um wiederkehrende Aufgaben effizienter zu erledigen." },
      { id: "8.6", title: "Dokumentation von Prozessen", text: "Unsere wichtigsten internen Abläufe sind schriftlich als Standard (SOP) dokumentiert." },
      { id: "8.7", title: "Datenschutzkonforme Plattformen", text: "Wir haben geprüft, dass unsere wichtigsten Systeme und Tools datenschutzkonform eingesetzt werden." },
      { id: "8.8", title: "Datensicherheit", text: "Wir haben klare Regeln für den Umgang mit Kundendaten und Zugriffsrechten.", isNew: true },
    ],
  },
  {
    id: 9,
    key: "M9",
    title: "Marketing- & Vertriebsplanung",
    questions: [
      { id: "9.1", title: "Ziele", text: "Wir haben smarte, messbare Umsatz- und Kundengewinnungsziele schriftlich fixiert." },
      { id: "9.2", title: "Maßnahmen", text: "Unsere Marketing- und Vertriebsaktivitäten leiten sich logisch aus unseren Unternehmenszielen ab." },
      { id: "9.3", title: "Prioritäten", text: "Ich weiß an jedem Arbeitstag ganz genau, welche Vertriebsaufgabe die höchste Priorität hat." },
      { id: "9.4", title: "Budget", text: "Wir planen und überwachen die Ressourcen, die wir für Marketing und Vertrieb einsetzen." },
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
      { id: "10.3", title: "Branchenverbände", text: "Wir nutzen relevante Branchen- oder Fachnetzwerke aktiv für unsere Sichtbarkeit und Geschäftsentwicklung." },
      { id: "10.4", title: "Gründernetzwerke", text: "Wir sind in Startup-Hubs und Gründernetzwerken aktiv integriert." },
      { id: "10.5", title: "Förderinstitutionen", text: "Wir kennen und nutzen relevante Förder- oder Unterstützungsangebote für unser Unternehmen." },
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
