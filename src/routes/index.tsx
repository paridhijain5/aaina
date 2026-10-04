import { createFileRoute } from "@tanstack/react-router";
import App from "@/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aaina — a mirror for your F&O trades" },
      { name: "description", content: "See your own past F&O trading behaviour honestly. Runs fully in your browser." },
      { property: "og:title", content: "Aaina — a mirror for your F&O trades" },
      { property: "og:description", content: "See your own past F&O trading behaviour honestly. Runs fully in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});
