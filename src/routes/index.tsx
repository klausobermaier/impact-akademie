import { createFileRoute } from "@tanstack/react-router";
import { AuditPage } from "@/components/audit/AuditPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Startup Marketing Audit – Selbstcheck" },
      {
        name: "description",
        content:
          "Selbstcheck für Gründer & Startups: 11 Module rund um Marktvalidierung, Marketing, Vertrieb und Systeme. In 15–20 Minuten zur Workshop-Auswertung.",
      },
      { property: "og:title", content: "Startup Marketing Audit – Selbstcheck" },
      {
        property: "og:description",
        content:
          "Selbstcheck für Gründer & Startups – 11 Module, KI-fertige Auswertung in 15–20 Minuten.",
      },
    ],
  }),
  component: AuditPage,
});
