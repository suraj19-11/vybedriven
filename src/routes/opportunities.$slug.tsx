import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  Trophy,
  Users,
  WalletCards,
  Gift,
  Rocket,
  Laptop,
  Coffee,
  Award,
  Handshake,
  Brain,
  Sparkles,
  Crown,
  Ticket,
} from "lucide-react";
import { Navbar, Footer } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { getOpportunity } from "@/data/opportunities";
import { useAuth } from "@/lib/auth";
import { EventRegistrationModal } from "@/components/EventRegistrationModal";
import { isUserRegistered, getRegistrationCount, useEventRegistrations, isEventOrganizer } from "@/data/events-store";

type OpportunitySearch = { register?: string };

export const Route = createFileRoute("/opportunities/$slug")({
  validateSearch: (search: Record<string, unknown>): OpportunitySearch => ({
    register: typeof search["register"] === "string" ? search["register"] : undefined,
  }),
  loader: ({ params }) => {
    const opportunity = getOpportunity(params.slug);
    if (!opportunity) throw notFound();
    return opportunity;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — Vybe Driven` : "Event unavailable — Vybe Driven";
    const description = loaderData?.description ?? "This Vybe Driven event is unavailable.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: OpportunityDetails,
  notFoundComponent: OpportunityNotFound,
});

function OpportunityDetails() {
  const item = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [regModalOpen, setRegModalOpen] = useState(false);

  // Auto-open modal if returning from auth with ?register=1
  useEffect(() => {
    if (search.register === "1" && user) {
      setRegModalOpen(true);
    }
  }, [search.register, user]);

  const handleRegisterClick = () => {
    if (!user) {
      navigate({
        to: "/auth",
        search: {
          mode: "signin",
          next: `/opportunities/${item.slug}?register=1`,
        },
      });
      return;
    }
    setRegModalOpen(true);
  };

  const registrations = useEventRegistrations(item.slug);
  const regCount = registrations.length;

  const userIdentifier = user?.email || user?.id;
  const isRegistered = isUserRegistered(item.slug, userIdentifier);
  const isHost = isEventOrganizer(item, user);

  const facts = [
    { icon: Calendar, label: "Event dates", value: item.date },
    { icon: MapPin, label: "Format", value: `${item.format} · ${item.location}` },
    { icon: Clock3, label: "Registration deadline", value: item.registrationDeadline },
    { icon: Users, label: "Team size", value: item.teamSize },
    { icon: CheckCircle2, label: "Eligibility", value: item.eligibility },
    { icon: WalletCards, label: "Entry fee", value: item.fee },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-[1200px] gap-6 sm:gap-7 px-4 sm:px-6 pb-8 pt-8 sm:pb-10 sm:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold">
                  {item.type}
                </span>
                <span className="rounded-full bg-neon px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {item.status}
                </span>
                {(item as any).isHosted && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-neon/50 bg-black/80 px-2.5 py-1 text-xs font-semibold text-neon backdrop-blur">
                    <Sparkles className="size-3" /> Community Hosted
                  </span>
                )}
                {regCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <Users className="size-3 text-neon" /> {regCount} {regCount === 1 ? "applicant" : "applicants"}
                  </span>
                )}
              </div>
              <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-neon">{item.tag.toUpperCase()}</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{item.title}</h1>
              <p className="mt-3 sm:mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-muted-foreground">
                Hosted by <span className="font-semibold text-foreground">{item.organizer}</span>
              </p>
            </div>
            <img
              src={item.image}
              alt={item.title}
              style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
              className={`aspect-[16/10] w-full rounded-2xl bg-background ${
                item.imageFit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
          </div>
        </section>

        {/* Content & Sidebar */}
        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
            <div>
              {/* Quick Facts Grid */}
              <div className="grid overflow-hidden rounded-2xl border border-border bg-card grid-cols-2 lg:grid-cols-3">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="border-b border-border p-4 sm:p-5 [&:nth-child(odd)]:border-r sm:[&:nth-child(even)]:border-r">
                    <Icon className="size-4 sm:size-5 text-neon" />
                    <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs font-semibold text-muted-foreground">{label}</p>
                    <p className="mt-1 text-xs sm:text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {/* About Section */}
              <section className="py-7 sm:py-9">
                <h2 className="text-xl sm:text-2xl font-bold">About this {item.type.toLowerCase()}</h2>
                <p className="mt-3 sm:mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {item.overview}
                </p>
              </section>

              {/* Stages and Timeline */}
              {item.schedule && item.schedule.length > 0 && (
                <section className="border-t border-border py-7 sm:py-9">
                  <h2 className="text-xl sm:text-2xl font-bold">Stages and timeline</h2>
                  <ol className="mt-6 space-y-5">
                    {item.schedule.map((step, index) => (
                      <li key={step.title} className="grid grid-cols-[36px_1fr] gap-3 sm:gap-4">
                        <span className="grid size-9 place-items-center rounded-full bg-neon font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-baseline justify-between gap-1.5 sm:gap-2">
                            <h3 className="text-sm sm:text-base font-semibold">{step.title}</h3>
                            <p className="text-xs sm:text-sm font-medium text-neon">{step.date}</p>
                          </div>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Rewards, Perks & Opportunities */}
              {(item.prize || (item.perks && item.perks.length > 0)) && (
                <section className="border-t border-border py-8 sm:py-12">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-neon/15 text-neon shadow-glow-soft">
                      <Trophy className="size-6 text-neon" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase text-neon">What's in Store</p>
                      <h2 className="mt-0.5 text-xl sm:text-2xl font-bold">Rewards, Perks & Opportunities</h2>
                    </div>
                  </div>

                  {item.prize && (
                    <div className="mt-5 rounded-2xl border border-neon/30 bg-gradient-to-br from-neon/10 via-surface to-surface p-5 sm:p-6 shadow-glow-soft">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Prize Pool
                      </p>
                      <p className="mt-1 text-2xl sm:text-4xl font-extrabold text-neon">{item.prize}</p>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                        Cash prizes, certificates, and recognition for top qualifying innovators.
                      </p>
                    </div>
                  )}

                  {item.perks && item.perks.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Participant Benefits & Perks
                      </p>
                      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        {item.perks.map((perk) => (
                          <div
                            key={perk.title}
                            className="group relative flex gap-3.5 rounded-xl sm:rounded-2xl border border-border bg-card p-4 transition duration-300 hover:border-neon/40 hover:bg-surface-2 hover:shadow-glow-soft"
                          >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon group-hover:bg-neon group-hover:text-primary-foreground transition duration-300">
                              {perk.icon === "gift" ? (
                                <Gift className="size-5" />
                              ) : perk.icon === "rocket" ? (
                                <Rocket className="size-5" />
                              ) : perk.icon === "laptop" ? (
                                <Laptop className="size-5" />
                              ) : perk.icon === "coffee" ? (
                                <Coffee className="size-5" />
                              ) : perk.icon === "award" ? (
                                <Award className="size-5" />
                              ) : perk.icon === "handshake" ? (
                                <Handshake className="size-5" />
                              ) : perk.icon === "brain" ? (
                                <Brain className="size-5" />
                              ) : (
                                <Sparkles className="size-5" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {perk.emoji && <span className="text-base select-none">{perk.emoji}</span>}
                                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-neon transition">
                                  {perk.title}
                                </h3>
                              </div>
                              {perk.description && (
                                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                  {perk.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Sticky Registration Sidebar */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                {/* Host Control Box */}
                {isHost && (
                  <div className="mb-5 rounded-xl border border-neon/40 bg-neon/10 p-3.5 text-xs text-foreground">
                    <div className="flex items-center gap-2 font-bold text-neon">
                      <Crown className="size-4" />
                      <span>You are hosting this event</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      Track registrations and download participant CSV from your organizer dashboard.
                    </p>
                    <div className="mt-2.5 flex flex-col gap-2">
                      <Button asChild size="sm" className="w-full rounded-lg bg-neon text-primary-foreground font-bold hover:brightness-105">
                        <Link to="/manage-events" search={{ tab: "registrations", slug: item.slug }}>
                          Manage {regCount} Registrations →
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="w-full rounded-lg border-border text-xs">
                        <Link to="/host" search={{ edit: item.slug }}>
                          ✏️ Edit Event Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Registration
                  </p>
                  {regCount > 0 && (
                    <span className="text-xs font-semibold text-neon font-mono">
                      {regCount} {regCount === 1 ? "applicant" : "applicants"}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-lg sm:text-xl font-bold">
                  {item.status === "Sold out"
                    ? "Sold out"
                    : item.status === "Event full"
                    ? "Event full"
                    : item.status === "Approval required"
                    ? "Approval required"
                    : "Registrations open"}
                </h2>

                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {item.registrationNote ??
                    (item.registrationDeadline === "To be announced"
                      ? "Register now to secure your participation spot."
                      : `Apply before ${item.registrationDeadline}.`)}
                </p>

                {/* Already Registered Card */}
                {isRegistered ? (
                  <div className="mt-5 rounded-xl border border-neon/50 bg-neon/10 p-4">
                    <div className="flex items-center gap-2 text-neon font-bold text-sm">
                      <CheckCircle2 className="size-5" />
                      <span>You're registered for this event!</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your application has been received by {item.organizer}.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegisterClick}
                      className="mt-3 w-full rounded-full border-neon/50 text-xs font-semibold text-neon hover:bg-neon hover:text-primary-foreground"
                    >
                      <Ticket className="size-3.5 mr-1.5" />
                      View Participant Pass
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Primary Direct Registration Button */}
                    {item.status !== "Sold out" && (
                      <Button
                        type="button"
                        onClick={() => setRegModalOpen(true)}
                        className="mt-5 sm:mt-6 w-full rounded-full bg-gradient-brand text-primary-foreground font-bold shadow-glow hover:brightness-105"
                      >
                        Register on Vybe Driven
                        <Sparkles className="ml-2 inline size-4" />
                      </Button>
                    )}

                    {/* Secondary External Registration Link if present */}
                    {item.registrationUrl && (
                      <a
                        href={item.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-neon hover:text-foreground"
                      >
                        <span>{item.registrationLabel ?? "Official Portal / Form"}</span>
                        <ExternalLink className="size-3.5 opacity-70" />
                      </a>
                    )}
                  </>
                )}

                {/* Group Link */}
                {item.groupUrl && (
                  <a
                    href={item.groupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-neon/40 bg-surface/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-neon transition hover:border-neon hover:bg-neon/15 hover:shadow-glow-soft"
                  >
                    <MessageCircle className="size-4 text-neon" />
                    <span>{item.groupLabel ?? "Join Group for Further Details"}</span>
                    <ExternalLink className="size-3.5 opacity-80" />
                  </a>
                )}

                {/* Related Links */}
                {item.relatedLinks && (
                  <div className="mt-4 space-y-2">
                    {item.relatedLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs sm:text-sm font-medium hover:border-neon hover:text-neon"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Organizer Contacts */}
                {item.contacts && (
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground">QUERIES</p>
                    <ul className="mt-2 space-y-1.5">
                      {item.contacts.map((contact) => (
                        <li key={contact.phone} className="text-xs sm:text-sm">
                          <a href={`tel:${contact.phone}`} className="font-medium hover:text-neon">
                            {contact.name}
                          </a>
                          <span className="text-muted-foreground"> · {contact.phone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <a
                  href="mailto:vybedriven@gmail.com"
                  className="mt-3.5 block text-center text-xs text-muted-foreground hover:text-neon transition"
                >
                  Have questions? Ask Vybe Driven
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />

      {/* Registration Dialog */}
      <EventRegistrationModal
        opportunity={item}
        open={regModalOpen}
        onOpenChange={setRegModalOpen}
      />
    </div>
  );
}

function OpportunityNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold">Event not found</h1>
        <p className="mt-3 text-muted-foreground">This event may have moved or is no longer available.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/discover">Browse all events</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}
