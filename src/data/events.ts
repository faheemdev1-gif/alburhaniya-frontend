// ═══════════════════════════════════════════════════════════════
//  COMMUNITAS — src/data/events.ts
//  Central data + types for all events pages
// ═══════════════════════════════════════════════════════════════

export type CategoryKey =
  | 'gathering'
  | 'music'
  | 'dance'
  | 'arts'
  | 'sports'
  | 'youth'
  | 'seniors';

export interface ScheduleItem {
  time: string;
  item: string;
}

export interface Event {
  id: number;
  title: string;
  category: string;
  categoryKey: CategoryKey;
  status: 'upcoming' | 'past';
  featured: boolean;
  dateISO: string;
  dateLabel: string;
  day: string;
  month: string;
  year: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  address: string;
  capacity: number;
  registered: number;
  price: string;
  organiser: string;
  image: string;
  thumbImage: string;
  tags: string[];
  shortDesc: string;
  fullDesc: string;
  schedule: ScheduleItem[];
  highlights: string[];
}

export const EVENTS: Event[] = [
  {
    id: 1,
    title: 'Summer Open-Mic Night',
    category: 'Music',
    categoryKey: 'music',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-06-07',
    dateLabel: 'Saturday, 7 June 2025',
    day: '07', month: 'JUN', year: '2025',
    timeStart: '7:00 PM', timeEnd: '10:00 PM',
    location: 'Main Hall, Communitas Centre',
    address: '12 Heritage Lane, London EC1A 4BT',
    capacity: 120, registered: 84,
    price: 'Free',
    organiser: 'Music & Arts Committee',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    tags: ['music', 'performance', 'open-mic'],
    shortDesc: 'An evening of original performances from community musicians. Bring your friends, bring your voice.',
    fullDesc: `
      <p>Our beloved Open-Mic Night returns for the summer edition — and it promises to be the best one yet. Every seat filled, every voice heard, every note celebrated.</p>
      <p>Whether you're a seasoned performer or stepping onto a stage for the very first time, the Communitas Open-Mic Night is the most welcoming room in the city. Our audience is warm, our sound system is professional, and our host — the irrepressible DJ Kwame — will make sure you feel like a star.</p>
      <h3>What to Expect</h3>
      <p>The evening runs from 7:00 PM to 10:00 PM, with a short interval at 8:30 PM. Performers have a maximum slot of 8 minutes each. Genres welcome include: original music, spoken word, comedy, poetry, and acoustic covers.</p>
      <h3>Sign Up to Perform</h3>
      <p>Performer slots are limited — register via the form below and indicate whether you'd like a performance slot or an audience ticket. All audience tickets are free; performer registration closes 48 hours before the event.</p>
      <h3>Refreshments</h3>
      <p>A licensed bar will be in operation from 6:30 PM. Light snacks will be available. The venue is fully accessible.</p>
    `,
    schedule: [
      { time: '6:30 PM', item: 'Doors open & bar open' },
      { time: '7:00 PM', item: 'Welcome & first performers' },
      { time: '8:30 PM', item: 'Short interval' },
      { time: '8:45 PM', item: 'Second half — headline performers' },
      { time: '10:00 PM', item: 'Close' },
    ],
    highlights: ['Licensed bar from 6:30 PM', '8-minute performer slots', 'All genres welcome', 'Fully accessible venue', 'Free audience entry'],
  },
  {
    id: 2,
    title: 'Annual Community Festival 2025',
    category: 'Gathering',
    categoryKey: 'gathering',
    status: 'upcoming',
    featured: true,
    dateISO: '2025-06-14',
    dateLabel: 'Saturday, 14 June 2025',
    day: '14', month: 'JUN', year: '2025',
    timeStart: '10:00 AM', timeEnd: '9:00 PM',
    location: 'Community Park Grounds',
    address: 'Riverside Park, London EC2A 1AB',
    capacity: 2000, registered: 1340,
    price: 'Free',
    organiser: 'Communitas Board',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80',
    tags: ['festival', 'culture', 'family', 'music', 'food'],
    shortDesc: "A full-day celebration of culture, food, sport, and art. Our biggest event of the year — don't miss it!",
    fullDesc: `
      <p>The Annual Communitas Festival is the highlight of our calendar — a glorious, full-day celebration of everything that makes this community extraordinary. Last year over 1,800 people attended. This year we're going bigger.</p>
      <p>From 10am to 9pm, the park grounds will be transformed into a vibrant village of culture, food, sport, art, music, and community. There is something for every age, every interest, every mood.</p>
      <h3>What's On</h3>
      <p>The Main Stage will host live performances throughout the day, culminating in a headline concert at 7pm. The Food Village will feature cuisines from over a dozen countries. The Sports Zone will run friendly tournaments in cricket, football, and badminton. The Arts Quarter will showcase works from community artists alongside live painting and craft workshops.</p>
      <h3>For Families</h3>
      <p>A dedicated Family Zone will run children's activities from 10am to 5pm, including face-painting, storytelling, bouncy castles, and a community mural project that every child can contribute to.</p>
      <h3>Getting There</h3>
      <p>The park is a 5-minute walk from Central Station. Free bike parking is available. A shuttle bus will run from the community centre every 30 minutes from 9:30am.</p>
    `,
    schedule: [
      { time: '10:00 AM', item: 'Gates open — Food Village & Arts Quarter launch' },
      { time: '11:00 AM', item: 'Main Stage: Opening ceremony & cultural performances' },
      { time: '12:30 PM', item: 'Sports tournaments begin' },
      { time: '2:00 PM',  item: 'Main Stage: Community choir & dance showcase' },
      { time: '4:00 PM',  item: "Children's parade & prize-giving" },
      { time: '5:30 PM',  item: 'Community awards ceremony' },
      { time: '7:00 PM',  item: 'Headline concert — Main Stage' },
      { time: '9:00 PM',  item: 'Close & fireworks' },
    ],
    highlights: ['Free entry all day', 'Main stage headline concert', 'Food from 12+ cuisines', 'Family zone (10am–5pm)', 'Sports tournaments', 'Community awards', 'Fireworks finale'],
  },
  {
    id: 3,
    title: 'Community Cricket Tournament',
    category: 'Sports',
    categoryKey: 'sports',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-06-21',
    dateLabel: 'Saturday, 21 June 2025',
    day: '21', month: 'JUN', year: '2025',
    timeStart: '9:00 AM', timeEnd: '5:00 PM',
    location: 'Sports Ground, East Side',
    address: 'East Road Sports Ground, London E1 6RF',
    capacity: 300, registered: 156,
    price: '£5 per player',
    organiser: 'Sports Committee',
    image: 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=600&q=80',
    tags: ['cricket', 'sports', 'tournament', 'teams'],
    shortDesc: 'Six teams, one trophy. Register your team and compete in a friendly but fierce neighbourhood championship.',
    fullDesc: `
      <p>The annual Community Cricket Tournament is back — and entries are already flying in. Six team slots are available (four already taken), each playing in a round-robin format before the top two sides meet in a final at 3:30pm.</p>
      <p>All skill levels are welcome. The spirit is competitive but friendly — good cricket, great banter, and cold drinks in the pavilion afterwards.</p>
      <h3>Format</h3>
      <p>Each match is 10 overs per side. Round robin in the morning (9am–1pm), semi-finals at 1:30pm, final at 3:30pm. Prize-giving and BBQ from 5pm.</p>
      <h3>How to Enter</h3>
      <p>Teams must have a minimum of 9 players and a maximum of 13 on their squad. The entry fee of £5 per player covers umpiring, equipment hire, and the post-match BBQ.</p>
      <h3>Equipment</h3>
      <p>Stumps, balls, and batting pads are provided. Cricket whites are not required — just sensible sportswear and flat-soled shoes.</p>
    `,
    schedule: [
      { time: '8:30 AM', item: 'Team registration & warm-up' },
      { time: '9:00 AM', item: 'Round-robin matches begin (6 matches)' },
      { time: '1:00 PM', item: 'Lunch break' },
      { time: '1:30 PM', item: 'Semi-finals' },
      { time: '3:30 PM', item: 'Final' },
      { time: '5:00 PM', item: 'Prize-giving & BBQ' },
    ],
    highlights: ['6 team slots (4 taken)', '10-over format', 'All skill levels', '£5 per player entry', 'Post-match BBQ included', 'Trophy for winners'],
  },
  {
    id: 4,
    title: 'Mural Painting Workshop',
    category: 'Arts',
    categoryKey: 'arts',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-07-05',
    dateLabel: 'Saturday, 5 July 2025',
    day: '05', month: 'JUL', year: '2025',
    timeStart: '11:00 AM', timeEnd: '4:00 PM',
    location: 'East Wall, Communitas Centre',
    address: '12 Heritage Lane (East Wall), London EC1A 4BT',
    capacity: 40, registered: 27,
    price: 'Free',
    organiser: 'Arts & Culture Committee',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    tags: ['arts', 'painting', 'mural', 'workshop', 'outdoors'],
    shortDesc: "Help paint the new public mural on the community centre's east wall. All skill levels welcome.",
    fullDesc: `
      <p>Phase two of our public mural project is underway — and we need your hands. Lead muralist Miriam Vasquez returns to guide volunteers through the next section of the east wall.</p>
      <p>No artistic experience is needed. Miriam has a gift for helping first-timers contribute meaningfully.</p>
      <h3>What Happens on the Day</h3>
      <p>The session runs from 11am to 4pm with a lunch break at 1pm (lunch provided). Miriam will begin with a 30-minute guided introduction to the design and technique, after which volunteers work in small groups on assigned sections.</p>
      <h3>What to Wear</h3>
      <p>Old clothes you don't mind getting paint on. Aprons will be provided. Closed-toe shoes only.</p>
      <h3>Accessibility</h3>
      <p>The wall is worked from ground level. The area is paved and wheelchair accessible. The session is outdoors — dress accordingly.</p>
    `,
    schedule: [
      { time: '10:45 AM', item: 'Arrival & sign-in' },
      { time: '11:00 AM', item: 'Introduction & design briefing with Miriam' },
      { time: '11:30 AM', item: 'Painting begins' },
      { time: '1:00 PM',  item: 'Lunch break (provided)' },
      { time: '1:45 PM',  item: 'Afternoon session' },
      { time: '3:45 PM',  item: 'Clean-up & group walk-along' },
      { time: '4:00 PM',  item: 'Close' },
    ],
    highlights: ['All skill levels welcome', 'Materials fully provided', 'Lunch included', 'Led by professional muralist', 'Outdoors — dress for weather', 'Wheelchair accessible'],
  },
  {
    id: 5,
    title: 'Cultural Dance Showcase',
    category: 'Dance',
    categoryKey: 'dance',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-07-19',
    dateLabel: 'Saturday, 19 July 2025',
    day: '19', month: 'JUL', year: '2025',
    timeStart: '6:00 PM', timeEnd: '9:00 PM',
    location: 'Auditorium, Level 2',
    address: '12 Heritage Lane, London EC1A 4BT',
    capacity: 180, registered: 92,
    price: '£5 / Free for under-16s',
    organiser: 'Dance Academy',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80',
    tags: ['dance', 'performance', 'culture', 'showcase'],
    shortDesc: 'Students from our dance academy present their seasonal showcase across five cultural traditions.',
    fullDesc: `
      <p>Twice a year, the Communitas Dance Academy opens its doors and performs. The seasonal showcase is a chance for students of all ages and levels to share what they've been learning.</p>
      <p>This summer's showcase spans five cultural dance traditions: Bharatanatyam, West African contemporary, Flamenco, Bhangra, and Street/Hip-Hop. Sixty-three performers will take the stage, ranging in age from seven to sixty-one.</p>
      <h3>The Programme</h3>
      <p>The evening is divided into two halves of approximately 75 minutes each, with a 20-minute interval. The second half closes with a collaborative piece that brings all five traditions onto the stage together.</p>
      <h3>Tickets</h3>
      <p>Tickets are £5 for adults and free for under-16s. Doors open at 5:45pm. Latecomers may be seated at the interval only.</p>
    `,
    schedule: [
      { time: '5:30 PM', item: 'Box office opens' },
      { time: '5:45 PM', item: 'Doors open' },
      { time: '6:00 PM', item: 'First half: Bharatanatyam, West African, Flamenco' },
      { time: '7:15 PM', item: 'Interval' },
      { time: '7:35 PM', item: 'Second half: Bhangra, Hip-Hop & collaborative finale' },
      { time: '9:00 PM', item: 'Close & reception in the foyer' },
    ],
    highlights: ['63 performers', '5 cultural traditions', 'Ages 7–61 on stage', '£5 adults / Free under-16s', 'Interval reception', 'Collaborative finale'],
  },
  {
    id: 6,
    title: 'Seniors Digital Literacy Drop-In',
    category: 'Seniors',
    categoryKey: 'seniors',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-07-26',
    dateLabel: 'Saturday, 26 July 2025',
    day: '26', month: 'JUL', year: '2025',
    timeStart: '10:00 AM', timeEnd: '1:00 PM',
    location: 'Digital Suite, Ground Floor',
    address: '12 Heritage Lane, London EC1A 4BT',
    capacity: 24, registered: 11,
    price: 'Free',
    organiser: 'Seniors Wellbeing Team',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80',
    tags: ['seniors', 'digital', 'technology', 'drop-in'],
    shortDesc: 'Monthly drop-in for seniors wanting help with phones, tablets, and computers. No question too basic.',
    fullDesc: `
      <p>Our monthly Digital Drop-In is a relaxed, pressure-free session where anyone over 60 can bring their device and get one-to-one help from a trained volunteer.</p>
      <p>No appointment needed. Just turn up between 10am and 1pm. Past sessions have helped people set up video calls, learn to spot scam emails, install apps, and manage photos.</p>
      <h3>What to Bring</h3>
      <p>Your device (charged if possible), your device's password or PIN, and any specific questions. Tea and biscuits are provided.</p>
    `,
    schedule: [
      { time: '10:00 AM', item: 'Drop-in opens — arrive any time' },
      { time: '11:30 AM', item: "Optional group Q&A: this month's topic (online safety)" },
      { time: '1:00 PM',  item: 'Close' },
    ],
    highlights: ['No appointment needed', 'One-to-one help', 'All devices welcome', 'Trained volunteers', 'Tea & biscuits provided', 'Free of charge'],
  },
  {
    id: 7,
    title: 'Youth Leadership Graduation Ceremony',
    category: 'Youth',
    categoryKey: 'youth',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-08-02',
    dateLabel: 'Saturday, 2 August 2025',
    day: '02', month: 'AUG', year: '2025',
    timeStart: '2:00 PM', timeEnd: '5:00 PM',
    location: 'Main Hall, Communitas Centre',
    address: '12 Heritage Lane, London EC1A 4BT',
    capacity: 200, registered: 148,
    price: 'Free — invite only',
    organiser: 'Youth Programme Team',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
    tags: ['youth', 'graduation', 'leadership', 'ceremony'],
    shortDesc: 'Celebrating the eleventh cohort of our Youth Leaders Programme — sixteen graduates, their families, and their futures.',
    fullDesc: `
      <p>Sixteen young people who have spent six months growing, learning, leading, and stepping beyond their own expectations will receive their Youth Leaders certificates at this year's graduation ceremony.</p>
      <p>Graduates will each give a short address reflecting on their programme experience and their community project. The ceremony is followed by a reception.</p>
      <h3>Who Can Attend</h3>
      <p>The graduation is invite-only. Each graduate receives two guest tickets automatically. Additional tickets may be available — contact the youth team to enquire.</p>
    `,
    schedule: [
      { time: '1:30 PM', item: 'Foyer opens — graduate project exhibition' },
      { time: '2:00 PM', item: 'Ceremony begins — welcome address' },
      { time: '2:15 PM', item: 'Graduate project presentations' },
      { time: '3:30 PM', item: 'Certificate presentation' },
      { time: '4:00 PM', item: 'Keynote: alumni speaker' },
      { time: '4:30 PM', item: 'Reception in the foyer' },
      { time: '5:00 PM', item: 'Close' },
    ],
    highlights: ['Invite only — 2 guest tickets per graduate', 'Graduate speeches', 'Project exhibition from 1:30pm', 'Alumni keynote', 'Reception to follow', 'Free to attend'],
  },
  {
    id: 8,
    title: 'Autumn Community Gathering & Town Hall',
    category: 'Gathering',
    categoryKey: 'gathering',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-09-06',
    dateLabel: 'Saturday, 6 September 2025',
    day: '06', month: 'SEP', year: '2025',
    timeStart: '11:00 AM', timeEnd: '3:00 PM',
    location: 'Main Hall, Communitas Centre',
    address: '12 Heritage Lane, London EC1A 4BT',
    capacity: 300, registered: 74,
    price: 'Free',
    organiser: 'Communitas Board',
    image: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=600&q=80',
    tags: ['town hall', 'gathering', 'community', 'democracy'],
    shortDesc: "Our seasonal town hall — hear updates on plans, shape next year's programme, and share a meal with neighbours.",
    fullDesc: `
      <p>Four times a year, we bring the whole community together to take stock, listen, and decide. The Autumn Gathering covers the biggest agenda items of 2025: the new outdoor sports area, the expansion of the digital literacy programme, and the 2026 events calendar.</p>
      <h3>The Shared Meal</h3>
      <p>The shared lunch — a community potluck — begins at 1pm. Everyone is invited to bring a dish to share. Please label your dish for allergy awareness.</p>
      <h3>Childcare</h3>
      <p>Free childcare is available during the town hall session (11am–1pm). Please register children's attendance in advance.</p>
    `,
    schedule: [
      { time: '10:45 AM', item: 'Arrival, tea & coffee' },
      { time: '11:00 AM', item: 'Welcome & year in review' },
      { time: '11:30 AM', item: 'Small-group discussions (3 topics)' },
      { time: '12:15 PM', item: 'Group report-back & open floor' },
      { time: '1:00 PM',  item: 'Shared lunch — community potluck' },
      { time: '2:30 PM',  item: 'Informal networking & 1:1 sessions with board' },
      { time: '3:00 PM',  item: 'Close' },
    ],
    highlights: ['All members welcome', "Shape next year's programmes", 'Free childcare 11am–1pm', 'Community potluck lunch', '3 agenda topics', 'Board available 1:1 after lunch'],
  },
  {
    id: 9,
    title: 'Charity 5K Fun Run',
    category: 'Sports',
    categoryKey: 'sports',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-09-20',
    dateLabel: 'Saturday, 20 September 2025',
    day: '20', month: 'SEP', year: '2025',
    timeStart: '9:00 AM', timeEnd: '12:00 PM',
    location: 'Riverside Park — starting line at the bandstand',
    address: 'Riverside Park, London EC2A 1AB',
    capacity: 250, registered: 88,
    price: '£8 registration + fundraising',
    organiser: 'Sports Committee',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    tags: ['running', 'charity', 'sports', 'fitness', 'fundraising'],
    shortDesc: 'A scenic 5K through Riverside Park raising money for the new outdoor sports area. Walkers very welcome.',
    fullDesc: `
      <p>Lace up and join us for the Communitas Charity 5K — a friendly, inclusive fun run raising money for the new outdoor sports area.</p>
      <p>This is not a race — it's a celebration. Walkers, joggers, runners with buggies, people with dogs on leads — all are welcome. The route is flat, paved, and fully accessible.</p>
      <h3>Fundraising</h3>
      <p>Each participant is encouraged to raise a minimum of £20 in sponsorship, though this is not mandatory. Last year's fun run raised £6,800 for the youth programme.</p>
      <h3>On the Day</h3>
      <p>Registration from 8:30am at the bandstand. T-shirts and race numbers distributed on arrival. A post-run breakfast spread — bacon rolls, fruit, coffee — from 10am at the finish line.</p>
    `,
    schedule: [
      { time: '8:30 AM', item: 'Registration opens at the bandstand' },
      { time: '8:55 AM', item: 'Warm-up with our fitness volunteers' },
      { time: '9:00 AM', item: 'Start — all waves depart together' },
      { time: '9:30 AM', item: 'Estimated first finishers' },
      { time: '10:00 AM', item: 'Post-run breakfast opens' },
      { time: '11:00 AM', item: 'Prize-giving & fundraising update' },
      { time: '12:00 PM', item: 'Close' },
    ],
    highlights: ['Walkers & runners welcome', 'Dogs on leads welcome', 'Flat, paved, accessible route', '£8 registration', 'Post-run breakfast', 'Fundraising for outdoor sports area'],
  },
  {
    id: 10,
    title: "Winter Arts Exhibition: 'Roots & Routes'",
    category: 'Arts',
    categoryKey: 'arts',
    status: 'upcoming',
    featured: false,
    dateISO: '2025-11-15',
    dateLabel: 'Saturday, 15 November 2025',
    day: '15', month: 'NOV', year: '2025',
    timeStart: '6:00 PM', timeEnd: '9:00 PM',
    location: 'Gallery Space, Level 1',
    address: '12 Heritage Lane, London EC1A 4BT',
    capacity: 150, registered: 41,
    price: 'Free',
    organiser: 'Arts & Culture Committee',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
    tags: ['arts', 'exhibition', 'culture', 'winter', 'gallery'],
    shortDesc: 'An evening exhibition of works by community artists exploring themes of heritage, migration, and belonging.',
    fullDesc: `
      <p>The winter arts exhibition returns with its most ambitious theme yet: 'Roots & Routes'. Forty-two works by twenty-three community artists will fill the gallery space across painting, photography, textile, and sculpture.</p>
      <p>The private view evening (open to all) runs from 6pm to 9pm, with wine and soft drinks provided. The exhibition then remains open free of charge until 5 December.</p>
      <h3>The Artists</h3>
      <p>This year's artists range in age from 16 to 74. Every artist is a Communitas member, and every work was created during our arts programmes over the past twelve months.</p>
    `,
    schedule: [
      { time: '5:30 PM', item: 'Gallery opens for early arrivals' },
      { time: '6:00 PM', item: 'Private view officially opens' },
      { time: '6:30 PM', item: 'Welcome address & artist introductions' },
      { time: '7:00 PM', item: 'Open viewing with wine & soft drinks' },
      { time: '8:30 PM', item: 'Artist Q&A (informal, in gallery)' },
      { time: '9:00 PM', item: 'Close' },
    ],
    highlights: ['42 works by 23 artists', 'Free entry', 'Wine & soft drinks', 'Exhibition continues to 5 Dec', 'Artist Q&A on 16 Nov'],
  },
  {
    id: 11,
    title: 'Spring Fitness Bootcamp',
    category: 'Sports',
    categoryKey: 'sports',
    status: 'past',
    featured: false,
    dateISO: '2025-04-05',
    dateLabel: 'Saturday, 5 April 2025',
    day: '05', month: 'APR', year: '2025',
    timeStart: '8:00 AM', timeEnd: '10:00 AM',
    location: 'Sports Ground, East Side',
    address: 'East Road Sports Ground, London E1 6RF',
    capacity: 60, registered: 58,
    price: 'Free',
    organiser: 'Sports Committee',
    image: 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=600&q=80',
    tags: ['fitness', 'sports', 'outdoor', 'bootcamp'],
    shortDesc: 'A high-energy outdoor fitness session to kick off the spring season — open to all fitness levels.',
    fullDesc: `<p>Our spring bootcamp welcomed 58 participants for an energising two-hour session on the sports ground.</p>`,
    schedule: [],
    highlights: ['58 participants', 'All fitness levels', 'Free of charge'],
  },
  {
    id: 12,
    title: 'Eid Community Celebration',
    category: 'Gathering',
    categoryKey: 'gathering',
    status: 'past',
    featured: false,
    dateISO: '2025-03-31',
    dateLabel: 'Monday, 31 March 2025',
    day: '31', month: 'MAR', year: '2025',
    timeStart: '12:00 PM', timeEnd: '5:00 PM',
    location: 'Main Hall & Courtyard, Communitas Centre',
    address: '12 Heritage Lane, London EC1A 4BT',
    capacity: 400, registered: 387,
    price: 'Free',
    organiser: 'Cultural Events Team',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=85',
    thumbImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    tags: ['eid', 'culture', 'celebration', 'food', 'family'],
    shortDesc: 'A joyful community celebration of Eid with food, performances, activities for children, and open doors for all.',
    fullDesc: `<p>387 community members joined us to celebrate Eid in a day of food, music, and togetherness.</p>`,
    schedule: [],
    highlights: ['387 attendees', 'Food from 8 vendors', "Children's activities", 'Live music'],
  },
];

// ── Helper functions ─────────────────────────────────────────────

export function getEventById(id: number): Event | undefined {
  return EVENTS.find(e => e.id === id);
}

export function getUpcomingEvents(): Event[] {
  return EVENTS
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
}

export function getPastEvents(): Event[] {
  return EVENTS
    .filter(e => e.status === 'past')
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
}

export function getFeaturedEvent(): Event | undefined {
  return EVENTS.find(e => e.featured && e.status === 'upcoming');
}

export function getRelatedEvents(id: number, limit = 3): Event[] {
  const current = getEventById(id);
  if (!current) return [];
  return EVENTS
    .filter(e => e.id !== id && e.status === 'upcoming')
    .sort((a, b) => {
      const aMatch = a.categoryKey === current.categoryKey ? 0 : 1;
      const bMatch = b.categoryKey === current.categoryKey ? 0 : 1;
      return aMatch - bMatch || new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
    })
    .slice(0, limit);
}

export function getCapacityPercent(event: Event): number {
  if (!event.capacity || !event.registered) return 0;
  return Math.min(100, Math.round((event.registered / event.capacity) * 100));
}

export function getSpotsLeft(event: Event): number {
  return Math.max(0, event.capacity - event.registered);
}

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function getMonthLabel(dateISO: string): string {
  const d = new Date(dateISO);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}