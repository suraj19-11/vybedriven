import { useMemo, useState } from "react";
import { Calendar, MapPin, Search, Trophy, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { type Opportunity, type OpportunityType } from "@/data/opportunities";
import { useOpportunities } from "@/data/events-store";
import { Button } from "@/components/ui/button";

const types: (OpportunityType | "All")[] = ["All", "Hackathon", "Competition", "Meetup", "Conference", "Networking"];
const formats = ["All formats", "Online", "In person", "Hybrid"] as const;

function OpportunityCard({ item }: { item: Opportunity }) {
  const isHosted = Boolean((item as any).isHosted);
  return (
    <Link to="/opportunities/$slug" params={{ slug: item.slug }} aria-label={`View ${item.title} details`} className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-neon/50 group-hover:shadow-glow-soft">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={item.image} alt={item.title} style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined} className={`h-full w-full bg-surface transition duration-700 group-hover:scale-[1.02] ${item.imageFit === "contain" ? "object-contain" : "object-cover"}`} />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-popover/90 px-3 py-1 text-xs font-semibold text-popover-foreground backdrop-blur">{item.type}</span>
            <span className="rounded-full bg-neon px-3 py-1 text-xs font-semibold text-primary-foreground">{item.status}</span>
            {isHosted && (
              <span className="inline-flex items-center gap-1 rounded-full border border-neon/50 bg-black/80 px-2.5 py-1 text-xs font-semibold text-neon backdrop-blur">
                <Sparkles className="size-3" /> Community Hosted
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-semibold text-neon">{item.tag.toUpperCase()}</p>
          <h2 className="mt-2 text-xl font-bold text-card-foreground">{item.title}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
          <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="size-3.5 text-neon" />{item.date}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-neon" />{item.location}</span>
            {item.prize && <span className="flex items-center gap-1.5"><Trophy className="size-3.5 text-neon" />{item.prize}</span>}
          </div>
          <p className="mt-4 text-sm font-semibold text-neon">View details →</p>
        </div>
      </article>
    </Link>
  );
}

export function OpportunityBrowser({ allowedTypes, showTypeFilter = false }: { allowedTypes?: OpportunityType[]; showTypeFilter?: boolean }) {
  const allOpportunities = useOpportunities();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<OpportunityType | "All">("All");
  const [format, setFormat] = useState<(typeof formats)[number]>("All formats");

  const list = useMemo(() => allOpportunities.filter((item) => {
    const allowed = !allowedTypes || allowedTypes.includes(item.type);
    const matchesType = type === "All" || item.type === type;
    const matchesFormat = format === "All formats" || item.format === format;
    const haystack = `${item.title} ${item.tag} ${item.location} ${item.description}`.toLowerCase();
    return allowed && matchesType && matchesFormat && haystack.includes(query.toLowerCase());
  }), [allOpportunities, allowedTypes, format, query, type]);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm md:flex-row">
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-surface px-4 focus-within:ring-2 focus-within:ring-ring">
          <Search className="size-4 text-muted-foreground" />
          <span className="sr-only">Search opportunities</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, topic or city" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        {showTypeFilter && (
          <select aria-label="Opportunity type" value={type} onChange={(event) => setType(event.target.value as OpportunityType | "All")} className="min-h-11 rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
            {types.map((item) => <option key={item}>{item}</option>)}
          </select>
        )}
        <select aria-label="Format" value={format} onChange={(event) => setFormat(event.target.value as (typeof formats)[number])} className="min-h-11 rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
          {formats.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{list.length} {list.length === 1 ? "opportunity" : "opportunities"}</p>
      {list.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((item) => <OpportunityCard key={item.slug} item={item} />)}</div>
      ) : (
        <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface text-center">
          <Search className="size-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No matches yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or format.</p>
          <Button variant="outline" className="mt-5 rounded-full" onClick={() => { setQuery(""); setType("All"); setFormat("All formats"); }}>Clear filters</Button>
        </div>
      )}
    </>
  );
}
