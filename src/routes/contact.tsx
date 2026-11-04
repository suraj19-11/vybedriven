import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, MessageSquare, Send } from "lucide-react";
import { Navbar, Footer } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { Reveal, Eyebrow } from "@/components/ui-hd";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — Vybe Driven" }, { name: "description", content: "Get in touch with the Vybe Driven team for partnerships, events, or support." }, { property: "og:title", content: "Contact Us — Vybe Driven" }, { property: "og:description", content: "Reach the Vybe Driven team for partnerships, events, or support." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Contact,
});

const CONTACT_EMAIL = "vybedriven@gmail.com";

function Contact() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [subject, setSubject] = useState(""); const [message, setMessage] = useState(""); const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject || "Vybe Driven enquiry")}&body=${body}`;
    setSent(true);
  };
  const inputClass = "h-11 w-full rounded-xl border border-input bg-background px-4 text-base sm:text-sm outline-none focus:ring-2 focus:ring-ring";
  return <div className="min-h-screen">
    <Navbar />
    <main className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-10 pt-10 sm:pt-16">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>Get in touch</Eyebrow>
        <h1 className="mt-2.5 sm:mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Contact <span className="text-gradient">Us</span></h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">Partnerships, hosting an event, media, or just a question — the Vybe Driven team reads every message.</p>
      </Reveal>
      <div className="mt-8 sm:mt-12 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Reveal className="space-y-3 sm:space-y-4">
          {[
            { Icon: Mail, title: "Email", line: CONTACT_EMAIL, sub: "We reply within 1–2 working days." },
            { Icon: MessageSquare, title: "Instagram", line: "@vybedriven", sub: "Follow Vybe Driven for event updates." },
            { Icon: MapPin, title: "Events", line: "Hosting a hackathon or meetup?", sub: "Launch directly on Vybe Driven with real-time registrations.", isHost: true },
          ].map((item) => { const { Icon, title, line, sub } = item; return (
            <div key={title} className="flex gap-3.5 sm:gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
              <span className="grid size-10 sm:size-11 shrink-0 place-items-center rounded-full bg-neon/15 text-neon"><Icon className="size-4 sm:size-5" /></span>
              <div><h3 className="text-sm font-semibold">{title}</h3>{title === "Instagram" ? <a href="https://www.instagram.com/vybedriven" target="_blank" rel="noreferrer" className="mt-0.5 block text-xs sm:text-sm text-foreground hover:text-neon">{line}</a> : <p className="mt-0.5 text-xs sm:text-sm text-foreground">{line}</p>}<p className="mt-1 text-xs text-muted-foreground">{sub}</p>{(item as any).isHost && <Link to="/host" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-neon hover:underline">Launch your event on Vybe Driven →</Link>}</div>
            </div>
          ); })}
        </Reveal>
        <Reveal delay={120}>
          <form onSubmit={submit} className="rounded-2xl sm:rounded-3xl border border-border bg-surface p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="c-name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Your name</label><input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ada Lovelace" /></div>
              <div><label htmlFor="c-email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</label><input id="c-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" /></div>
            </div>
            <div className="mt-4"><label htmlFor="c-subject" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Subject</label><input id="c-subject" required value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="Partnership, event hosting, support…" /></div>
            <div className="mt-4"><label htmlFor="c-message" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Message</label><textarea id="c-message" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base sm:text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Tell us what you need…" /></div>
            <Button type="submit" className="mt-5 sm:mt-6 h-11 w-full rounded-full bg-gradient-brand text-primary-foreground hover:brightness-105"><Send className="size-4" />Send message</Button>
            {sent && <p className="mt-3 text-center text-sm text-neon">Your email app is opening with the message ready to send.</p>}
          </form>
        </Reveal>
      </div>
    </main>
    <Footer />
  </div>;
}
