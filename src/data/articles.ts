/* ═══════════════════════════════════════════════════════════════
   Central data store for all articles.
   ═══════════════════════════════════════════════════════════════ */

export type Article = {
  id: number;
  slug: string;
  title: string;
  category: string;
  categoryKey: string;
  date: string;
  dateISO: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  featured: boolean;
  tags: string[];
  excerpt: string;
  image: string;
  imageCrop: string;
  content: string;
};

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: "neighbourhood-came-together-after-storm",
    title: "How Our Neighbourhood Came Together After the Storm",
    category: "Community",
    categoryKey: "community",
    date: "May 28, 2025",
    dateISO: "2025-05-28",
    author: "Sarah Okafor",
    authorRole: "Community Reporter",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    readTime: "8 min read",
    featured: true,
    tags: ["community", "resilience", "volunteering"],
    excerpt: "When last autumn's floods hit hardest, it was our community network that mobilised first — delivering food, clearing roads, and rebuilding homes shoulder to shoulder.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=85",
    imageCrop: "center",
    content: `
      <p class="article-lead">When the floodwaters rose last October, the official response took nearly 48 hours to arrive. But Communitas volunteers were already on the streets within two hours of the first alert — and what happened in those frantic days reshaped what it means to be a neighbour.</p>

      <p>It started with a single WhatsApp message in the Communitas members' group at 3:42 am. By 6 am, seventeen volunteers had gathered at the community centre with wellington boots, food parcels, and a handwritten list of every elderly resident on the three most affected streets.</p>

      <h2>The First 48 Hours</h2>
      <p>Team leader Marcus Webb recalls the moment he realised the scale of what was unfolding. "We pulled up to Riverside Lane and there were cars submerged to their door handles. Mrs Patel, 82 years old, was standing at her first-floor window waving a torch. We didn't wait for instructions — we got a dinghy from the storage unit and went in."</p>

      <p>Over the next two days, more than 140 community members volunteered in rotating shifts. A WhatsApp coordination group grew to 380 participants. The community centre's kitchen ran 24 hours a day, producing hot meals that were distributed by bicycle and on foot.</p>

      <blockquote>
        <p>"I've lived here forty years and I've never seen anything like it — not the flood, the response. People I'd never spoken to were carrying my furniture to safety."</p>
        <cite>— Margaret Collins, resident, Riverside Lane</cite>
      </blockquote>

      <h2>Logistics That Would Make a Charity Proud</h2>
      <p>Within 24 hours, a makeshift logistics operation had taken shape in the community centre's main hall. A whiteboard tracked which streets had been visited, which households needed food drops, and which residents required medical attention. Volunteer drivers with four-wheel-drive vehicles ferried people to temporary accommodation. A parents' group organised a pop-up crèche so that adults could volunteer without worrying about childcare.</p>

      <p>Local businesses responded too. The corner grocery donated three hundred pounds worth of dry goods. A nearby restaurant sent commercial-grade flasks of hot soup. A plumbing firm offered free emergency call-outs for households with burst pipes in the aftermath.</p>

      <h2>What It Revealed About Our Community</h2>
      <p>Community director Amara Diallo says the flood response revealed something that had been quietly building for years. "We've spent nearly two decades creating connections — through the sports leagues, the arts programmes, the seniors lunches. When the crisis came, those connections activated immediately. People knew each other. They trusted each other. That's not something you can improvise."</p>

      <p>The experience has led to the creation of a formal Community Emergency Response Network (CERN), which will maintain a register of vulnerable residents, a roster of trained volunteers, and a store of basic emergency equipment. The network will hold a practice drill every spring.</p>

      <h2>Looking Ahead</h2>
      <p>Recovery from the floods is still ongoing for some residents. Communitas has established a hardship fund that has so far raised £14,000 to help families replace damaged belongings. But beyond the practical support, those who were part of the response speak of something harder to quantify — a renewed sense of what this place is and what its people are capable of.</p>

      <p>"We talk a lot about community," says Marcus Webb. "The flood showed us that ours is real."</p>
    `
  },
  {
    id: 2,
    slug: "youth-leaders-programme-tenth-cohort",
    title: "Youth Leaders Programme Graduates Its Tenth Cohort",
    category: "Youth",
    categoryKey: "youth",
    date: "May 14, 2025",
    dateISO: "2025-05-14",
    author: "James Holloway",
    authorRole: "Youth Programme Lead",
    authorAvatar: "https://randomuser.me/api/portraits/men/58.jpg",
    readTime: "5 min read",
    featured: false,
    tags: ["youth", "leadership", "education"],
    excerpt: "Sixteen young people aged 16–21 completed a six-month intensive leadership curriculum, with alumni already going on to run their own community initiatives.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=85",
    imageCrop: "top",
    content: `
      <p class="article-lead">Sixteen young people between the ages of 16 and 21 stood on a stage last Saturday morning and accepted their Youth Leaders certificates — the tenth cohort to complete a programme that began, a decade ago, with just seven participants and a borrowed room.</p>

      <p>The Youth Leaders Programme runs for six months and combines practical project management, public speaking, conflict resolution, and civic engagement modules with hands-on leadership experience running real community initiatives.</p>

      <h2>Ten Years of Graduates</h2>
      <p>Since its founding in 2015, the programme has graduated 148 young people. Alumni have gone on to start their own charities, win national youth awards, enter local government, and — perhaps most importantly to the programme's organisers — return to Communitas as mentors and volunteers.</p>

      <blockquote>
        <p>"I came in shy and left with the confidence to stand up in a room of strangers and say what I believed. That sounds small. It wasn't."</p>
        <cite>— Priya Nair, 2023 graduate, now studying Politics at UCL</cite>
      </blockquote>

      <h2>This Year's Cohort Projects</h2>
      <p>Each participant completes the programme by designing and delivering a community project. This year's cohort produced some of the most ambitious projects in the programme's history. Highlights included a digital literacy workshop series for seniors, a peer mental health support network in two local secondary schools, a neighbourhood clean-up campaign that removed over two tonnes of fly-tipping, and a community cookbook celebrating the food cultures represented in the area.</p>

      <h2>What Comes Next</h2>
      <p>Three members of this year's cohort have already been offered paid part-time roles with Communitas. The programme coordinator, Zara Ahmed, is working to secure funding to expand the programme from sixteen places to twenty-five from next year, with a particular focus on reaching young people who are not currently engaged in any community activity.</p>

      <p>Applications for the eleventh cohort open in September. The programme is free to attend, and travel bursaries are available.</p>
    `
  },
  {
    id: 3,
    slug: "five-traditions-one-stage-spring-festival",
    title: "Five Traditions, One Stage: Recapping the Spring Festival",
    category: "Culture",
    categoryKey: "culture",
    date: "April 30, 2025",
    dateISO: "2025-04-30",
    author: "Elena Torres",
    authorRole: "Arts & Culture Writer",
    authorAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
    readTime: "4 min read",
    featured: false,
    tags: ["culture", "festival", "arts", "music"],
    excerpt: "Over 800 people attended our spring cultural festival, where performers from five distinct cultural traditions shared a single stage in a celebration of our community's diversity.",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=85",
    imageCrop: "center",
    content: `
      <p class="article-lead">The lights dimmed in the main hall at exactly seven o'clock. Then the dhol drum began — a single, deep beat that seemed to fill the room from the floor up. By the time the stage lights came up, revealing a tableau of five performers in five distinct costumes from five different cultural traditions, the audience was already leaning forward.</p>

      <p>The Spring Cultural Festival has been a fixture in the Communitas calendar for twelve years, but this year's edition felt like a step change. Eight hundred people attended across two sessions. The backstage area hosted more than sixty performers. And the programme — built around the theme of "roots and routes" — was the most ambitious the arts committee has ever assembled.</p>

      <h2>The Performances</h2>
      <p>The evening opened with a classical Bharatanatyam dance piece performed by three dancers from the community's Indian cultural association, their hand gestures (mudras) narrating a story of migration and arrival. It was followed by a West African drumming ensemble of eleven musicians whose call-and-response rhythms had the audience clapping along within minutes.</p>

      <p>A contemporary Irish set dance troupe performed next — fast, precise footwork from eight dancers whose performance blended traditional jigs with a more modern choreographic language. Then came a Turkish Halk Müziği (folk music) quartet, their saz and violin filling the hall with a sound that several audience members later described as "unexpectedly moving."</p>

      <blockquote>
        <p>"I've been coming to this festival for six years and every year I learn something I didn't know about the people I live next to. That's remarkable."</p>
        <cite>— Audience member, overheard at the interval</cite>
      </blockquote>

      <h2>The Finale</h2>
      <p>The evening culminated in a collaborative piece conceived specifically for this festival, in which performers from all five traditions shared the stage simultaneously. The result was chaotic in the best possible sense — a swirl of rhythm, colour, and movement that the artistic director described as "a portrait of this neighbourhood exactly as it is."</p>

      <h2>What's Next</h2>
      <p>The arts committee is already planning the autumn showcase, which will focus specifically on visual art, spoken word, and film. Details will be published in June.</p>
    `
  },
  {
    id: 4,
    slug: "free-sports-programme-95-percent-retention",
    title: "Why Our Free Sports Programme Has a 95% Retention Rate",
    category: "Sports",
    categoryKey: "sports",
    date: "April 12, 2025",
    dateISO: "2025-04-12",
    author: "Ravi Sharma",
    authorRole: "Sports Coordinator",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    readTime: "3 min read",
    featured: false,
    tags: ["sports", "health", "community", "wellbeing"],
    excerpt: "Most community sports programmes see drop-off rates of 40–60% after the first term. Ours retains 95% of participants year on year. Here's what we do differently.",
    image: "https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=1200&q=85",
    imageCrop: "center",
    content: `
      <p class="article-lead">The national average retention rate for community sports participation programmes is around 55–60% after the first year. Ours is 95%. People sometimes ask how. The honest answer is: we stopped thinking about sport and started thinking about belonging.</p>

      <h2>The Problem with Most Sports Programmes</h2>
      <p>Most community sports programmes are built around activity. Turn up, play, go home. That works for people who are already sporty and already socially connected. It doesn't work for people who are nervous, out of shape, new to the area, or who've never played sport in an organised setting before — which is, frankly, most of the people who would benefit most from it.</p>

      <h2>What We Do Differently</h2>
      <p>Every session at Communitas is designed with three layers. The first is the activity itself. The second is what we call the "social architecture" — a structured fifteen minutes of informal mixing before and after every session, facilitated by a trained volunteer who makes sure no one stands alone. The third is what we call the "thread" — a running narrative that connects each session to the next, so participants feel like they're part of something ongoing rather than attending a one-off class.</p>

      <blockquote>
        <p>"I hadn't run since school. I showed up terrified I'd be the worst there. Turns out half the group felt exactly the same — we just didn't know it until we talked."</p>
        <cite>— Ahmed Siddiqui, Running Club member since 2022</cite>
      </blockquote>

      <h2>The Role of the Volunteer Coaches</h2>
      <p>Our sports sessions are led by forty-three volunteer coaches, each of whom receives twelve hours of training before their first session. That training is split equally between technical coaching skills and what we call "inclusion facilitation" — how to read a room, how to pair people productively, how to make the last person through the door feel as welcome as the first.</p>

      <h2>The Numbers Behind the Number</h2>
      <p>In the last twelve months, 847 individuals participated in at least one Communitas sports programme. Of those, 804 returned for a second term. Across all programmes, average session attendance is 87% of enrolled participants — a figure that has remained stable for four consecutive years.</p>

      <p>We think the retention rate matters not just as a metric but as evidence: people who keep coming back are people who feel they belong. And belonging is the whole point.</p>
    `
  },
  {
    id: 5,
    slug: "seniors-digital-literacy-programme-transforms-lives",
    title: "The Seniors Digital Literacy Programme That's Transforming Lives",
    category: "Seniors",
    categoryKey: "seniors",
    date: "March 25, 2025",
    dateISO: "2025-03-25",
    author: "Aisha Malik",
    authorRole: "Volunteer Coordinator",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    readTime: "6 min read",
    featured: false,
    tags: ["seniors", "technology", "education", "wellbeing"],
    excerpt: "Twelve months ago, seventy-three-year-old Gerald had never sent an email. Today he runs a WhatsApp group of 40 friends and video-calls his grandchildren in Canada every Sunday.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=85",
    imageCrop: "top",
    content: `
      <p class="article-lead">Gerald Whitmore is 73 years old. Twelve months ago, he had never sent an email. Last Tuesday, he helped three of his classmates configure their privacy settings on Facebook while simultaneously streaming a cricket match on his tablet. "I was the one who needed help last year," he laughs. "Now I'm the one giving it."</p>

      <p>Gerald is one of 94 seniors who have completed Communitas's Digital Literacy Programme since its launch eighteen months ago. The programme runs in eight-week cohorts of twelve participants, with sessions held three mornings a week in a dedicated digital suite that was funded by a local authority grant and fitted out with donated laptops and tablets.</p>

      <h2>Designed for Confidence, Not Just Competence</h2>
      <p>The programme's lead facilitator, Diane Chen, is clear about what distinguishes it from other digital literacy courses. "Most courses teach skills. We teach confidence first. If someone is scared of breaking something, they won't experiment. And you have to experiment to learn."</p>

      <p>Sessions begin not with screens but with conversation — a structured discussion about what participants want to be able to do, and what fears they're bringing into the room. Common fears include accidentally spending money, being scammed, "breaking the internet," and feeling stupid in front of younger people.</p>

      <blockquote>
        <p>"My son used to sigh whenever I asked him for help with my phone. Now I don't need to ask him. I feel independent again."</p>
        <cite>— Patricia Dunn, programme graduate, age 69</cite>
      </blockquote>

      <h2>The Social Impact</h2>
      <p>The digital skills are valuable. But programme graduates and staff alike agree that the social impact is equally significant. Isolation among older people is a serious public health issue — and the programme addresses it on two levels. Within the sessions, participants form genuine friendships. And once they have digital skills, they can maintain connections far more easily: video-calling family, joining community WhatsApp groups, accessing online social clubs.</p>

      <h2>What Comes Next</h2>
      <p>Communitas is currently fundraising to expand the programme from four cohorts per year to eight, and to introduce a peer-mentoring strand in which graduates support new participants. If you'd like to support this work, visit the donate section of this website.</p>
    `
  },
  {
    id: 6,
    slug: "new-community-mural-unveiled",
    title: "Sixty Hands, One Wall: Our New Community Mural Unveiled",
    category: "Arts",
    categoryKey: "arts",
    date: "March 8, 2025",
    dateISO: "2025-03-08",
    author: "Elena Torres",
    authorRole: "Arts & Culture Writer",
    authorAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
    readTime: "4 min read",
    featured: false,
    tags: ["arts", "culture", "community", "volunteering"],
    excerpt: "Over eight weekends, sixty volunteers of all ages and skill levels painted a 20-metre mural on the east wall of the community centre. The result is extraordinary.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=85",
    imageCrop: "center",
    content: `
      <p class="article-lead">The east wall of the Communitas centre had been bare concrete for eleven years. Last Saturday, in front of a crowd of 200 people, the scaffolding came down to reveal a twenty-metre mural that tells the story of this neighbourhood across three centuries — and the sixty pairs of hands that painted it.</p>

      <p>The project began in January with an open call for volunteers. No artistic experience was required or expected. The lead artist, Miriam Vasquez, a muralist with twenty years' experience working with communities across Europe, had a clear vision from the outset: "I wanted a mural that could only have been made here, by these people. That means imperfection is part of it. The fingerprints are part of it."</p>

      <h2>The Design Process</h2>
      <p>Before a single brushstroke was applied, Miriam spent four weeks conducting interviews with long-standing residents, looking through the community archive of photographs, and running workshops in which participants drew their own images of what the neighbourhood meant to them.</p>

      <p>The final design is divided into three registers. The bottom third depicts the historical roots of the area — figures in Victorian clothing, the original factory buildings, the first wave of migrants arriving in the 1950s and 60s. The middle third shows the community as it is today: the market, the sports ground, the community centre itself, faces from across the neighbourhood rendered in warm ochres and terracottas. The upper third looks upward — literally — to the sky, with abstract forms suggesting possibility, growth, and the future.</p>

      <blockquote>
        <p>"My granddaughter painted the bird in the top-right corner. She's six. When she saw it on the wall she burst into tears. Then I did too."</p>
        <cite>— David Osei, resident and volunteer</cite>
      </blockquote>

      <h2>Eight Weekends of Making</h2>
      <p>The painting itself took place over eight consecutive weekends, with sessions running from 10am to 4pm regardless of weather. Volunteers as young as five and as old as 81 contributed. Miriam mixed bespoke batches of weather-resistant exterior paint in a palette of 34 colours, each one chosen to evoke the warmth and earthiness she associates with the community's character.</p>

      <p>The mural is expected to last at least twenty years without significant maintenance. Miriam has left two sections intentionally unfinished — small blank spaces that future generations can add to, as the story continues.</p>
    `
  },
  {
    id: 7,
    slug: "volunteer-spotlight-marcus-webb",
    title: "Volunteer Spotlight: The Man Who Shows Up Every Single Time",
    category: "Community",
    categoryKey: "community",
    date: "February 18, 2025",
    dateISO: "2025-02-18",
    author: "Sarah Okafor",
    authorRole: "Community Reporter",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    readTime: "5 min read",
    featured: false,
    tags: ["volunteering", "community", "people"],
    excerpt: "Marcus Webb has volunteered with Communitas for eleven years. He's helped build the sports hall, led the flood response, and mentored dozens of young people. He says he does it for entirely selfish reasons.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=85",
    imageCrop: "center",
    content: `
      <p class="article-lead">Marcus Webb will tell you, with complete sincerity, that everything he does at Communitas is selfish. "I get more out of it than anyone I help. I'm here for me." He says this while simultaneously organising the rota for thirty flood volunteers, mentoring a 17-year-old on the Youth Leaders programme, and restocking the food bank shelves. Make of that what you will.</p>

      <p>Marcus, 48, has been volunteering with Communitas for eleven years. He came in the way most volunteers do — he turned up to one event, someone asked if he'd help out, and he said yes. "I didn't plan to stay. I just never left."</p>

      <h2>Eleven Years of Showing Up</h2>
      <p>Over those eleven years, Marcus has helped build the extension to the sports hall (he's a builder by trade), organised seventeen community clean-ups, led the neighbourhood response to last October's floods, mentored fourteen young people through the Youth Leaders programme, and co-founded the Community Emergency Response Network.</p>

      <p>He estimates he volunteers between twelve and fifteen hours a week, on top of full-time work. His wife, he says, is "a saint."</p>

      <blockquote>
        <p>"I used to come home from work and watch television. Now I come home from work and go to the community centre. I'm less tired. I sleep better. That's the selfish part."</p>
        <cite>— Marcus Webb</cite>
      </blockquote>

      <h2>What Motivates Him</h2>
      <p>When pushed, Marcus identifies three things that keep him coming back. The first is seeing change happen — the sports hall being built, a young person gaining confidence, a neighbour finding their feet after bereavement. The second is the relationships: "I know people here I'd never have met otherwise. People from completely different lives." The third, he admits after a pause, is simpler: "I just like being useful."</p>

      <h2>How to Volunteer</h2>
      <p>Communitas currently has 340 active volunteers. New volunteers are always welcome — no specific skills or experience are required, just a willingness to turn up. To register your interest, use the contact form on this website or come in person during opening hours. Marcus will probably be there.</p>
    `
  },
  {
    id: 8,
    slug: "annual-impact-report-2024",
    title: "Our 2024 Annual Impact Report: The Numbers Behind the Work",
    category: "Community",
    categoryKey: "community",
    date: "January 30, 2025",
    dateISO: "2025-01-30",
    author: "James Holloway",
    authorRole: "Youth Programme Lead",
    authorAvatar: "https://randomuser.me/api/portraits/men/58.jpg",
    readTime: "7 min read",
    featured: false,
    tags: ["impact", "annual report", "community", "data"],
    excerpt: "In 2024, Communitas delivered 4,200 programme sessions, supported 2,400 members, trained 43 volunteer coaches, and raised £87,000 in charitable income. Here's the full picture.",
    image: "https://images.unsplash.com/photo-1609234656388-0ff363383899?w=1200&q=85",
    imageCrop: "center",
    content: `
      <p class="article-lead">Every January we publish our annual impact report — a transparent account of what we did, what it cost, and what difference we believe it made. This is our 2024 report.</p>

      <h2>At a Glance</h2>
      <p>In 2024, Communitas delivered 4,200 programme sessions across 34 active programmes. Total membership stood at 2,412 individuals. We trained 43 volunteer coaches and received 28,000 individual volunteer hours — equivalent to fourteen full-time members of staff. Charitable income totalled £87,000, of which 91p in every pound was spent directly on programmes and services.</p>

      <h2>Programmes</h2>
      <p>Our sports and physical activity programmes served 847 individuals in 2024, with a retention rate of 95%. Arts and cultural programmes served 612 participants across 18 distinct disciplines. The Youth Leaders Programme graduated 16 participants, bringing the all-time total to 148. The Seniors Wellbeing Programme — including the digital literacy strand — served 203 older adults.</p>

      <blockquote>
        <p>"These numbers represent real people whose lives are different because of this organisation. That's what we're here for."</p>
        <cite>— Amara Diallo, Community Director</cite>
      </blockquote>

      <h2>Finances</h2>
      <p>Total income in 2024 was £87,400, comprising grant funding (54%), individual donations (28%), events and room hire (11%), and other income (7%). Total expenditure was £84,100. The year-end surplus of £3,300 has been held in reserve. The full audited accounts are available on request.</p>

      <h2>Looking Ahead</h2>
      <p>In 2025, Communitas aims to expand the Digital Literacy Programme to eight cohorts per year, launch a new Mental Health and Wellbeing programme in partnership with the local NHS trust, and raise £25,000 through the community to fund a new outdoor sports area. We are grateful to every donor, volunteer, and participant who makes this work possible.</p>
    `
  }
];

export function getArticleById(id: number): Article | null {
  return ARTICLES.find((a) => a.id === id) ?? null;
}

export function getArticleBySlug(slug: string): Article | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function getRelatedArticles(id: number, limit = 3): Article[] {
  const current = getArticleById(id);
  if (!current) return [];
  return ARTICLES.filter((a) => a.id !== current.id && a.categoryKey === current.categoryKey)
    .concat(ARTICLES.filter((a) => a.id !== current.id && a.categoryKey !== current.categoryKey))
    .slice(0, limit);
}