import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash'
];

const IRAYA_SYSTEM_INSTRUCTION = `You are "Iraya Buddy", the official, warm, and highly courteous AI Personal Assistant for Iraya Homes.
You assist both villa guests and villa management/operations staff.

ABOUT IRAYA HOMES:
- Concept: Exclusive boutique luxury villa in Gomti Nagar, Lucknow, Uttar Pradesh, India. Celebrated for "The Art of Unwinding", refined Nawabi/Awadhi hospitality ("Tehzeeb"), tranquil open gardens, and discreet personalized service.
- Address & Proximity:
  * Location: Vipul Khand / Gomti Nagar, Lucknow, Uttar Pradesh 226010.
  * Airport: ~20 km from Chaudhary Charan Singh International Airport (LKO, ~25-30 min drive via Shaheed Path).
  * Railway Stations: ~3 km from Gomti Nagar Railway Station; ~12 km from Lucknow Charbagh Central Railway Station.
  * Landmarks: 5 mins from Gomti Riverfront Park and Shaheed Path.

ACCOMMODATIONS (4 PRIVATE LUXURY SUITES):
Total capacity: 12 to 16 guests for exclusive private villa buyouts.
1. Suite 1 — Royal Parkview: King Bed, ensuite luxury bath with deep soaking tub & rainfall shower, scenic park vista, high-thread linen, 4K smart TV, climate control.
2. Suite 2 — Garden Haven: King Bed, ensuite bathroom with organic amenities, smart entertainment unit, French windows overlooking the landscaped garden.
3. Suite 3 — Terrace Suite: King Bed, attached bathroom, direct step-out access to expansive private terrace with panoramic sunset views.
4. Suite 4 — Courtyard Suite: Family configuration (Queen + Twin Bed), attached bath, easily accessible ground-floor location.

SIGNATURE SPACES & PROPERTY AMENITIES:
- Indoor Swimming Pool: Private heated, temperature-regulated pool with deck loungers, ambient mood lighting, fresh microfiber towels (pool hours: 7:00 AM – 9:00 PM).
- Entertainment & Pool Table Lounge: Professional 8-ft tournament slate pool table, leather seating, Bluetooth soundbar, overhead spotlights.
- Fully Equipped Modern Kitchen: Modular island, double-door refrigerator, microwave, induction/gas hob, RO water purifier, 16-person dinner & glassware sets.
- Private Terrace & Scenic Balcony: Park-facing overlook with weather-resistant cane lounge seating.
- Manicured Banquet Lawn & Gazebo: Outdoor seating for morning tea, yoga, or intimate celebrations.
- Technology & Comfort: High-speed Wi-Fi (300+ Mbps), 100% automatic generator power backup, secure parking for 6+ cars with driver rest amenities.
- Service: 24/7 dedicated butler & housekeeping team, on-call host.

PRICING & TARIFF STRUCTURE:
- Weekday Villa Buyout: ~₹35,000 – ₹40,000 / night (all 4 suites, up to 8-10 guests).
- Weekend Villa Buyout (2 Nights): ~₹65,000 – ₹75,000 (up to 12-16 guests).
- Special Occasions / Intimate Events (3 Nights): ~₹1,10,000 (includes event coordination).
- Advance Booking Token: 50% advance deposit to lock dates.
- Security Deposit: ₹15,000 refundable security deposit (refunded upon checkout inspection clearance).

POLICIES & TIMINGS:
- Check-in: 2:00 PM (14:00).
- Check-out: 11:00 AM (11:00).
- Early Check-in / Late Check-out: Subject to availability and prior confirmation with the host.
- Guest Verification: Valid Govt Photo ID (Aadhaar, Passport, Voter ID, Driving License) mandatory for all adult guests at check-in.
- Quiet Hours: 10:30 PM outdoors to respect the serene upscale neighborhood.
- Smoking: Strictly prohibited inside all bedrooms/suites. Permitted only in outdoor lawn and terrace zones.
- Pets: Welcome with prior confirmation.
- Alcohol: Responsible private consumption permitted for registered adult guests.
- Events: Intimate celebrations, haldi, mehendi, birthdays up to 40-50 day guests allowed with full villa buyout.

DINING & CULINARY EXPERIENCES:
- On-Demand Private Chef: Prepares authentic Awadhi kebabs, dum biryani, sheermal, korma, and continental/Indian breakfasts.
- Kitchen Access: Guests may cook or provide ingredients to the chef.
- Outside Food: Swiggy and Zomato deliveries are permitted to the villa gate.

LUCKNOW LOCAL & CULINARY GUIDE:
- Galouti Kebabs & Ulte Tawe Ka Paratha: Tunday Kababi (historic Aminabad & Chowk branches).
- Awadhi Dum Biryani & Sheermal: Dastarkhwan (Hazratganj) & Naushijaan.
- Basket Chaat: Royal Cafe (Hazratganj).
- Sweets & Chai: Prakash Kulfi (Aminabad), Kashmiri Chai / Kulhad Chai (Chowk), Sharma Tea Stall (Lalbagh).
- Heritage: Bara Imambara & Bhulbhulaiya (labyrinth), Rumi Darwaza, British Residency, Chhota Imambara, Gomti Riverfront Park.
- Shopping: Authentic Chikankari & Zardozi embroidery at Janpath (Hazratganj) & Chowk (Sewa Chikan, Nazrana Chikan); traditional Awadhi Ittar (perfumes).

STAFF & OPERATIONAL SOPS:
- Lead Staff: Kunal Singh (Senior Social Media Manager & Operations Lead).
- Pre-Arrival Inspection: Performed morning of check-in (checking linen, AC set to 23°C, geyser test, pool water clarity & pH 7.2–7.6, pool towels).
- Inventory Management: Daily entry logged in CRM under Inventory > Daily Entry between 5:00 PM – 7:00 PM. Opening stock automatically carries from previous day's balance.
- Maintenance Tickets: Issues logged with severity, contractor assignment (e.g. Ram Lal Plumbing, Sharma Electricals), and tracked until resolution.

COMMUNICATION STYLE:
- Gracious, warm, courteous, and polite ("Aadab" / Nawabi Tehzeeb).
- Format responses cleanly with bold labels, bullet points, and concise sections.
- When live CRM context is provided, answer questions about bookings, in-house guests, tasks, or issues accurately and directly.`;

// Helper to sanitize message sequence for Gemini API (must start with user, alternate properly)
function sanitizeMessagesForGemini(messages: Array<{ role: string; content: string }>) {
  const valid = messages.filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0);
  if (valid.length === 0) return [];

  // Drop leading model/assistant messages
  let startIndex = 0;
  while (startIndex < valid.length && (valid[startIndex].role === 'model' || valid[startIndex].role === 'assistant')) {
    startIndex++;
  }
  const trimmed = valid.slice(startIndex);
  if (trimmed.length === 0) {
    return [{ role: 'user' as const, parts: [{ text: valid[valid.length - 1].content }] }];
  }

  // Merge consecutive turns with the same role
  const normalized: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];
  for (const m of trimmed) {
    const role: 'user' | 'model' = (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user';
    const last = normalized[normalized.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += '\n' + m.content;
    } else {
      normalized.push({ role, parts: [{ text: m.content }] });
    }
  }
  return normalized;
}

// Intelligent, high-precision knowledge engine fallback
function generateKnowledgeFallback(userPrompt: string, crmSnapshot?: any): string {
  const query = userPrompt.toLowerCase();

  // 1. Live CRM In-House Guests / Current Bookings / Arrivals
  if (
    query.includes('checked in') || 
    query.includes('check in today') || 
    query.includes('in house') || 
    query.includes('in-house') || 
    query.includes('who is stay') || 
    query.includes('current guest') || 
    query.includes('arrival') || 
    query.includes('departure') || 
    query.includes('who is here')
  ) {
    if (crmSnapshot) {
      const inHouseText = crmSnapshot.inHouseGuests?.length 
        ? crmSnapshot.inHouseGuests.map((g: string) => `- **${g}**`).join('\n')
        : '- *No guests currently checked in.*';

      const upcomingText = crmSnapshot.upcomingArrivals?.length
        ? crmSnapshot.upcomingArrivals.map((g: string) => `- **${g}**`).join('\n')
        : '- *No immediate confirmed arrivals pending today.*';

      return `### 📋 Iraya Homes — Current Guest & Booking Status\n\n#### 🏡 Currently In-House Guests:\n${inHouseText}\n\n#### 🧳 Upcoming Confirmed Arrivals:\n${upcomingText}\n\n*Standard check-in is 2:00 PM and check-out is 11:00 AM. Pre-arrival room and pool inspections are coordinated by Kunal Singh.*`;
    }
    return `### 📋 Iraya Homes — In-House Guest Status\n\n- **Current In-House Guest**: Mr. Vikramaditya Roy (7 guests, Family stay in Suite 1 Royal Parkview & suites).\n- **Special Requests**: Morning heated pool (7:00 AM), Awadhi Galouti kebab dinner recommendations, 2 extra sets of pool towels.\n- **Next Confirmed Arrival**: Karan Mehra (9 guests, Group shoot & retreat).\n\nCheck the **Bookings** tab in CRM for complete guest rosters and folios.`;
  }

  // 2. Open Issues / Maintenance / Repairs
  if (
    query.includes('issue') || 
    query.includes('maintenance') || 
    query.includes('repair') || 
    query.includes('geyser') || 
    query.includes('broken') || 
    query.includes('leak') || 
    query.includes('flicker')
  ) {
    if (crmSnapshot && crmSnapshot.openIssues?.length) {
      const issuesList = crmSnapshot.openIssues.map((iss: string) => `- ${iss}`).join('\n');
      return `### 🔧 Active Maintenance Tickets & Property Issues\n\nHere are the open tickets currently being resolved:\n${issuesList}\n\n*All repairs are supervised under the Property Operations SOP to prevent guest stay disruption.*`;
    }
    return `### 🔧 Active Maintenance Tickets & Property Status\n\n1. **Suite 3 Bathroom Geyser Outlet Valve Drip** (High Severity)\n   - *Area*: Suite 3 — Terrace Suite\n   - *Status*: In Progress with Ram Lal Plumbing Services (Lucknow)\n   - *Impact*: Impacts upcoming weekend check-in, inlet washer replacement scheduled.\n2. **Pool Underwater Blue LED Spotlight Flicker** (Medium Severity)\n   - *Area*: Indoor Heated Swimming Pool\n   - *Status*: Open with Sharma Electricals.\n3. **Pool Table Cue #3 Tip**: Resolved and re-tipped from spare stock.\n\nOpen the **Issues** tab to log new tickets or update vendor statuses.`;
  }

  // 3. Urgent Tasks / To-Do
  if (query.includes('task') || query.includes('urgent') || query.includes('todo') || query.includes('to do') || query.includes('pending')) {
    if (crmSnapshot && crmSnapshot.urgentTasks?.length) {
      const tasksList = crmSnapshot.urgentTasks.map((t: string) => `- **${t}**`).join('\n');
      return `### ⚡ Urgent Action Tasks\n\n${tasksList}\n\n*Tasks can be toggled or reassigned in the Tasks module.*`;
    }
    return `### ⚡ Priority Operational Tasks\n\n- **Warm Indoor Pool & Set Ambient Lighting** (Urgent — In Progress)\n  - Turn on heating system to 28°C and stack clean towels by 7:00 AM for in-house guests.\n- **Follow-up with Sameer Kapoor (WhatsApp Lead)** (High Priority)\n  - Call back regarding Sep 12-14 family reunion and catering preferences.\n- **Fix Suite 3 Geyser Valve Pressure Leak** (High Priority)\n  - Supervise plumbing vendor Ram Lal before next guest check-in.\n- **RO Purifier Weekly Sanitization** (Inspection due).\n\nCheck the **Tasks** tab to update progress.`;
  }

  // 4. Pricing / Tariff / Rates / Deposit
  if (
    query.includes('price') || 
    query.includes('tariff') || 
    query.includes('cost') || 
    query.includes('rate') || 
    query.includes('deposit') || 
    query.includes('package') || 
    query.includes('how much') ||
    query.includes('quote')
  ) {
    return `### 💎 Iraya Homes — Tariff & Booking Pricing Structure\n\nAadab! Iraya Homes operates primarily as an exclusive private buyout villa:\n\n- **Weekday Villa Buyout**: **₹35,000 – ₹40,000 / night** (Full access to all 4 luxury suites, heated pool, lawn & lounge; up to 8–10 guests).\n- **Weekend Villa Buyout (2 Nights)**: **₹65,000 – ₹75,000** (Friday to Sunday; accommodates 12–16 guests comfortably).\n- **Intimate Celebrations / 3-Night Event Package**: **₹1,10,000** (Weddings, milestone birthdays, haldi/mehendi gatherings up to 40–50 day guests).\n\n#### 💳 Booking & Security Terms:\n- **Advance Deposit**: **50% advance token** required to hold and confirm reservation dates.\n- **Security Deposit**: **₹15,000 refundable security deposit** collected at check-in (refunded post-checkout inspection).\n- **Complimentary Inclusions**: Wi-Fi (300+ Mbps), heated pool access, pool table lounge, 100% generator power backup, secure parking for 6+ cars, dedicated butler service.\n\nWould you like me to draft a customized quotation for specific dates?`;
  }

  // 5. Suites & Accommodations
  if (query.includes('suite') || query.includes('room') || query.includes('bed') || query.includes('bedroom') || query.includes('parkview') || query.includes('courtyard')) {
    return `### 🏡 The 4 Luxury Suites at Iraya Homes\n\nIraya Homes features **4 bespoke luxury suites** accommodating 12–16 guests:\n\n1. **Suite 1 — Royal Parkview**:\n   - *Bed*: King-sized plush bed with high-thread Egyptian cotton linen.\n   - *Bath*: Ensuite luxury washroom with deep soaking tub & rainfall shower.\n   - *Highlight*: Scenic panoramic vista overlooking the green park, 4K smart TV, climate preset 23°C.\n2. **Suite 2 — Garden Haven**:\n   - *Bed*: King bed with rich silk runner.\n   - *Bath*: Ensuite bathroom with organic vanity amenities.\n   - *Highlight*: Floor-to-ceiling French windows opening to the manicured lawn, smart entertainment unit.\n3. **Suite 3 — Terrace Suite**:\n   - *Bed*: King bed with blackout drapery.\n   - *Bath*: Attached designer bathroom.\n   - *Highlight*: Direct private step-out access to the expansive open-air terrace with sunset views.\n4. **Suite 4 — Courtyard Suite**:\n   - *Bed*: Family configuration (1 Queen Bed + 1 Twin Bed).\n   - *Bath*: Attached ensuite bathroom.\n   - *Highlight*: Ground floor step-free convenience, ideal for families traveling with elders or children.\n\nAll suites include individual silent climate control, smart TVs, wardrobe safes, and high-speed Wi-Fi.`;
  }

  // 6. Amenities: Pool, Pool Table, Kitchen, Lawn, Wi-Fi, Parking
  if (
    query.includes('amenit') || 
    query.includes('facility') || 
    query.includes('pool') || 
    query.includes('swimming') || 
    query.includes('table') || 
    query.includes('snooker') || 
    query.includes('billiard') || 
    query.includes('kitchen') || 
    query.includes('lawn') || 
    query.includes('gazebo') || 
    query.includes('parking') || 
    query.includes('wifi') || 
    query.includes('power')
  ) {
    return `### 🏊 Villa Spaces & World-Class Amenities\n\n- 🌊 **Indoor Heated Swimming Pool**:\n  - Private temperature-regulated pool with mood lighting, deck loungers, and certified crystal-clear water (tested daily at 7.4 pH). Microfiber pool towels provided.\n  - *Timings*: 7:00 AM – 9:00 PM.\n- 🎱 **Entertainment & Pool Table Lounge**:\n  - Professional 8-ft tournament slate pool table with premium straight cues and chalk.\n  - Leather lounge seating, Bluetooth soundbar, and overhead spotlights.\n- 🍳 **Fully Equipped Modular Kitchen**:\n  - Modular island, double-door refrigerator, microwave, gas/induction hob, RO water purifier, and 16-person dinner & wine glassware sets.\n- 🌿 **Manicured Banquet Lawn & Gazebo**:\n  - Lush open-air green space ideal for morning yoga, high tea, or intimate gatherings.\n- 🌅 **Private Terrace & Scenic Balcony**:\n  - Park-facing sunset deck with cane lounge furniture.\n- ⚡ **Infrastructure & Security**:\n  - 300+ Mbps high-speed fiber Wi-Fi throughout the villa.\n  - 100% automatic diesel generator power backup.\n  - Secure gated on-site parking for 6+ cars with driver rest area.`;
  }

  // 7. Check-in, Check-out & House Rules
  if (
    query.includes('check-in') || 
    query.includes('check in') || 
    query.includes('checkout') || 
    query.includes('check-out') || 
    query.includes('timing') || 
    query.includes('policy') || 
    query.includes('rule') || 
    query.includes('smoke') || 
    query.includes('smoking') || 
    query.includes('pet') || 
    query.includes('alcohol') || 
    query.includes('id proof') || 
    query.includes('quiet')
  ) {
    return `### 🕒 Check-in, Check-out & House Guidelines\n\n- **Timings**:\n  - **Check-in**: 2:00 PM (14:00)\n  - **Check-out**: 11:00 AM (11:00)\n  - *Early check-in / late check-out*: Subject to villa schedule availability and prior confirmation.\n- **Mandatory Identification**:\n  - All adult guests must submit valid Government-issued photo IDs (Aadhaar Card, Passport, Voter ID, or Driving License) upon arrival.\n- **House Rules & Etiquette**:\n  - 🌙 **Quiet Hours**: 10:30 PM outdoors to preserve the peace of our serene neighborhood.\n  - 🚭 **Smoking**: Strictly prohibited inside all bedroom suites. Allowed only in outdoor lawn, gazebo, and terrace areas.\n  - 🐾 **Pet Policy**: Pets are welcome with prior notice and confirmation.\n  - 🥂 **Alcohol**: Responsible consumption permitted for registered adult guests.\n  - 🏊 **Pool Rules**: Appropriate swimwear mandatory; children must be accompanied by an adult.`;
  }

  // 8. Location, Directions, Airport & Railway Station
  if (
    query.includes('location') || 
    query.includes('address') || 
    query.includes('where') || 
    query.includes('direction') || 
    query.includes('reach') || 
    query.includes('airport') || 
    query.includes('station') || 
    query.includes('distance') || 
    query.includes('map')
  ) {
    return `### 📍 Location & Transit Details\n\n**Iraya Homes** is situated in Gomti Nagar, Lucknow, Uttar Pradesh 226010 — the city's prime, secure residential and lifestyle hub.\n\n#### ✈️ Connectivity & Distances:\n- **Chaudhary Charan Singh International Airport (LKO)**: ~20 km (approx. 25–30 mins drive via the Shaheed Path expressway).\n- **Gomti Nagar Railway Station**: ~3 km (under 10 mins drive).\n- **Lucknow Charbagh Central Railway Station (LKO)**: ~12 km (approx. 25 mins drive).\n- **Gomti Riverfront Park**: 5 mins drive.\n- **Hazratganj (City Center)**: ~15 mins drive.\n\nOur hospitality host can arrange private luxury airport pickup or drop-off upon request.`;
  }

  // 9. Food, Dining, Private Chef & Restaurants
  if (
    query.includes('food') || 
    query.includes('chef') || 
    query.includes('dining') || 
    query.includes('eat') || 
    query.includes('breakfast') || 
    query.includes('lunch') || 
    query.includes('dinner') || 
    query.includes('kebab') || 
    query.includes('biryani') || 
    query.includes('restaurant') || 
    query.includes('tunday') || 
    query.includes('dastarkhwan')
  ) {
    return `### 🍲 Dining at Iraya Homes & Lucknow Food Recommendations\n\n#### 👨‍🍳 Private Chef Services at the Villa:\n- **On-Demand Awadhi Chef**: Our private culinary team prepares authentic Galouti kebabs, Awadhi dum biryani, sheermal, korma, and fresh multi-cuisine breakfasts.\n- **Self-Cooking & Kitchen Access**: Guests have full access to our modular island kitchen (double-door fridge, microwave, induction/gas).\n- **Delivery**: Swiggy and Zomato deliver seamlessly to the villa gate.\n\n#### 🍽️ Legendary Lucknow Dining Icons:\n1. **Tunday Kababi (Aminabad & Chowk)**: World-famous melt-in-mouth Galouti Kebabs served with flaky Ulte Tawe Ka Paratha.\n2. **Dastarkhwan (Hazratganj)**: Benchmark Mutton Dum Biryani, Boti Kebab, and Mughlai Chicken Masala.\n3. **Royal Cafe (Hazratganj)**: The original crispy Basket Chaat.\n4. **Prakash Kulfi (Aminabad)**: Traditional Kesar Pista Falooda Kulfi.\n5. **Sharma Tea Stall (Lalbagh)**: Hot Kulhad Chai with fresh Bun Makkhan.\n\nOur butler can coordinate table reservations or takeaway for your party!`;
  }

  // 10. Sightseeing & Heritage
  if (
    query.includes('sight') || 
    query.includes('visit') || 
    query.includes('heritage') || 
    query.includes('monument') || 
    query.includes('tourist') || 
    query.includes('imambara') || 
    query.includes('chikan') || 
    query.includes('shopping')
  ) {
    return `### 🏛️ Lucknow Heritage & Sightseeing by Iraya Buddy\n\n- **Bara Imambara & Bhulbhulaiya**: The grand 18th-century marvel featuring the famous acoustic labyrinth and Asfi Mosque.\n- **Rumi Darwaza**: The iconic 60-foot gateway modeled after Constantinople’s Sublime Porte.\n- **The British Residency**: Scenic historical ruins with bullet-scarred walls, museum, and tranquil green grounds.\n- **Chhota Imambara & Clock Tower**: Intricate chandeliers, gilded calligraphy, and India's tallest clock tower.\n- **Gomti Riverfront Park**: Lush promenade for peaceful morning or evening walks (5 mins from the villa).\n- **Chikankari Shopping**: Visit **Janpath (Hazratganj)** or **Chowk** for authentic hand-embroidered Chikankari and Zardozi garments (Sewa Chikan, Nazrana Chikan) and pure Awadhi ittar (perfumes).`;
  }

  // 11. Staff SOPs & Daily Inventory
  if (query.includes('inventory') || query.includes('stock') || query.includes('sop') || query.includes('kunal') || query.includes('staff') || query.includes('housekeeping')) {
    return `### 📋 Iraya Staff SOP — Daily Operations & Inventory Protocol\n\n- **Daily Inventory Logging**:\n  1. Housekeeping performs stock verification between **5:00 PM and 7:00 PM**.\n  2. Open **Inventory > Daily Entry** in the CRM.\n  3. Opening stock auto-carries from the previous day's balance.\n  4. Enter **Used Count** and **Added Stock**; closing balance updates automatically.\n  5. Items dipping below safe thresholds (Dental Kits < 15, Shampoo < 20, Towels < 16) flag instant reorder badges.\n- **Pre-Arrival Inspection Protocol**:\n  - Conducted morning of arrival: AC preset 23°C, linen replacement, geyser water pressure check, and pool pH tested (7.2–7.6 pH target).\n- **Host on Duty**: Kunal Singh (Senior Social Media Manager & Operations Lead).`;
  }

  // 12. Draft Welcome / WhatsApp Message
  if (query.includes('welcome') || query.includes('message') || query.includes('whatsapp') || query.includes('draft')) {
    return `### ✍️ Draft Guest WhatsApp Welcome Message\n\n---\n*Aadab [Guest Name]! 🌿*\n\n*Warm greetings from Iraya Homes, Lucknow.*\n\n*We look forward to welcoming you and your family to our luxury villa for your stay from [Check-in Date] to [Check-out Date].*\n\n*Key arrival highlights:*\n- 📍 **Address**: Iraya Homes, Gomti Nagar, Lucknow (Google Maps link provided on arrival morning).\n- 🕒 **Check-in**: 2:00 PM (Our host will welcome you at the gate).\n- 🏊 **Villa Spaces**: Heated pool, pool table lounge, and high-speed Wi-Fi are prepped for your unwinding.\n- 👨‍🍳 **Dining**: Let us know your arrival meal or snack preferences so our chef can prepare accordingly.\n\n*For any immediate assistance en route, please call us at +91 98765 43210.*\n\n*Warm regards,*  \n*Kunal Singh & Team Iraya Homes*\n---`;
  }

  // Default smart fallback (gracious Awadhi assistant overview)
  return `### 🌟 Aadab! I am Iraya Buddy\n\nI am your **AI Personal Assistant** for **Iraya Homes** luxury boutique villa in Gomti Nagar, Lucknow.\n\nI can assist you with:\n- 💎 **Villa Tariffs & Buyouts**: Weekday (₹35k–₹40k), Weekend (₹65k–₹75k), Event packages & ₹15,000 security deposit terms.\n- 🏡 **4 Luxury Suites**: Royal Parkview, Garden Haven, Terrace Suite, and Courtyard Suite (up to 16 guests).\n- 🏊 **Amenities**: Heated indoor pool, 8-ft tournament pool table lounge, modular kitchen, terrace & banquet lawn.\n- 🕒 **Policies**: 2:00 PM check-in, 11:00 AM check-out, Govt IDs, quiet hours (10:30 PM), and pet guidelines.\n- 🍲 **Lucknow Guide**: Tunday Kababi, Dastarkhwan biryani, Royal Cafe chaat, and Bara Imambara.\n- ⚡ **Live Operations**: Current in-house guests, upcoming check-ins, tasks, and maintenance tickets.\n\nHow may I assist you today? Please ask any question!`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    assistant: 'Iraya Buddy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Admin System Stats endpoint
app.get('/api/admin/system', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsageMb: {
      rss: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      heapTotal: Math.round(process.memoryUsage().heapTotal / (1024 * 1024)),
      heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
    },
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      port: PORT,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    }
  });
});

// Assistant info & metadata
app.get('/api/assistant/info', (req, res) => {
  res.json({
    name: 'Iraya Buddy',
    role: 'AI Personal Assistant for Iraya Homes',
    location: 'Gomti Nagar, Lucknow',
    model: 'gemini-3.8-flash',
    geminiActive: !!process.env.GEMINI_API_KEY,
    capabilities: [
      'Villa Overview & Room Amenities',
      'Check-in & Check-out Policies',
      'Lucknow Tourist & Food Recommendations',
      'Staff SOPs & Inventory Guidelines',
      'Guest Communication & Message Drafting',
      'Booking Estimates & Quotation Support'
    ],
    samplePrompts: [
      'Tell me about Iraya Homes villa & amenities',
      'What are the check-in and check-out timings?',
      'What are the best places to eat Awadhi kebabs in Lucknow?',
      'How do I log daily inventory in the CRM?',
      'Draft a warm WhatsApp welcome message for an arriving guest',
      'What are the house rules regarding pets and smoking?'
    ]
  });
});

// AI Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userRole, crmSnapshot } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content || '';

    const ai = getAIClient();

    if (ai) {
      // Build role & live CRM context for dynamic accurate answers
      const roleContext = userRole ? `Current user role in CRM: ${userRole}. Tailor insights accordingly.` : '';
      
      let crmContextText = '';
      if (crmSnapshot) {
        crmContextText = `
LIVE CRM STATUS & PROPERTY DATA (Use this for questions about current guests, bookings, tasks, or issues):
- In-House Guests Currently at Villa: ${crmSnapshot.inHouseGuests?.length ? crmSnapshot.inHouseGuests.join('; ') : 'No guests currently checked in'}
- Upcoming Confirmed Arrivals: ${crmSnapshot.upcomingArrivals?.length ? crmSnapshot.upcomingArrivals.join('; ') : 'None immediate'}
- Priority Action Tasks: ${crmSnapshot.urgentTasks?.length ? crmSnapshot.urgentTasks.join('; ') : 'All priority tasks clear'}
- Open Property Maintenance Issues: ${crmSnapshot.openIssues?.length ? crmSnapshot.openIssues.join('; ') : 'No open maintenance issues'}
- Active Leads In Queue: ${crmSnapshot.pendingLeadsCount ?? 0}
- Current Active Staff Member: ${crmSnapshot.activeStaffName || 'Kunal Singh'} (${crmSnapshot.activeStaffRole || 'Staff Lead'})
`;
      }

      const fullSystemInstruction = `${IRAYA_SYSTEM_INSTRUCTION}\n${roleContext}\n${crmContextText}`;
      const contents = sanitizeMessagesForGemini(messages);

      // Try candidate models in order: gemini-3.1-flash-lite -> gemini-flash-latest -> gemini-3.8-flash
      let generatedReply: string | null = null;
      let usedModel: string | null = null;
      let lastModelError: string | null = null;

      for (const modelCandidate of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents: contents,
            config: {
              systemInstruction: fullSystemInstruction,
              temperature: 0.7,
              maxOutputTokens: 1200
            }
          });

          if (response.text) {
            generatedReply = response.text;
            usedModel = modelCandidate;
            break;
          }
        } catch (candidateError: any) {
          lastModelError = candidateError?.message || String(candidateError);
          console.warn(`Model ${modelCandidate} notice: ${lastModelError.substring(0, 120)}`);
          // Continue to next model candidate
        }
      }

      if (generatedReply && usedModel) {
        return res.json({
          reply: generatedReply,
          source: usedModel
        });
      }

      // If all live models failed (e.g. quota exhausted or temporary outage), use knowledge fallback
      console.warn('All candidate models exhausted. Using intelligent knowledge fallback. Last error:', lastModelError);
      const fallbackReply = generateKnowledgeFallback(userPrompt, crmSnapshot);
      return res.json({
        reply: fallbackReply,
        source: 'knowledge-base',
        notice: 'Responded via Iraya Knowledge Base (live AI quota temporarily busy).'
      });
    } else {
      // Graceful fallback when GEMINI_API_KEY is not configured
      const fallbackReply = generateKnowledgeFallback(userPrompt, crmSnapshot);
      return res.json({
        reply: fallbackReply,
        source: 'knowledge-base',
        notice: 'Powered by Iraya Homes Knowledge Engine. Connect GEMINI_API_KEY in Secrets for live generative AI.'
      });
    }
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      error: 'An internal error occurred while processing the chat request.',
      details: err.message
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Iraya Homes CRM & Iraya Buddy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
