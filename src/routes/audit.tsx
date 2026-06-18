import { createFileRoute } from "@tanstack/react-router";
import { AuditPage } from "@/components/audit/AuditPage";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit · Startup Marketing Selbstcheck" },
      {
        name: "description",
        content:
          "Direkter Link zum Startup-Marketing-Audit. 11 Module, ca. 15–20 Minuten, mit KI-fertigem Export.",
      },
      { property: "og:title", content: "Audit · Startup Marketing Selbstcheck" },
      {
        property: "og:description",
        content:
          "Direkter Link zum Startup-Marketing-Audit – mit KI-fertiger Workshop-Auswertung.",
      },
    ],
  }),
  component: AuditPage,
});
