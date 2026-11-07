import { createFileRoute } from "@tanstack/react-router";
import { ListingPage } from "@/components/ListingPage";
import { OpportunityBrowser } from "@/components/OpportunityBrowser";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Upcoming Tech Events & Developer Meetups in Mumbai & India — Vybe Driven (Vybe)" },
      { name: "description", content: "Find local technology meetups, developer conferences, and networking events near you on Vybe Driven (Vybe / Vibe Driven). Connect with tech leaders, founders & engineers." },
      { name: "keywords", content: "tech events near me, nearest tech events, developer meetups mumbai, tech conferences india, vybe driven, vybe, vibe driven, vibe, networking events mumbai" },
      { property: "og:title", content: "Upcoming Tech Events & Developer Meetups in India — Vybe Driven" },
      { property: "og:description", content: "Find local technology meetups, developer conferences, and networking events near you on Vybe Driven." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vybedriven.in/events" },
      { property: "og:image", content: "https://www.vybedriven.in/vybe-driven.png" },
      { property: "og:site_name", content: "Vybe Driven" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tech Events & Developer Meetups — Vybe Driven" },
      { name: "twitter:description", content: "Find local technology meetups, developer conferences, and networking events near you on Vybe Driven." },
      { name: "twitter:image", content: "https://www.vybedriven.in/vybe-driven.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://www.vybedriven.in/events" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return <ListingPage eyebrow="MEET THE COMMUNITY" title="Events worth showing up for." description="Browse meetups, conferences and networking experiences created for curious technology builders."><OpportunityBrowser allowedTypes={["Meetup", "Conference", "Networking"]} /></ListingPage>;
}