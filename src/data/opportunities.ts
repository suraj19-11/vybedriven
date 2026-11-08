import evCool from "@/assets/ev-cool.jpg";
import evCyber from "@/assets/ev-cyber.jpg";
import inspirePoster from "@/assets/inspire-colloquium.png.asset.json";
import iplPoster from "@/assets/events/ipl-innovation-pitch-league-2026.jpeg.asset.json";
import elevatePoster from "@/assets/events/elevate-1-0-2026.png.asset.json";
import hackInHillsPoster from "@/assets/events/hack-in-hills-2026.jpeg.asset.json";
import vecnaVersePoster from "@/assets/events/vecna-verse-2026.jpeg.asset.json";
import unicornSummitPoster from "@/assets/events/unicorn-ai-gpu-pre-summit.png.asset.json";
import structuringAiPoster from "@/assets/events/structuring-the-ai-way.png.asset.json";
import aiAtWorkPoster from "@/assets/events/ai-at-work.png.asset.json";
import enterpriseAiSummitPoster from "@/assets/events/enterprise-ai-summit-mumbai-2026.png.asset.json";
import clinicalAiPoster from "@/assets/events/clinical-ai-summit-2026.png.asset.json";
import durableDevOpsPoster from "@/assets/events/durable-devops-tech-meetup.png.asset.json";
import allInOnePoster from "@/assets/events/allin1place-ai-human-touch.png.asset.json";

export type OpportunityType = "Hackathon" | "Competition" | "Meetup" | "Conference" | "Networking";

export type OpportunityPerk = {
  icon?: "gift" | "rocket" | "laptop" | "coffee" | "award" | "handshake" | "brain" | string;
  emoji?: string;
  title: string;
  description?: string;
};

export type OpportunityScheduleStage = {
  title: string;
  date: string;
  dateBadge?: string;
  description: string;
  bullets?: string[];
  evaluation?: string;
};

export type OpportunityReward = {
  amount?: string;
  amountSub?: string;
  title: string;
  description?: string;
  badge?: string;
  type?: "cash" | "certificate" | "perk";
};

export type Opportunity = {
  slug: string;
  title: string;
  type: OpportunityType;
  tag: string;
  description: string;
  date: string;
  location: string;
  format: "Online" | "In person" | "Hybrid";
  prize?: string;
  perks?: OpportunityPerk[];
  image: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  organizer: string;
  registrationDeadline: string;
  eligibility: string;
  teamSize: string;
  fee: string;
  status: "Opening soon" | "Registration open" | "Approval required" | "Event full" | "Sold out";
  registrationUrl?: string;
  registrationLabel?: "Register now" | "Request to join" | "Join waitlist";
  registrationNote?: string;
  groupUrl?: string;
  groupLabel?: string;
  contacts?: { name: string; phone: string }[];
  relatedLinks?: { label: string; url: string }[];
  overview: string;
  schedule: { title: string; date: string; description: string }[];
};

export const opportunities: Opportunity[] = [
  {
    slug: "goa-buildathon-2027",
    title: "Goa Buildathon '27",
    type: "Hackathon",
    tag: "36-Hour Offline Hackathon · AI & Emerging Tech",
    description: "36-hour offline hackathon in Goa, India bringing together developers, designers, AI builders and innovators to turn ideas into reality. ₹10,00,000 worth prize pool.",
    date: "Jan 16–17, 2027 · 36 Hours Offline",
    location: "Goa, India (South Goa)",
    format: "In person",
    prize: "₹10,00,000 Worth",
    perks: [
      {
        icon: "gift",
        emoji: "💰",
        title: "₹10,00,000 Worth Prize Pool",
        description: "Targeting an overall prize pool of ₹10,00,000 for top winning teams and category champions.",
      },
      {
        icon: "award",
        emoji: "📜",
        title: "Participation Certificate",
        description: "Official certificate of participation released for all attending builders and teams.",
      },
      {
        icon: "rocket",
        emoji: "⚡",
        title: "36-Hour Offline Hackathon",
        description: "36 hours of non-stop offline building in Goa with developer mentors, food, and high energy.",
      },
      {
        icon: "brain",
        emoji: "🤖",
        title: "AI Agents & Emerging Tech",
        description: "Hands-on tracks for AI agents, web apps, automation workflows, data science, and hardware.",
      },
      {
        icon: "handshake",
        emoji: "🤝",
        title: "Platform Partner: Vybe Driven",
        description: "Official technology and platform partner support powering discovery across India.",
      },
      {
        icon: "coffee",
        emoji: "🌴",
        title: "Goa Builder Community",
        description: "Connect with mentors, judges, founders, and cross-college tech communities in Goa.",
      },
    ],
    image: "/events/goa-buildathon-2027.jpg",
    imageFit: "contain",
    imagePosition: "center center",
    organizer: "Goa Buildathon · Vybe Driven (Platform & Technology Partner)",
    organizerEmail: "hello@goabuilds.com",
    registrationDeadline: "Dec 31, 2026 · 12:59 PM IST",
    eligibility: "Students, aspiring developers, designers, AI builders and technology enthusiasts across all colleges",
    teamSize: "2–4 Members",
    fee: "Free",
    status: "Registration open",
    registrationNote: "Idea Submission (PPT Round) deadline is 31 Dec 2026. Register on Vybe Driven to secure your official team slot.",
    groupUrl: "https://chat.whatsapp.com/BPxJPtcClTECc4f09doPpd?s=cl&p=i&mlu=4&ilr=4&iam=2",
    groupLabel: "Join WhatsApp Community",
    contacts: [
      { name: "Goa Buildathon Desk", phone: "hello@goabuilds.com" },
      { name: "Vybe Driven Support", phone: "vybedriven@gmail.com" },
    ],
    relatedLinks: [
      { label: "Official Website (goabuilds.com)", url: "https://goabuilds.com/" },
      { label: "Official WhatsApp Community", url: "https://chat.whatsapp.com/BPxJPtcClTECc4f09doPpd?s=cl&p=i&mlu=4&ilr=4&iam=2" },
      { label: "Instagram @goabuildathon27", url: "https://www.instagram.com/goabuildathon27" },
    ],
    overview: `GOA BUILDATHON ’27 is a 36-hour offline hackathon planned for January 2027 in Goa, India. It aims to bring together developers, designers, AI enthusiasts, problem-solvers and innovators from colleges and communities to turn ideas into working solutions.

This is where ideas move beyond discussions and become prototypes. Whether you're exploring AI agents, developing web applications, automating everyday workflows or experimenting with emerging technologies, GOA BUILDATHON ’27 is designed to give you the space to build, collaborate and challenge yourself.

Our vision is to create an environment where students can experiment with new technologies, solve meaningful problems, learn from experienced builders and connect with people who share the same passion for creating.

Not just another hackathon. A place to turn ideas into reality.

What To Expect:
• 36 hours of offline building in Goa
• Collaboration with developers, designers and innovators
• Hands-on experimentation with AI, AI agents and automation
• Web development, software engineering and emerging technology
• Teamwork, rapid prototyping and practical problem-solving
• Opportunities to connect with mentors, judges and technology communities
• Project showcases and opportunities to present your ideas
• Community partnerships and potential sponsor-led challenges
• An environment focused on learning, creativity and building real solutions

Who Can Participate?:
GOA BUILDATHON ’27 welcomes students, aspiring developers, designers, AI builders and technology enthusiasts who want to learn by building. Whether you're an experienced hackathon participant or attending your first hackathon, the focus is on curiosity, collaboration and the willingness to create something meaningful. Bring your skills, find teammates, explore unfamiliar technologies and turn your ideas into something people can experience.

What Can You Build?:
• Artificial Intelligence & AI Agents: Build intelligent assistants, agentic workflows and practical AI-powered applications.
• Web Development: Create websites, platforms and full-stack applications that address real problems.
• Automation: Develop tools that reduce repetitive work and improve everyday processes.
• Data Science & Analytics: Turn data into insights, useful tools and better decisions.
• Software & Developer Tools: Build products that improve workflows, productivity and collaboration.
• Electronics & Emerging Technology: Explore innovative solutions that connect software with the physical world.

The goal is not simply to present an idea, but to make meaningful progress towards a working solution within the hackathon.

Why Goa?:
Goa offers a distinctive setting for bringing people together to learn, collaborate and create. GOA BUILDATHON ’27 aims to combine the energy of a technology-building event with a community-driven experience where new connections and ideas can grow. We want participants to leave with more than a project: new skills, valuable connections, practical experience and the confidence to keep building.

Official Channels & Contact:
• Website: https://goabuilds.com/
• Email: hello@goabuilds.com
• WhatsApp: https://chat.whatsapp.com/BPxJPtcClTECc4f09doPpd
• Instagram: https://www.instagram.com/goabuildathon27
• Platform & Technology Partner: Vybe Driven (vybedriven.in)

Be Part Of The Build:
We're bringing together people who don't just want to talk about ideas — they want to build them. Build > Collaborate > Create real impact. Let's build something that matters.`,
    schedule: [
      {
        title: "Idea Submission — PPT Round",
        dateBadge: "Nov 2",
        date: "02 Nov 26, 10:20 PM IST → 31 Dec 26, 12:59 PM IST",
        description: "Participants submit a PPT explaining their proposed solution to a real-world problem. PPT should include:",
        bullets: [
          "Problem statement",
          "Proposed solution",
          "Innovation and uniqueness",
          "Target users and expected impact",
          "Proposed technology stack",
          "Implementation plan",
        ],
        evaluation: "Innovation, feasibility, relevance, impact and technical approach.",
      },
      {
        title: "36-Hour Hackathon — Grand Finale",
        dateBadge: "Jan 16",
        date: "16 Jan 27, 09:00 AM IST → 17 Jan 27, 04:25 PM IST",
        description: "Shortlisted teams build a working prototype, collaborate with other developers and present their projects to the judging panel live in Goa.",
      },
    ],
    rewards: [
      {
        amount: "₹10,00,000",
        amountSub: "WORTH",
        title: "Overall Prize Pool",
        description: "GOA BUILDATHON '27 is targeting a total prize pool of ₹10,00,000. The final prize distribution and rewards will be announced once confirmed. Stay tuned for updates.",
        badge: "Certificate",
        type: "cash",
      },
      {
        title: "Participation Certificate",
        description: "Official certificate of participation released for all attending builders and teams.",
        badge: "Certificate",
        type: "certificate",
      },
    ],
    rewardsFootnote: "* All the prizes and certificate will be released within 30 days after the event is over",
  },

  {
    slug: "luminar-creators-award-2027",
    title: "Luminar Creators Award 2027",
    type: "Competition",
    tag: "Micro-Creators · Brand Deals & Awards",
    description: "Barter deals se aage badhne ka time aa gaya hai! India ke 1K–10K micro-creators ke liye 24 paid brand collabs, ₹5K cash, official trophy & red carpet Grand Finale.",
    date: "Jan 8, 2027 · Doors open 05:00 PM IST",
    location: "Lata Mangeshkar Auditorium, Mira Road, Mumbai",
    format: "In person",
    prize: "₹5,000 Cash + 24 Paid Collabs + PR",
    perks: [
      {
        icon: "handshake",
        emoji: "🤝",
        title: "1-Year Agency Subscription",
        description: "Direct Registration Benefit: Saal ke 24 PAID brand collaborations across the year.",
      },
      {
        icon: "rocket",
        emoji: "🚀",
        title: "3 Included Brand Collabs",
        description: "Website pe register hote hi 3 brand collabs milenge, jinke video engagement se Top 100 shortlist honge.",
      },
      {
        icon: "award",
        emoji: "🏆",
        title: "Official Trophy & Certificate",
        description: "Handcrafted 24k champagne gold Luminar statuette & official Certificate of Merit for Top 100 creators.",
      },
      {
        icon: "gift",
        emoji: "💰",
        title: "₹5,000 Cash Prize",
        description: "Guaranteed ₹5,000 cash reward for each of the Top 100 shortlisted creators.",
      },
      {
        icon: "brain",
        emoji: "📰",
        title: "50+ Digital Media & 15+ Billboards",
        description: "50+ digital news & media PR coverage plus photos featured on 15+ prominent digital billboard screens.",
      },
      {
        icon: "laptop",
        emoji: "🎟️",
        title: "Red Carpet Zone + Guest Pass",
        description: "Mumbai Grand Finale mein Red Carpet Zone entry with 1 complimentary guest pass.",
      },
    ],
    image: "/events/luminar-creators-award-2027.jpg",
    imageFit: "contain",
    imagePosition: "center center",
    organizer: "Luminar Creators Award · Powered by Casheco · Vybe Driven (Platform Partner)",
    registrationDeadline: "Dec 30, 2026",
    eligibility: "India's 1K–10K micro-creators, digital influencers & content creators across all genres",
    teamSize: "Individual / Solo Creator",
    fee: "₹999 (Early Bird Offer)",
    status: "Registration open",
    registrationUrl: "https://luminarcreatorsaward.com",
    registrationNote: "Register now on the official Luminar Creators portal (Early Bird ₹999) to lock your nomination and agency benefits.",
    contacts: [
      { name: "Luminar Creators Support", phone: "+919820123456" },
      { name: "Casheco Creator Desk", phone: "+919820654321" },
    ],
    overview: `Barter deals se aage badhne ka time aa gaya hai!

Luminar Creators Award lekar aaya hai India ke 1K–10K micro-creators ke liye growth aur direct brand deals ka mauka.

1️⃣ Direct Registration Benefit:
✅ 1-Year Agency Subscription — Saal ke 24 PAID brand collaborations

2️⃣ Top 100 Selection Process:
Website pe register hote hi Luminar Creators Award team tumhein 3 brand collaborations degi. In brands ke saath collab videos banakar apne page pe post karni hain, aur in 3 videos ke engagement ke basis par Top 100 creators shortlist honge!

3️⃣ Top 100 Rewards:
💰 ₹5,000 Cash Prize
🏆 Official Trophy & Certificate of Merit
📰 50+ Digital Media Channels mein PR coverage
🌟 15+ Digital Billboard Screens pe photo feature
🎟️ Mumbai Grand Finale mein Red Carpet Zone Entry + 1 Guest Pass

🔗 Apply Kaise Karein:
Bio ke link pe click karo (luminarcreatorsaward.com), form fill karo aur apna slot lock karo!

#LuminarCreatorsAward #PaidCollabs #MicroInfluencerIndia #ContentCreatorIndia #CreatorEconomy #DesiCreators #MumbaiEvents #CreatorGrowth`,
    schedule: [
      {
        title: "Slot Booking & Agency Activation",
        date: "Open Now",
        description: "Register at luminarcreatorsaward.com (Early bird ₹999) to lock your spot and immediately activate your 1-Year Agency Subscription.",
      },
      {
        title: "3 Brand Collaborations & Content Creation",
        date: "Nov – Dec 2026",
        description: "Create and publish collaboration videos with 3 partner brands. Shortlisting is evaluated on genuine audience engagement.",
      },
      {
        title: "Top 100 Shortlist & Honor Roll",
        date: "Dec 28, 2026",
        description: "Top 100 creators announced. Awarded ₹5,000 cash prizes, media press releases, billboard features, and trophies.",
      },
      {
        title: "Mumbai Grand Finale & Red Carpet Gala",
        date: "Jan 8, 2027 · 05:00 PM IST",
        description: "Live black-tie ceremony at Lata Mangeshkar Auditorium, Mira Road, Mumbai with red carpet arrivals, VIP networking, and statuette felicitation.",
      },
    ],
  },
  {
    slug: "idea-competition-2026",
    title: "IDEA COMPETITION 2026",
    type: "Hackathon",
    tag: "Idea to Incubation · Startup Program",
    description: "Turn your idea into a potential startup with E-Cell CRCE. 4 impact tracks, expert mentorship, incubation handoff & ₹50K+ prizes.",
    date: "Oct 28, 2026 – Feb 6, 2027",
    location: "Fr. CRCE, Bandra, Mumbai · Hybrid",
    format: "Hybrid",
    prize: "₹50,000+",
    perks: [
      {
        icon: "rocket",
        emoji: "🚀",
        title: "Incubation Opportunities",
        description: "Direct incubation pathway and handoff for eligible finalists to launch and scale real startups.",
      },
      {
        icon: "laptop",
        emoji: "💻",
        title: "Interview Opportunities",
        description: "Exclusive interview and internship access for all eligible teams with partner companies.",
      },
      {
        icon: "brain",
        emoji: "🧠",
        title: "Expert Mentorship & Hands-on POC",
        description: "2–3 months of 1-on-1 guidance from founders and industry leaders to validate ideas and engineer functional prototypes.",
      },
      {
        icon: "award",
        emoji: "🪪",
        title: "Certificates on Clearing Each Round",
        description: "Official achievement certificates awarded on clearing each round, recognized by E-Cell CRCE & partners.",
      },
      {
        icon: "gift",
        emoji: "🎁",
        title: "Exciting Goodies & Perks",
        description: "Exclusive builder swag, digital perks, and goodies for participants.",
      },
      {
        icon: "handshake",
        emoji: "🤝",
        title: "Networking with Founders & Leaders",
        description: "Direct networking with successful founders, investors, and startup leaders at the Grand Finale.",
      },
      {
        icon: "coffee",
        emoji: "🍣",
        title: "Light Snacks & Beverages",
        description: "Complimentary refreshments and snacks provided during offline mentoring sessions and the Grand Finale.",
      },
    ],
    image: "/events/idea-competition-2026.webp",
    imageFit: "contain",
    imagePosition: "center center",
    organizer: "E-Cell CRCE · Union Bank of India · Vybe Driven",
    registrationDeadline: "Oct 28, 2026",
    eligibility: "Student innovators, developers, aspiring founders, and teams across all colleges and departments",
    teamSize: "1–4 members",
    fee: "Free",
    status: "Registration open",
    registrationUrl: "https://unstop.com/hackathons/idea-competition-2026-fr-conceicao-rodrigues-college-of-engineering-frcrce-bandra-1736048",
    contacts: [
      { name: "Atharva Jagtap", phone: "+917066935597" },
      { name: "Arnav Potale", phone: "+918830331242" },
    ],
    relatedLinks: [
      { label: "Official Exploration Portal", url: "https://ideacompetition.ecell-crce.in/explore" },
    ],
    overview: "IDEA COMPETITION 2026 is an idea-to-incubation startup program presented by E-Cell CRCE (Fr. Conceicao Rodrigues College of Engineering, Bandra) with Title Sponsor Union Bank of India, Platform Partner Vybe Driven, and Community Partner Mumbai Tech Week. Designed to bridge the gap between ideation and a real startup, the challenge features 4 core impact tracks: 1) Healthcare & Well-being, 2) Energy & Sustainability, 3) Education & Technology, and 4) Smart Cities & Urban Development. Top teams receive 2–3 months of intensive mentorship to build functional POCs, followed by an offline Grand Finale on 6th February 2027 at Fr. CRCE Bandra before venture founders and incubation partners. Over ₹50,000 in prize pool, incubation handoff, interview opportunities, goodies, and round-wise certificates.",
    schedule: [
      { title: "Round 1 · Register & Submit Idea (Online)", date: "Deadline: Oct 28, 2026", description: "Register on Unstop and submit your problem statement, market approach, and proposed solution via PPT." },
      { title: "Round 2 · Mentorship & Judging (Online)", date: "Nov 2026 – Jan 2027", description: "Shortlisted teams receive 2–3 months of 1-on-1 expert mentorship to validate their idea and engineer a working Proof of Concept (POC)." },
      { title: "Round 3 · Grand Finale (Offline)", date: "Feb 6, 2027", description: "Pitch your developed prototype and venture live to founders, investors, and incubation heads at Fr. CRCE, Bandra, Mumbai." },
    ],
  },
  { slug: "vecna-verse-2026", title: "VECNA VERSE", type: "Hackathon", tag: "National Level Hackathon", description: "Enter the unknown, build the impossible, and compete for prizes, opportunities, and national recognition.", date: "Oct 24–25, 2026", location: "Online round · Offline finale for qualifiers", format: "Hybrid", prize: "₹3 lakh+", image: vecnaVersePoster.url, imageFit: "contain", organizer: "Vybe Driven · RAAHIWORKS", registrationDeadline: "To be announced", eligibility: "B.Sc, B.Tech, B.E, M.Tech, PhD, and Diploma students from any year; cross-college, cross-branch, and cross-year teams welcome", teamSize: "Up to 4 members", fee: "See official registration", status: "Registration open", registrationUrl: "https://forms.gle/cchs5bTCBp5N9g9X9", groupUrl: "https://chat.whatsapp.com/Bq82iqnQZz58uJbRp2k2C9", groupLabel: "Join WhatsApp Group for Details", overview: "VECNA VERSE is a national-level hackathon presented by Vybe Driven and powered by RAAHIWORKS. Participants enter an online first round (Oct 24–25) before qualifying teams advance to an offline finale. The ₹3 lakh+ prize pool is joined by cash prizes, internship and job opportunities, exclusive goodies, platform credits, and networking with industry experts.", schedule: [{ title: "Registration", date: "Open now", description: "Gather a team of up to four members and register through the official VECNA VERSE registration form." }, { title: "Round 1 · Online", date: "Oct 24–25, 2026", description: "Teams compete online during the first qualifying round." }, { title: "Round 2 · Offline", date: "To be announced", description: "Qualifying teams receive the final date, venue, and complete offline-round details." }] },
  {
    slug: "adappt-5-0",
    title: "ADAPPT 5.0",
    type: "Hackathon",
    tag: "Venture Sprint · Overnight",
    description: "An innovation-driven challenge where you pitch, build, adapt & evolve your idea through technical twists and expert interactions.",
    date: "Oct 23–24, 2026",
    location: "MPSTME, Mumbai",
    format: "Hybrid",
    prize: "₹50,000",
    perks: [
      {
        icon: "rocket",
        emoji: "⛱️",
        title: "Staycation for Winners",
        description: "Special staycation package awarded to the top winning team.",
      },
      {
        icon: "award",
        emoji: "📜",
        title: "Certificates from GfK, Unstop & BMW",
        description: "Official co-branded certificates recognized by top global and tech organizations.",
      },
      {
        icon: "gift",
        emoji: "🎁",
        title: "Hampers Worth 10K & Goodies",
        description: "Gift hampers for winners and runner-ups plus free goodies for Round 2 qualifiers.",
      },
      {
        icon: "laptop",
        emoji: "💼",
        title: "Internship Opportunities",
        description: "Direct internship opportunities for top performing builders.",
      },
      {
        icon: "handshake",
        emoji: "🤝",
        title: "Industrial Connections",
        description: "Build relationships and interact with industry evaluators and technical mentors.",
      },
    ],
    image: "/events/adappt-5-0.webp",
    imageFit: "contain",
    imagePosition: "center top",
    organizer: "IETE-SF MPSTME · Vybe Driven",
    registrationDeadline: "Oct 19, 2026",
    eligibility: "College students, developers, and tech innovators · Teams of 1–4 members across any branch and year",
    teamSize: "1–4 members",
    fee: "₹300 per participant",
    status: "Registration open",
    registrationUrl: "https://adappt.ietempstme.com/",
    contacts: [
      { name: "Arnab Mukhopadhyay", phone: "+918104530548" },
      { name: "Arushi Dube", phone: "+919137086087" },
    ],
    relatedLinks: [
      { label: "Official ADAPPT 5.0 Website", url: "https://adappt.ietempstme.com/" },
      { label: "IETE-SF MPSTME Portal", url: "https://ietempstme.com" },
    ],
    overview: "ADAPPT 5.0 Venture Sprint is an innovation-driven challenge presented by IETE-SF MPSTME in collaboration with Vybe Driven, Unstop, and GeeksforGeeks. Participants select a challenge across three core domains: 1) Cybersecurity in Smart Homes, 2) AI in FoodTech, and 3) Robotics & Automation in Natural Disaster Management. In Round 1, submit your solution deck and video pitch. Shortlisted teams advance to an intense 24-hour overnight development challenge at MPSTME Mumbai, adapting their code to live technical twists. Featuring a ₹50,000 prize pool, staycation for winners, ₹10K hampers, certificates from GfK, Unstop & BMW, and internship opportunities.",
    schedule: [
      { title: "Round 1 · Online Idea Pitch", date: "Deadline: Oct 19, 2026", description: "Choose a problem statement across the 3 domains, develop your solution, and submit your PPT and video pitch online." },
      { title: "Shortlist Announcement", date: "Oct 20–21, 2026", description: "Top performing teams are selected and invited to the offline overnight development round." },
      { title: "Round 2 · Overnight Development Challenge", date: "Oct 23–24, 2026", description: "Tackle unexpected technical twists overnight at MPSTME, Mumbai, adapt your solution live, and pitch to the jury." },
    ],
  },
  { slug: "inspire-colloquium-2026", title: "INSPIRE Colloquium 2026", type: "Hackathon", tag: "Research / Innovation", description: "Present your research or idea at IEEE SLRTCE's research and idea colloquium.", date: "Oct 17, 2026 · 9 AM–5 PM", location: "SLRTCE Campus, Mira Road, Mumbai", format: "In person", image: inspirePoster.url, imagePosition: "center top", imageFit: "contain", organizer: "IEEE SLRTCE · Mumbai Tech Community", registrationDeadline: "Oct 11, 2026", eligibility: "UG & Diploma: teams of 2–4 · PG & PhD: individual · Inter-college participants welcome", teamSize: "2–4 members (UG & Diploma) or individual (PG & PhD)", fee: "₹300 per team for shortlisted teams", status: "Registration open", registrationUrl: "https://inspire-colloquium.vercel.app/", contacts: [{ name: "Krishna Dubey", phone: "+919321599039" }, { name: "Shweta Mishra", phone: "+919768122297" }, { name: "Meet Shah", phone: "+919987594531" }], overview: "INSPIRE 2026 is a research and idea colloquium by IEEE SLRTCE, presented with Mumbai Tech Community as Community Partner. Interdisciplinary next-generation scientific ideas, research, and exploration — aligned with the UN Sustainable Development Goals. Present your idea, explore it, and inspire others; shortlisted teams pay a ₹300 registration fee per team.", schedule: [{ title: "Registration opens", date: "Sep 21, 2026", description: "Register on the official INSPIRE Colloquium website." }, { title: "Submission closes", date: "Oct 11, 2026", description: "Final deadline to submit your research or idea." }, { title: "Shortlist announced", date: "Oct 13, 2026", description: "Shortlisted teams confirm attendance and pay the ₹300 per-team fee." }, { title: "Colloquium day", date: "Oct 17, 2026 · 9 AM–5 PM", description: "Present at SLRTCE Campus, Mira Road, Mumbai." }] },
  { slug: "ipl-innovation-pitch-league-2026", title: "IPL – Innovation Pitch League", type: "Hackathon", tag: "Innovation / Talent", description: "A two-day IPL-inspired experience combining placements, an auction, team building, and a six-hour innovation hackathon.", date: "Oct 9–10, 2026 · 8 AM", location: "SIES Graduate School of Technology, Nerul", format: "In person", prize: "₹30,000", image: iplPoster.url, imageFit: "contain", organizer: "IET On Campus SIES GST", registrationDeadline: "Before event capacity is filled", eligibility: "Individual participation; shortlisted participants advance from aptitude, GD, and resume review", teamSize: "Individual entry; selected teams have 1 captain, 5 participants, and a mentor", fee: "₹100 per participant", status: "Registration open", registrationUrl: "https://forms.gle/Ku84EXvjiFvU25us9", contacts: [{ name: "Gaurav", phone: "+918850439707" }, { name: "Ovee", phone: "+918850544242" }, { name: "Sudhanshu", phone: "+919325959412" }, { name: "Taazeen", phone: "+918591524096" }], relatedLinks: [{ label: "Event website", url: "https://iet-ipl-2026.vercel.app" }, { label: "View on Unstop", url: "https://unstop.com/competitions/ipl-innovation-pitch-league-iet-on-campus-sies-graduate-school-of-technology-navi-mumbai-maharashtra-1758032" }], overview: "IET On Campus SIES GST presents a two-day, IPL-inspired mega event with a mock placement experience, internship opportunities, talent auction, leadership and team-building activities, food, and a six-hour hackathon. The top eight performers become captains, while the next 40 shortlisted participants enter the auction to form eight teams and solve real-world industry problems.", schedule: [{ title: "Aptitude and group discussion", date: "Oct 9, 2026", description: "Participants are assessed through aptitude, group discussion, and resume review." }, { title: "Captain selection and talent auction", date: "Oct 9, 2026", description: "The top eight become captains and 40 shortlisted participants enter the IPL-style auction." }, { title: "Innovation Challenge", date: "Oct 10, 2026", description: "Eight formed teams compete in a six-hour hackathon on real-world industry problems." }, { title: "Final pitch and awards", date: "Oct 10, 2026", description: "Teams pitch their solutions for ₹15,000, ₹10,000, and ₹5,000 prizes." }] },
  { slug: "elevate-1-0-2026", title: "ELEVATE 1.0", type: "Hackathon", tag: "National / 24 Hours", description: "A national-level 24-hour hackathon where teams turn real-world challenges into working technology solutions.", date: "Oct 10–11, 2026", location: "Dwarkadas J. Sanghvi College of Engineering, Mumbai", format: "In person", prize: "₹1,00,000+", image: elevatePoster.url, imageFit: "contain", organizer: "DJS NSDC × DJS InfoMatrix", registrationDeadline: "Oct 3, 2026", eligibility: "Builders ready to tackle real-world challenges at a national-level hackathon", teamSize: "Team participation", fee: "See official registration", status: "Registration open", registrationUrl: "https://unstop.com/o/PMU41BH", contacts: [{ name: "Vrindaa Talwar", phone: "+919419253635" }, { name: "Swayam Panchal", phone: "+919833507492" }, { name: "Samarth Bhirud", phone: "+918408917498" }], relatedLinks: [{ label: "Explore ELEVATE 1.0", url: "https://elevate1-0.vercel.app/" }, { label: "Event WhatsApp channel", url: "https://chat.whatsapp.com/IU1yrudPUvg7IBw46i1wkh" }], overview: "ELEVATE 1.0 is a national-level hackathon organised by DJS NSDC and DJS InfoMatrix, with Mumbai Tech Community as Community Partner. Across 24 hours, participants tackle real-world challenges, build working solutions, and compete for a ₹1,00,000+ prize pool along with goodies and surprises.", schedule: [{ title: "Registration deadline", date: "Oct 3, 2026", description: "Complete registration through the official Unstop listing before seats close." }, { title: "Hackathon begins", date: "Oct 10, 2026", description: "Teams start 24 hours of coding, building, and problem-solving." }, { title: "Final demos and awards", date: "Oct 11, 2026", description: "Teams present their solutions and winners are selected." }] },
  { slug: "hack-in-hills-2026", title: "Hack in Hills ’26", type: "Hackathon", tag: "PPT → Prototype → Manali", description: "Compete online for one of 40 builder spots at a 24+ hour offline hackathon in the mountains of Manali.", date: "Nov 20, 2026", location: "Manali, Himachal Pradesh", format: "Hybrid", prize: "₹50,000 bounty pool", image: hackInHillsPoster.url, imageFit: "contain", organizer: "Web3 India × Builder Base", registrationDeadline: "Oct 5, 2026", eligibility: "Open registration; only 40 builders advance to the offline finale", teamSize: "See official registration", fee: "Free", status: "Registration open", registrationUrl: "https://unstop.com/o/dRs01iP/?ref=punmZRNS", overview: "Hack in Hills ’26 takes builders from PPT to prototype and then to Manali. From more than 7,000 registrations and 190,000+ reach, only 40 builders will qualify for the 24+ hour offline finale in the mountains, competing for a ₹50,000 bounty pool. Registration is completely free.", schedule: [{ title: "Registration closes", date: "Oct 5, 2026", description: "Submit through the official Unstop registration page." }, { title: "PPT and prototype selection", date: "Before Nov 20, 2026", description: "Entries progress from idea presentation to prototype review as 40 finalists are selected." }, { title: "Offline mountain sprint", date: "Nov 20, 2026", description: "The selected 40 builders compete in a 24+ hour offline hackathon in Manali." }] },
  { slug: "cooling-everything", title: "Cooling Everything", type: "Competition", tag: "Hardware / Climate", description: "Engineer efficient cooling for data centres and connected devices.", date: "Oct 22–24", location: "Pune", format: "In person", prize: "₹75,000", image: evCool, organizer: "Vybe Driven", registrationDeadline: "To be announced", eligibility: "Students, engineers, and product teams", teamSize: "2–4 members", fee: "Free", status: "Opening soon", overview: "Design an energy-conscious cooling concept for high-density computing and connected devices, backed by clear assumptions and a testable prototype.", schedule: [{ title: "Registration", date: "Opening soon", description: "Team applications will open after venue confirmation." }, { title: "Challenge sprint", date: "Oct 22–24", description: "Build and validate your proposed solution in Pune." }, { title: "Jury review", date: "Oct 24", description: "Finalists demonstrate impact, feasibility, and efficiency." }] },
  { slug: "cyber-trail", title: "Cyber Trail", type: "Competition", tag: "Security / CTF", description: "Capture the flag across 40 challenges in one high-energy weekend.", date: "Nov 2–3", location: "Online", format: "Online", prize: "₹50,000", image: evCyber, organizer: "Vybe Driven", registrationDeadline: "To be announced", eligibility: "Open to security learners and professionals", teamSize: "1–3 members", fee: "Free", status: "Opening soon", overview: "Work through progressive web, cryptography, reverse-engineering, and forensics challenges in a time-boxed online capture-the-flag competition.", schedule: [{ title: "Registration", date: "Opening soon", description: "Register your team and complete the readiness check." }, { title: "CTF window", date: "Nov 2–3", description: "Challenges remain available throughout the competition window." }, { title: "Results", date: "Nov 3", description: "Scores are verified before the final leaderboard is announced." }] },
  { slug: "unicorn-ai-gpu-pre-summit", title: "UNICORN × AI × GPU Pre Summit", type: "Networking", tag: "GPU / Datacentre", description: "A focused Mumbai connect for GPU and datacentre leaders.", date: "Oct 15, 2026 · 4–6 PM", location: "Earth Cafe @ BKC, Bandra East, Mumbai", format: "In person", image: unicornSummitPoster.url, imageFit: "contain", organizer: "GPU.NET", registrationDeadline: "Until capacity is reached", eligibility: "GPU, AI infrastructure, and datacentre leaders and professionals", teamSize: "Individual registration", fee: "See official registration", status: "Registration open", registrationUrl: "https://luma.com/d1f99fgo", overview: "GPU.NET presents the UNICORN × AI × GPU Pre Summit in Mumbai, bringing GPU and datacentre leaders together for an evening of focused conversation and connections at Earth Cafe in BKC.", schedule: [{ title: "Registration", date: "Open now", description: "Reserve a place through the official event page while capacity remains." }, { title: "Leaders connect", date: "Oct 15, 2026 · 4–6 PM", description: "Meet GPU and datacentre leaders at Earth Cafe @ BKC in Mumbai." }] },
  { slug: "structuring-the-ai-way", title: "Structuring the AI Way", type: "Meetup", tag: "AI / Financial Workflows", description: "See how AI transforms complex structuring workflows into fast, reliable execution.", date: "Oct 24, 2026 · 10 AM–1 PM", location: "Mumbai, Maharashtra · Exact address after approval", format: "In person", image: structuringAiPoster.url, imageFit: "contain", organizer: "Kannan · OpenArrow", registrationDeadline: "Until limited capacity is reached", eligibility: "Wealth managers, bank relationship managers, structured product issuers, and NBFC and SME treasury desks", teamSize: "Individual registration", fee: "See official registration", status: "Approval required", registrationUrl: "https://luma.com/c6v1qjx0", registrationLabel: "Request to join", registrationNote: "Registration is reviewed by the host. Approved attendees receive the exact Mumbai address.", overview: "Join an exclusive OpenArrow walkthrough showing how intelligent automation can reduce manual term-sheet friction, accelerate pricing workflows, and improve desk efficiency. The session covers automated term-sheet generation, risk modelling, seamless desk execution, a live demonstration, and direct Q&A with the OpenArrow team. Attendees receive two weeks of complimentary trial access after the event.", schedule: [{ title: "Request approval", date: "Open now", description: "Submit your registration for host review; space is intentionally limited." }, { title: "Live walkthrough", date: "Oct 24, 2026 · 10 AM", description: "See AI-driven structuring, term-sheet generation, risk modelling, and desk execution in practice." }, { title: "Q&A session", date: "Oct 24, 2026", description: "Discuss custom integrations and deployment directly with the OpenArrow team." }] },
  { slug: "ai-at-work-copilot-apps-agents", title: "AI at Work: Copilot, Apps & Agents", type: "Meetup", tag: "AI-Native Work", description: "A closed-door Mumbai session with real demonstrations and candid discussion about AI at work.", date: "Oct 24, 2026 · 11 AM–3 PM", location: "Mumbai, Maharashtra · Address shared with attendees", format: "In person", image: aiAtWorkPoster.url, imageFit: "contain", organizer: "Mumbai Techy", registrationDeadline: "Event full · Waitlist available", eligibility: "Operators, builders, and decision-makers interested in practical AI adoption", teamSize: "Individual registration", fee: "See official registration", status: "Event full", registrationUrl: "https://luma.com/gbzxsgj4", registrationLabel: "Join waitlist", registrationNote: "The event is currently full. Join the waitlist to be notified if a place becomes available.", overview: "AI at Work is an exclusive, limited-seat session for operators, builders, and decision-makers who want practical insight instead of generic keynotes. Expect a focused room, real demonstrations, and candid conversation about how Copilot, Apps, and Agents are already changing day-to-day work.", schedule: [{ title: "Join the waitlist", date: "Available now", description: "Add your name to be notified if more places become available." }, { title: "AI at Work session", date: "Oct 24, 2026 · 11 AM–3 PM", description: "Explore practical uses of Copilot, Apps, and Agents through live demonstrations and discussion." }] },
  { slug: "enterprise-ai-summit-mumbai-2026", title: "Enterprise AI Summit Mumbai 2026", type: "Conference", tag: "Enterprise AI / India Stack", description: "A full-day summit on scaling autonomous systems across India’s digital public infrastructure.", date: "Dec 5, 2026 · 9 AM–6 PM", location: "Jio World Convention Centre, BKC, Mumbai", format: "In person", image: enterpriseAiSummitPoster.url, imageFit: "contain", organizer: "Stage-X", registrationDeadline: "Until capacity is reached", eligibility: "Enterprise leaders, technology decision-makers, builders, and AI practitioners", teamSize: "Individual registration", fee: "See official registration", status: "Registration open", registrationUrl: "https://luma.com/y2o1cuts", overview: "Stage-X Enterprise AI Summit Mumbai brings together people, ideas, and real-world impact around India Stack, scale, and digital public infrastructure. The Mumbai gathering focuses on deploying enterprise AI and scaling autonomous systems, as part of the Nine Cities, One Mission global summit network.", schedule: [{ title: "Registration", date: "Open now", description: "Register through the official event page while places remain." }, { title: "Enterprise AI Summit", date: "Dec 5, 2026 · 9 AM–6 PM", description: "A full day at Jio World Convention Centre focused on enterprise AI at scale." }] },
  { slug: "clinical-ai-summit-2026", title: "Clinical AI Summit 2026", type: "Conference", tag: "Healthcare AI / Clinical Practice", description: "A clinician-led summit on practical AI deployment, governance, diagnostics, and patient care.", date: "Oct 11, 2026 · 8:30–9:30 PM", location: "ITC Grand Central, Parel, Mumbai", format: "In person", image: clinicalAiPoster.url, imageFit: "contain", organizer: "TIS-H", registrationDeadline: "Sold out", eligibility: "Healthcare professionals, researchers, clinicians, and technology innovators", teamSize: "Individual registration", fee: "₹4,500", status: "Sold out", registrationUrl: "https://luma.com/3fs83hz8", registrationNote: "This event is sold out and no longer taking registrations.", relatedLinks: [{ label: "Event website", url: "https://tish-summit.com" }], overview: "Clinical AI Summit 2026 is a focused gathering exploring how artificial intelligence is reshaping clinical practice, diagnostics, and patient care. Healthcare professionals, researchers, and technology innovators will discuss real-world applications ranging from early disease detection to personalised treatment planning, alongside responsible deployment, governance, and scale.", schedule: [{ title: "Registration", date: "Sold out", description: "Registration has closed because the summit has reached capacity." }, { title: "Clinical AI Summit", date: "Oct 11, 2026 · 8:30–9:30 PM", description: "Join the clinician-led session at ITC Grand Central in Parel, Mumbai." }] },
  { slug: "durable-devops-tech-meetup", title: "Durable DevOps Tech Meetup", type: "Meetup", tag: "DevOps / AI / Tech Careers", description: "A practical Mumbai meetup on DevOps, AI, careers, community, and resilient applications.", date: "Oct 17, 2026 · 6–9 PM", location: "Bhim Nagar, Andheri East, Mumbai", format: "In person", image: durableDevOpsPoster.url, imageFit: "contain", organizer: "Merge & Rise × Temporal Community", registrationDeadline: "Until capacity is reached", eligibility: "Beginners, early-career engineers, experienced professionals, and career switchers", teamSize: "Individual registration", fee: "See official registration", status: "Registration open", registrationUrl: "https://luma.com/uvc7v42g", overview: "Merge & Rise and Temporal present a practical tech meetup covering DevOps, AI, careers, and changes across the technology landscape. The programme includes a women’s career panel, a session on building a DevOps career in the AI era, a raffle giveaway, food, and networking.", schedule: [{ title: "Doors open", date: "Oct 17, 2026 · 6 PM", description: "Arrive in Andheri, meet the community, and settle in before the sessions." }, { title: "Career and DevOps sessions", date: "Oct 17, 2026", description: "Hear the women’s career panel and explore DevOps careers in the era of AI." }, { title: "Food and networking", date: "Until 9 PM", description: "Connect with attendees, exchange ideas, and join the raffle giveaway." }] },
  { slug: "ai-automation-human-touch", title: "AI, Automation & the Human Touch", type: "Meetup", tag: "AI / Customer Relationships", description: "An interactive Thane meetup about balancing intelligent automation with genuine human connection.", date: "Oct 31, 2026 · 1–3 PM", location: "Ricci's caffè, Hiranandani Estate, Thane", format: "In person", image: allInOnePoster.url, imageFit: "contain", organizer: "Allin1Place Mumbai Chapter", registrationDeadline: "Until capacity is reached", eligibility: "Professionals and builders interested in AI, automation, and customer relationships", teamSize: "Individual registration", fee: "Free · Pay only for what you order", status: "Approval required", registrationUrl: "https://luma.com/rt22ydyb", registrationLabel: "Request to join", registrationNote: "Registration is subject to host approval. The meetup is free; attendees pay only for what they order.", overview: "The Allin1Place Mumbai Mini-Meetup explores where AI can help teams work smarter, what should be automated, and where human connection still matters. Expect practical conversations, real-world use cases, shared experiences, and interactive activities designed to create useful new connections.", schedule: [{ title: "Request approval", date: "Open now", description: "Submit your request to join the free Mumbai mini-meetup." }, { title: "Activities and discussion", date: "Oct 31, 2026 · 1 PM", description: "Explore automation, human-centred customer relationships, and real-world AI use cases." }, { title: "Connections", date: "Until 3 PM", description: "Meet the Allin1Place Mumbai community and continue the conversation." }] },
];

export function getOpportunity(slug: string): Opportunity | undefined {
  const seed = opportunities.find((item) => item.slug === slug);
  if (seed) return seed;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("hd_hosted_events");
      if (raw) {
        const hosted = JSON.parse(raw);
        const found = hosted.find((item) => item.slug === slug);
        if (found) return found;
      }
    } catch {
      // Fallback
    }
  }
  return undefined;
}
