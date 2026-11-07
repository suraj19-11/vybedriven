import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/ListingPage";
import { OpportunityBrowser } from "@/components/OpportunityBrowser";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover All Hackathons, Competitions & Tech Summits in India — Vybe Driven" },
      { name: "description", content: "Search and filter every national hackathon, college coding contest, AI summit, and creator award across Mumbai, Pune, Delhi, Bangalore and online on Vybe Driven." },
      { name: "keywords", content: "discover hackathons, search hackathons india, all hackathons 2026, college competitions, vybe driven, vybe, vibe, coding challenges, nearest hackathon" },
      { property: "og:title", content: "Discover All Hackathons, Competitions & Tech Summits — Vybe Driven" },
      { property: "og:description", content: "Search and filter every national hackathon, college coding contest, AI summit, and creator award on Vybe Driven." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vybedriven.in/discover" },
      { property: "og:image", content: "https://www.vybedriven.in/vybe-driven.png" },
      { property: "og:site_name", content: "Vybe Driven" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Discover All Hackathons & Tech Events — Vybe Driven" },
      { name: "twitter:description", content: "Search and filter every national hackathon, college coding contest, and tech summit on Vybe Driven." },
      { name: "twitter:image", content: "https://www.vybedriven.in/vybe-driven.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://www.vybedriven.in/discover" },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  return <ListingPage eyebrow="EXPLORE EVERYTHING" title="Your next opportunity starts here." description="Search all hackathons, competitions, meetups, conferences and networking events in one place."><OpportunityBrowser showTypeFilter /></ListingPage>;
}