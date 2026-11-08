import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/ListingPage";
import { OpportunityBrowser } from "@/components/OpportunityBrowser";

export const Route = createFileRoute("/hackathons")({
  head: () => ({
    meta: [
      { title: "Nearest Hackathons & Competitions in India (2026–2027) — Vybe Driven (Vybe)" },
      { name: "description", content: "Explore the nearest hackathons and coding competitions on Vybe Driven (Vybe). Find 24h college hackathons, AI challenges, and startup sprints in Mumbai, Pune, Bangalore & all-India." },
      { name: "keywords", content: "goa buildathon 2027, goa buildathon, nearest hackathon, hackathons near me, hackathons in mumbai, hackathons in goa, hackathons in india 2026, upcoming hackathons 2027, 36 hour hackathon, coding competitions, student hackathons, college hackathons, vybe driven, vybe, vibe driven, vibe" },
      { property: "og:title", content: "Nearest Hackathons & Competitions in India — Vybe Driven" },
      { property: "og:description", content: "Explore the nearest hackathons and coding competitions on Vybe Driven (Vybe). Turn your code into cash prizes, internships & startup incubation." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vybedriven.in/hackathons" },
      { property: "og:image", content: "https://www.vybedriven.in/vybe-driven.png" },
      { property: "og:site_name", content: "Vybe Driven" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nearest Hackathons & Competitions in India — Vybe Driven" },
      { name: "twitter:description", content: "Explore the nearest hackathons and coding competitions on Vybe Driven (Vybe)." },
      { name: "twitter:image", content: "https://www.vybedriven.in/vybe-driven.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://www.vybedriven.in/hackathons" },
    ],
  }),
  component: HackathonsPage,
});

function HackathonsPage() {
  return <ListingPage eyebrow="COMPETE & BUILD" title="Hackathons for builders who ship." description="Discover focused challenges, ambitious teams and real opportunities to turn an idea into impact."><OpportunityBrowser allowedTypes={["Hackathon", "Competition"]} /></ListingPage>;
}