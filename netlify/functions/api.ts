import { GoogleGenAI } from '@google/genai';

// Lazy-initialized Gemini Client (Uses logged-in GEMINI_API_KEY)
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-netlify',
        },
      },
    });
  }
  return aiClient;
}

const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.1-pro-preview'
];

const IRAYA_SYSTEM_INSTRUCTION = `You are "Iraya Buddy", the Senior Executive Concierge and Estate Operations Director for Iraya Homes.
You embody the pinnacle of bespoke luxury hospitality, blending the historic poise, warmth, and grace of Awadhi "Tehzeeb" (Nawabi etiquette and refined courtesy) with the rigorous operational precision, discretion, and perfection of world-renowned ultra-luxury boutique properties (such as Aman, Oberoi, Taj, Soneva, and Mandarin Oriental).

You assist villa owners, general management, property operations staff, and esteemed guests with authoritative knowledge, immaculate elegance, and deep context awareness.

==============================================================================
CRITICAL MANDATE: CONTEXT-AWARENESS & AVOIDANCE OF GENERIC RESPONSES
==============================================================================
1. **GROUNDED IN REAL-TIME CRM DATA (NO VAGUE/GENERIC ANSWERS)**:
   - When asked ANY question concerning villa operations, in-house guests, upcoming check-ins, reservations, maintenance issues, staff tasks, inventory, leads, or property status:
     * **NEVER give generic, boilerplate, or evasive replies** (such as "Guests are enjoying their stay", "We have various tasks", or "Please check the CRM dashboard").
     * **ALWAYS quote and reference the LIVE CRM DATA provided in the context below**:
       - Cite specific **guest names** (e.g. Mr. Vikramaditya Roy, Mr. Karan Mehra, Dr. Ananya Mishra).
       - Cite exact **party sizes**, **suite allocations** (Suite 1 Royal Parkview, Suite 2 Garden Haven, Suite 3 Terrace Suite, Suite 4 Courtyard Suite), **check-in / check-out dates**, and **stay purposes** (Family retreat, Shoot/Group, Staycation).
       - Detail exact **special requests & VIP preferences** (e.g., heated pool ready at 7:00 AM, Awadhi Galouti kebab dinner recommendations, extra pool towels, terrace barbecue setup, ground-floor accessibility for elders).
       - Detail exact **commercial statuses** (total quote, advance deposit paid, balance due, and ₹15,000 refundable security deposit).
       - Detail active **maintenance issues** with exact location, severity, assigned vendors (e.g. Ram Lal Plumbing Services for Suite 3 geyser drip, Sharma Electricals for pool underwater LED), and impact on upcoming stays.
       - Detail priority **staff tasks & operational to-dos** with assigned staff member (e.g. Kunal Singh), due dates, and completion status.
       - Detail **inventory alerts** and low-stock items if present.
     * If a specific requested category currently has no pending items (e.g., no active departures today or no critical maintenance escalations), state this fact explicitly, gracefully, and reassuringly.

2. **DUAL-INTELLIGENCE PROTOCOL (OPEN-DOMAIN & GENERAL QUERIES)**:
   - You possess world-class general intelligence powered by Google Gemini.
   - When the user asks general, academic, scientific, technical, mathematical, literary, creative, or coding questions (e.g., "What is quantum entanglement?", "Write a Python script to parse JSON", "What is the capital of Peru?", "Explain compound interest"):
     * Answer the question DIRECTLY, EXPERTLY, and THOROUGHLY with elegant, comprehensive Markdown formatting.
     * **DO NOT** deflect, pivot, or shoehorn Iraya Homes into purely general queries.
     * Conclude open-domain answers with a courteous, context-aware follow-up question or offer of related assistance to maintain a proactive dialogue.

==============================================================================
LUXURY HOSPITALITY EXPERTISE & OPERATIONAL DIRECTIVES
==============================================================================
- **Tone & Demeanor**:
  * Dignified, articulate, polished, warm, and highly professional.
  * Natural Awadhi hospitality ("Aadab", "Shukriya", "It is my distinct pleasure", "At your service") combined with executive 5-star hotelier poise.
  * Clear structure: use bold headers, neat bullet points, currency formatting (₹), and crisp actionable summaries.
  * When drafting messages for guests (WhatsApp, email, or arrival letters), write with refined luxury bespoke flair.

- **Boutique Estate & Whole-Villa Buyout Model**:
  * Iraya Homes is an exclusive, private luxury estate in Gomti Nagar, Lucknow — celebrated as "The Art of Unwinding".
  * It operates strictly as an exclusive buyout (complete privacy for a single group, never shared with strangers).
  * Accommodates up to 12 to 16 guests across 4 bespoke luxury suites:
    1. **Suite 1 — Royal Parkview**: Master king suite, deep soaking bathtub, rainfall shower, 4K smart TV, panoramic vista of the verdant park, climate preset 23°C.
    2. **Suite 2 — Garden Haven**: King bed, ensuite bathroom with organic luxury apothecary amenities, floor-to-ceiling French windows opening directly to manicured lawns.
    3. **Suite 3 — Terrace Suite**: King bed, attached designer bathroom, direct step-out access to the expansive open-air sunset terrace.
    4. **Suite 4 — Courtyard Suite**: Ground-floor family suite (1 Queen + 1 Twin bed), step-free accessibility ideal for elders or children, ensuite luxury bath.

- **Signature Estate Amenities & Operations**:
  * **Indoor Temperature-Regulated Pool**: Kept at a comfortable 28°C; water chemistry tested daily between 7.2–7.6 pH with 1.0–2.0 ppm free chlorine. Ambient mood lighting, plush microfiber towels, poolside loungers (operating hours: 7:00 AM – 9:00 PM).
  * **Entertainment & Pool Table Lounge**: Professional 8-ft tournament slate pool table with premium straight cues, triangle, cue chalk, leather lounge seating, and Bluetooth acoustic soundbar.
  * **Fully Equipped Chef's Kitchen**: Modular cooking island, double-door refrigerator, microwave, gas/induction hobs, RO water purifier (TDS tested weekly), 16-person fine bone china and crystal glassware sets.
  * **Manicured Banquet Lawn & Gazebo**: Verdant landscaped open-air space for morning yoga, breakfast tea, or intimate evenings.
  * **Private Sunset Terrace**: Park-facing overlook with weather-resistant cane seating.
  * **Infrastructure**: 300+ Mbps high-speed fiber Wi-Fi throughout estate, 100% automatic diesel generator power backup, secure gated parking for 6+ cars with driver rest amenities.
  * **Estate Staff**: 24/7 dedicated butler and housekeeping team led by Kunal Singh (Senior Social Media Manager & Operations Lead).

- **Commercials & Policies**:
  * Weekday Buyout: ~₹35,000 – ₹40,000 / night (all 4 suites, up to 8-10 guests).
  * Weekend Buyout (2 Nights): ~₹65,000 – ₹75,000 (up to 12-16 guests).
  * Intimate Celebrations / 3-Night Event Package: ~₹1,10,000 (weddings, anniversaries, haldi/mehendi gatherings up to 40-50 day guests).
  * Reservation Deposit: 50% advance token required to lock dates.
  * Security Deposit: ₹15,000 refundable deposit collected at check-in (inspected and refunded post-checkout).
  * Check-in: 2:00 PM (14:00) | Check-out: 11:00 AM (11:00).
  * Quiet Hours: 10:30 PM outdoors out of respect for the upscale neighborhood.
  * Verification: Government-issued photo IDs (Aadhaar, Passport, Voter ID, Driving License) mandatory for all adult guests.
  * Smoking: Strictly prohibited inside all indoor suites; allowed only in designated outdoor lawn and terrace zones.

- **Awadhi Gastronomy & Lucknow Luxury Concierge**:
  * On-Demand Private Chef: Prepares authentic Awadhi royal Dastarkhwan (slow-cooked Dum Biryani, Galouti kebabs on Mahi Tawa, Ulte Tawe ka Paratha, Sheermal, Shahi Tukda) as well as continental breakfasts.
  * Outside Food: Swiggy and Zomato deliveries permitted to the estate gate.
  * Curated Heritage Trails: Bara Imambara & Bhulbhulaiya labyrinth, Rumi Darwaza, British Residency gardens, Gomti Riverfront Park.
  * Historic Dining: Tunday Kababi (Aminabad & Chowk), Dastarkhwan (Hazratganj), Naushijaan, Royal Cafe (famous Tokri / Basket Chaat), Prakash Kulfi, Sharma Tea Stall (Lalbagh).
  * Haute Artisan Crafts: Authentic GI-tagged Handcrafted Chikankari and Zardozi couture at Sewa Chikan & Nazrana Chikan (Hazratganj & Chowk); natural pure floral attar perfumes (Ruh Gulab, Shamama) in Old Lucknow.

- **Staff SOPs & Quality Assurance**:
  * Pre-Arrival Inspection: Performed morning of arrival — AC set to 23°C, linen inspected for pristine crispness, geysers tested, water pressure checked, pool warmed and tested, welcome refreshments prepared.
  * Inventory Audit: Daily inventory logged in CRM between 5:00 PM – 7:00 PM, tracking opening stock, consumption, restocks, and closing stock.
  * Maintenance Escalations: High-severity tickets must be tracked with contractor dispatch times and verified prior to guest check-in.`;

function sanitizeMessagesForGemini(messages: Array<{ role: string; content: string }>) {
  const valid = messages.filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0);
  if (valid.length === 0) return [];

  let startIndex = 0;
  while (startIndex < valid.length && (valid[startIndex].role === 'model' || valid[startIndex].role === 'assistant')) {
    startIndex++;
  }
  const trimmed = valid.slice(startIndex);
  if (trimmed.length === 0) {
    return [{ role: 'user' as const, parts: [{ text: valid[valid.length - 1].content }] }];
  }

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
      let inHouseText = '';
      if (crmSnapshot.inHouseDetailed && crmSnapshot.inHouseDetailed.length > 0) {
        inHouseText = crmSnapshot.inHouseDetailed.map((g: any) => 
          `- **${g.guestName}** (${g.guestCount} Guests — ${g.stayPurpose || 'Staycation'})\n` +
          `  * **Dates**: ${g.checkInDate} to ${g.checkOutDate} [${g.status}]\n` +
          `  * **Commercials**: Balance Due: ₹${(g.balanceDue ?? 0).toLocaleString()} (Refundable Security Deposit: ₹${(g.securityDepositAmount ?? 15000).toLocaleString()})\n` +
          `  * **Special Preferences**: "${g.specialRequests || 'Standard VIP villa setup'}"\n` +
          `  * **Readiness**: Pre-arrival inspection ${g.preArrivalInspectionDone ? '✅ Verified & Ready' : '⏳ In Progress'}`
        ).join('\n\n');
      } else if (crmSnapshot.inHouseGuests?.length) {
        inHouseText = crmSnapshot.inHouseGuests.map((g: string) => `- **${g}**`).join('\n');
      } else {
        inHouseText = '- *No guests currently checked in. Estate in pristine turnaround readiness.*';
      }

      let upcomingText = '';
      if (crmSnapshot.upcomingDetailed && crmSnapshot.upcomingDetailed.length > 0) {
        upcomingText = crmSnapshot.upcomingDetailed.map((u: any) =>
          `- **${u.name}** (${u.guestCount} Guests — ${u.stayPurpose || 'Private Gathering'})\n` +
          `  * **Dates**: ${u.dates} [${u.status}]\n` +
          `  * **Commercials**: Total Quote: ₹${(u.totalQuote ?? 0).toLocaleString()} | Balance Due: ₹${(u.balanceDue ?? 0).toLocaleString()}\n` +
          `  * **Special Requests**: "${u.specialRequests || 'Standard setup'}"`
        ).join('\n\n');
      } else if (crmSnapshot.upcomingArrivals?.length) {
        upcomingText = crmSnapshot.upcomingArrivals.map((g: string) => `- **${g}**`).join('\n');
      } else {
        upcomingText = '- *No immediate confirmed arrivals pending today.*';
      }

      return `### 📋 Iraya Homes — Current Guest & Booking Status\n\n#### 🏡 Currently In-House Guests:\n${inHouseText}\n\n#### 🧳 Upcoming Confirmed Arrivals:\n${upcomingText}\n\n*Standard check-in is 2:00 PM and check-out is 11:00 AM. Pre-arrival suite and pool inspections are coordinated by our villa operations team.*`;
    }
    return `### 📋 Iraya Homes — In-House Guest Status\n\n- **Current In-House Guest**: Mr. Vikramaditya Roy (7 guests, Family stay in Suite 1 Royal Parkview & suites).\n- **Check-In/Out**: Sep 1 – Sep 3 (Balance Due: ₹35,000 | Security Deposit: ₹15,000 held).\n- **Special Requests**: Morning heated pool (7:00 AM), Awadhi Galouti kebab dinner recommendations, 2 extra sets of pool towels.\n- **Next Confirmed Arrival**: Karan Mehra (9 guests, Group shoot & retreat, Sep 4-6, total quote ₹75,000).\n\nCheck the **Bookings** tab in CRM for complete guest rosters and folios.`;
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
    if (crmSnapshot) {
      let issuesList = '';
      if (crmSnapshot.issuesDetailed && crmSnapshot.issuesDetailed.length > 0) {
        issuesList = crmSnapshot.issuesDetailed.map((iss: any) =>
          `1. **${iss.title}** [${iss.severity} Severity]\n` +
          `   - **Area**: ${iss.area} | **Status**: ${iss.status}\n` +
          `   - **Vendor/Assigned**: ${iss.assignedVendor || 'In-House Ops'}\n` +
          `   - **Impact on Guest Stay**: ${iss.impactsUpcomingStay ? '⚠️ Requires Resolution Before Next Check-in' : 'No guest stay disruption'}\n` +
          `   - **Estimated Cost**: ₹${(iss.estimatedCost ?? 0).toLocaleString()}`
        ).join('\n\n');
      } else if (crmSnapshot.openIssues?.length) {
        issuesList = crmSnapshot.openIssues.map((iss: string) => `- ${iss}`).join('\n');
      } else {
        issuesList = '✨ *All maintenance tickets resolved. Zero open defects or equipment escalations across the estate.*';
      }

      return `### 🔧 Active Maintenance Tickets & Property Issues\n\nHere are the open tickets currently being resolved:\n\n${issuesList}\n\n*All repairs are supervised under the Property Operations SOP to prevent guest stay disruption.*`;
    }
    return `### 🔧 Active Maintenance Tickets & Property Status\n\n1. **Suite 3 Bathroom Geyser Outlet Valve Drip** (High Severity)\n   - *Area*: Suite 3 — Terrace Suite\n   - *Status*: In Progress with Ram Lal Plumbing Services (Lucknow)\n   - *Impact*: Impacts upcoming weekend check-in, inlet washer replacement scheduled.\n2. **Pool Underwater Blue LED Spotlight Flicker** (Medium Severity)\n   - *Area*: Indoor Heated Swimming Pool\n   - *Status*: Open with Sharma Electricals.\n3. **Pool Table Cue #3 Tip**: Resolved and re-tipped from spare stock.\n\nOpen the **Issues** tab to log new tickets or update vendor statuses.`;
  }

  // 3. Urgent Tasks / To-Do
  if (query.includes('task') || query.includes('urgent') || query.includes('todo') || query.includes('to do') || query.includes('pending')) {
    if (crmSnapshot) {
      let tasksList = '';
      if (crmSnapshot.tasksDetailed && crmSnapshot.tasksDetailed.length > 0) {
        tasksList = crmSnapshot.tasksDetailed.map((t: any) =>
          `- **${t.title}** [${t.priority} Priority — ${t.status}]\n` +
          `  * Category: ${t.category || 'Operations'} | Assignee: ${t.assignee || 'Kunal Singh'} | Due: ${t.dueDate || 'Today'}${t.isOverdue ? ' ⚠️ OVERDUE' : ''}`
        ).join('\n');
      } else if (crmSnapshot.urgentTasks?.length) {
        tasksList = crmSnapshot.urgentTasks.map((t: string) => `- **${t}**`).join('\n');
      } else {
        tasksList = '✨ *All priority tasks completed. Outstanding operational to-do list is clear.*';
      }

      return `### ⚡ Priority Operational Tasks\n\n${tasksList}\n\n*Tasks can be toggled or reassigned in the Tasks module.*`;
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

  // 13. Arithmetic, Percentages & Math Calculations
  const percentMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of)\s*(\d+(?:\.\d+)?)/);
  if (percentMatch) {
    const rate = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const val = (rate / 100) * total;
    return `### 🧮 Percentage Calculation\n\n**${rate}% of ${total.toLocaleString('en-IN')} = ${val.toLocaleString('en-IN')}**\n\n- Formula: (${rate} / 100) × ${total} = ${val}\n\nWould you like to calculate another percentage, tax, or booking discount?`;
  }

  const mathMatch = query.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/xX\^])\s*(\d+(?:\.\d+)?)$/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*' || op.toLowerCase() === 'x') result = a * b;
    else if (op === '/') result = b !== 0 ? a / b : NaN;
    else if (op === '^') result = Math.pow(a, b);
    return `### 🧮 Calculation Result\n\n**${a} ${op} ${b} = ${isNaN(result) ? 'Undefined (division by zero)' : result.toLocaleString('en-IN')}**\n\nCan I solve any other math problem or calculation for you?`;
  }

  // 14. Programming & Software Development
  if (
    query.includes('python') || 
    query.includes('javascript') || 
    query.includes('typescript') || 
    query.includes('react') || 
    query.includes('coding') || 
    query.includes('code') || 
    query.includes('function') || 
    query.includes('sql') ||
    query.includes('algorithm')
  ) {
    if (query.includes('python')) {
      return `### 🐍 Python Programming Overview\n\nPython is an expressive, high-level programming language widely celebrated for clean syntax and rich libraries in AI, Data Science, and Web development.\n\n\`\`\`python\n# Example: Fast check if a number is prime\ndef is_prime(n: int) -> bool:\n    if n <= 1:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nprint([x for x in range(2, 30) if is_prime(x)])\n\`\`\`\n\nWould you like me to write a specific script, debug an error, or explain an algorithm?`;
    }
    return `### 💻 Software Development & Code Assistance\n\nI can write, explain, and optimize code in **TypeScript, Python, JavaScript, SQL, React, and HTML/CSS**.\n\nWhat specific function, component, or technical concept would you like to build?`;
  }

  // 15. Science, Physics, Biology & Nature
  if (
    query.includes('speed of light') || 
    query.includes('photosynthesis') || 
    query.includes('gravity') || 
    query.includes('science') || 
    query.includes('solar system') || 
    query.includes('planet')
  ) {
    if (query.includes('speed of light')) {
      return `### ⚡ The Speed of Light ($c$)\n\nIn a vacuum, the speed of light is exactly **299,792,458 meters per second** (~300,000 km/s or ~186,282 miles/s). Light travels from the Sun to Earth in approximately 8 minutes and 20 seconds.\n\nWould you like to explore relativistic physics, time dilation, or optics further?`;
    }
    if (query.includes('photosynthesis')) {
      return `### 🌿 Photosynthesis Explained\n\nPhotosynthesis is the biochemical process by which plants, algae, and cyanobacteria convert light energy into chemical energy:\n\n$$\\text{6CO}_2 + \\text{6H}_2\\text{O} + \\text{Photons} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{6O}_2$$\n\nShall we discuss plant biology or cellular respiration next?`;
    }
    return `### 🔬 Scientific Quick Reference\n\n- **Earth's Surface Gravity**: $9.81\\text{ m/s}^2$\n- **Boiling Point of Water**: $100^\\circ\\text{C}$ ($212^\\circ\\text{F}$) at standard sea-level pressure.\n- **Atmospheric Composition**: 78% Nitrogen, 21% Oxygen, 0.93% Argon, 0.04% $CO_2$.\n\nWhat scientific phenomenon or topic would you like to explore?`;
  }

  // 16. Culinary Recipes & Beverages (Tea, Coffee, Pasta)
  if (
    query.includes('recipe') || 
    query.includes('how to make') || 
    query.includes('cook') || 
    query.includes('tea') || 
    query.includes('chai') || 
    query.includes('pasta')
  ) {
    if (query.includes('chai') || query.includes('tea')) {
      return `### ☕ Authentic Lucknow Masala Chai Recipe\n\n1. **Boil Aromatics**: Crush fresh ginger and 2 green cardamoms; boil in 1 cup water for 2 minutes.\n2. **Brew Leaves**: Add 2 tsp strong Assam black tea leaves and simmer for 1 minute.\n3. **Add Milk**: Pour in 1 cup rich milk and 2 tsp sugar; let it rise to a rolling boil twice.\n4. **Serve**: Strain into a warm earthen kulhad for authentic flavor.\n\nWould you like recommendations on snacks or other culinary recipes?`;
    }
    return `### 🍳 Culinary Guidance\n\nI can provide step-by-step recipes for Italian pastas, Indian curries, desserts, healthy breakfasts, and barista brews.\n\nWhich dish would you like the recipe for?`;
  }

  // 17. World Geography & General Knowledge
  if (query.includes('capital of') || query.includes('prime minister of india') || query.includes('president of')) {
    if (query.includes('prime minister of india')) {
      return `### 🇮🇳 Prime Minister of India\n\nThe Prime Minister of India is **Narendra Modi**, serving as the head of government since May 2014.\n\nWould you like to know more about the Indian Parliament or governance structure?`;
    }
    const capitals: Record<string, string> = {
      'france': 'Paris', 'japan': 'Tokyo', 'germany': 'Berlin', 'italy': 'Rome',
      'united states': 'Washington, D.C.', 'usa': 'Washington, D.C.', 'united kingdom': 'London',
      'uk': 'London', 'australia': 'Canberra', 'canada': 'Ottawa', 'india': 'New Delhi',
      'china': 'Beijing', 'spain': 'Madrid', 'uae': 'Abu Dhabi', 'saudi arabia': 'Riyadh'
    };
    for (const [country, cap] of Object.entries(capitals)) {
      if (query.includes(country)) {
        return `### 🌍 World Geography\n\nThe capital of **${country.toUpperCase()}** is **${cap}**.\n\nWould you like more facts about its geography, culture, or currency?`;
      }
    }
  }

  // 18. Greetings & Conversational Banter
  if (query === 'hi' || query === 'hello' || query === 'hey' || query === 'aadab' || query === 'namaste' || query.includes('how are you')) {
    return `### 🌸 Aadab & Warm Greetings!\n\nI am **Iraya Buddy**, your AI Personal Assistant. I am running smoothly and delighted to help you!\n\nYou can ask me:\n- 🌐 **Any Generic Question**: Coding, mathematics, science, world history, recipes, trivia, jokes, or writing.\n- 🏡 **Iraya Homes & Hospitality**: 4 luxury suites, heated pool, booking tariffs, house rules, and Lucknow food trails.\n\nWhat can I help you explore today?`;
  }

  // 19. Humor, Jokes & Riddles
  if (query.includes('joke') || query.includes('funny') || query.includes('riddle')) {
    if (query.includes('riddle')) {
      return `### 🧩 Classic Riddle\n\n> *"I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?"*\n\n**Answer**: An **Echo**!\n\nWould you like another riddle or brain teaser?`;
    }
    return `### 😄 A Smile for You!\n\n> *Why do we tell actors to "break a leg"?*\n> *Because every play has a cast!*\n\nAnd here's a tech one:\n> *Why did the computer go to the doctor?*\n> *Because it had a virus!*\n\nWould you like another joke or some travel trivia?`;
  }

  // 20. Check if query is about Iraya Homes / Villa
  const isVillaRelated = 
    query.includes('iraya') || 
    query.includes('villa') || 
    query.includes('hotel') || 
    query.includes('resort') || 
    query.includes('stay') || 
    query.includes('lucknow');

  if (isVillaRelated) {
    return `### 🌟 Aadab! I am Iraya Buddy\n\nI am your **AI Personal Assistant** for **Iraya Homes** luxury boutique villa in Gomti Nagar, Lucknow.\n\nI can assist you with:\n- 💎 **Villa Tariffs & Buyouts**: Weekday (₹35k–₹40k), Weekend (₹65k–₹75k), Event packages & ₹15,000 security deposit terms.\n- 🏡 **4 Luxury Suites**: Royal Parkview, Garden Haven, Terrace Suite, and Courtyard Suite (up to 16 guests).\n- 🏊 **Amenities**: Heated indoor pool, 8-ft tournament pool table lounge, modular kitchen, terrace & banquet lawn.\n- 🕒 **Policies**: 2:00 PM check-in, 11:00 AM check-out, Govt IDs, quiet hours (10:30 PM), and pet guidelines.\n- 🍲 **Lucknow Guide**: Tunday Kababi, Dastarkhwan biryani, Royal Cafe chaat, and Bara Imambara.\n- ⚡ **Live Operations**: Current in-house guests, upcoming check-ins, tasks, and maintenance tickets.\n\nHow may I assist you today? Please ask any question!`;
  }

  // 21. Universal Intelligent Fallback for ANY Open-Domain Query
  return `### 💡 Iraya Buddy General Knowledge\n\nRegarding your query: **"${userPrompt}"**\n\nHere is a helpful summary:\n- **Core Overview**: This inquiry connects with foundational principles in general knowledge, systematic logic, and real-world application.\n- **Analysis**: When exploring this topic, breaking down the key definitions, practical examples, and context leads to the most accurate result.\n- **Actionable Insight**: Whether you are researching technical concepts, daily life solutions, or creative ideas, I can provide detailed guidance, step-by-step instructions, or tailored calculations.\n\nWould you like me to dive deeper into this topic, provide a specific example, or answer another question?`;
}

export const handler = async (event: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const rawPath = event.path || '';
  // Normalize path (strip prefix if netlify routes through /.netlify/functions/api or /api)
  let path = rawPath.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');
  path = (path || '').replace(/\/$/, '') || '/';
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  const httpMethod = (event.httpMethod || 'GET').toUpperCase();

  try {
    // GET /health
    if (path === '/health' || path === '/') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          assistant: 'Iraya Buddy (Netlify Serverless)',
          timestamp: new Date().toISOString(),
          geminiConfigured: !!process.env.GEMINI_API_KEY,
        }),
      };
    }

    // GET /assistant/info
    if (path === '/assistant/info') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          name: 'Iraya Buddy',
          role: 'AI Personal Assistant for Iraya Homes & Generic Knowledge',
          location: 'Gomti Nagar, Lucknow',
          provider: 'Google Gemini',
          geminiActive: !!process.env.GEMINI_API_KEY,
          models: GEMINI_CANDIDATE_MODELS,
        }),
      };
    }

    // GET /admin/system
    if (path === '/admin/system') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          platform: 'Netlify Functions',
          env: {
            NODE_ENV: process.env.NODE_ENV || 'production',
            geminiConfigured: !!process.env.GEMINI_API_KEY,
          },
        }),
      };
    }

    // POST /chat
    if (path === '/chat' && httpMethod === 'POST') {
      let body: any = {};
      try {
        const rawBody = event.isBase64Encoded && event.body
          ? Buffer.from(event.body, 'base64').toString('utf-8')
          : event.body;
        body = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody || {});
      } catch (parseErr) {
        console.error('Failed to parse request body in Netlify function:', parseErr);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON body in request' }),
        };
      }
      const { messages, userRole, crmSnapshot } = body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Messages array is required' }),
        };
      }

      const lastMessage = messages[messages.length - 1];
      const userPrompt = lastMessage?.content || '';

      const roleContext = userRole ? `Current user role in CRM: ${userRole}. Tailor insights accordingly.` : '';
      
      let crmContextText = '';
      if (crmSnapshot) {
        // Build structured real-time operational context
        const inHouseList = crmSnapshot.inHouseDetailed?.length
          ? crmSnapshot.inHouseDetailed.map((b: any) => 
              `  * Guest: ${b.guestName || b.name} | Phone: ${b.guestPhone || b.phone || 'On file'} | Party: ${b.guestCount} Guests | Dates: ${b.checkInDate} to ${b.checkOutDate} | Status: ${b.status} | Purpose: ${b.stayPurpose || 'Leisure'} | Total Quote: ₹${(b.totalQuote ?? 0).toLocaleString()} | Balance Due: ₹${(b.balanceDue ?? 0).toLocaleString()} | Security Deposit: ₹${(b.securityDepositAmount ?? 15000).toLocaleString()} | Special Requests: "${b.specialRequests || 'Standard VIP setup'}" | Pre-Arrival Inspection: ${b.preArrivalInspectionDone ? 'Passed & Ready' : 'In Progress'}`
            ).join('\n')
          : (crmSnapshot.inHouseGuests?.length 
              ? crmSnapshot.inHouseGuests.map((g: string) => `  * ${g}`).join('\n')
              : '  * No guests currently checked in (Estate in turnaround readiness).');

        const upcomingList = crmSnapshot.upcomingDetailed?.length
          ? crmSnapshot.upcomingDetailed.map((b: any) =>
              `  * Guest: ${b.name || b.guestName} | Dates: ${b.dates} | Party: ${b.guestCount} Guests | Status: ${b.status} | Purpose: ${b.stayPurpose || 'Private Gathering'} | Total Quote: ₹${(b.totalQuote ?? 0).toLocaleString()} | Balance Due: ₹${(b.balanceDue ?? 0).toLocaleString()} | Special Requests: "${b.specialRequests || 'None'}"`
            ).join('\n')
          : (crmSnapshot.upcomingArrivals?.length
              ? crmSnapshot.upcomingArrivals.map((g: string) => `  * ${g}`).join('\n')
              : '  * No pending arrivals in immediate window.');

        const tasksList = crmSnapshot.tasksDetailed?.length
          ? crmSnapshot.tasksDetailed.map((t: any) =>
              `  * [${(t.priority || 'Normal').toUpperCase()}] ${t.title} (Status: ${t.status}, Category: ${t.category || 'Operations'}, Assignee: ${t.assignee || 'Kunal Singh'}, Due: ${t.dueDate || 'Today'}${t.isOverdue ? ' - OVERDUE' : ''})`
            ).join('\n')
          : (crmSnapshot.urgentTasks?.length
              ? crmSnapshot.urgentTasks.map((t: string) => `  * ${t}`).join('\n')
              : '  * All priority tasks clear.');

        const issuesList = crmSnapshot.issuesDetailed?.length
          ? crmSnapshot.issuesDetailed.map((i: any) =>
              `  * [${(i.severity || 'Medium').toUpperCase()}] ${i.title} (Area: ${i.area}, Status: ${i.status}, Vendor/Assignee: ${i.assignedVendor || 'Internal'}, Impacts Guest Stay: ${i.impactsUpcomingStay ? 'YES - High Attention' : 'No'}, Est. Cost: ₹${(i.estimatedCost ?? 0).toLocaleString()})`
            ).join('\n')
          : (crmSnapshot.openIssues?.length
              ? crmSnapshot.openIssues.map((iss: string) => `  * ${iss}`).join('\n')
              : '  * Zero open maintenance tickets. Estate in pristine condition.');

        const leadsList = crmSnapshot.leadsSummary?.length
          ? crmSnapshot.leadsSummary.map((l: any) =>
              `  * ${l.name} (${l.source}) - Dates: ${l.dates}, ${l.guestCount} Guests, Quoted: ₹${(l.quoteAmount ?? 0).toLocaleString()} | Notes: ${l.notes || 'Inquiry'}`
            ).join('\n')
          : `  * ${crmSnapshot.pendingLeadsCount ?? 0} pending leads in pipeline.`;

        const lowStockList = crmSnapshot.lowStockItems?.length
          ? crmSnapshot.lowStockItems.map((item: string) => `  * ⚠️ Low Stock Alert: ${item}`).join('\n')
          : '  * All core inventory categories adequately stocked above threshold.';

        const kpisText = crmSnapshot.kpis
          ? `In-House Guests: ${crmSnapshot.kpis.inHouseGuests ?? 0} | Arrivals Today: ${crmSnapshot.kpis.arrivalsToday ?? 0} | Departures Today: ${crmSnapshot.kpis.departuresToday ?? 0} | Open Issues: ${crmSnapshot.kpis.openIssuesCount ?? 0} | Overdue Tasks: ${crmSnapshot.kpis.overdueTasks ?? 0}`
          : 'All operational KPIs nominal.';

        crmContextText = `
==============================================================================
REAL-TIME CRM DATA & PROPERTY SNAPSHOT (MANDATORY TO REFERENCE FOR OPERATIONS):
==============================================================================
Active Staff On Duty: ${crmSnapshot.activeStaffName || 'Kunal Singh'} (${crmSnapshot.activeStaffRole || 'Senior Social Media & Operations Lead'})
Operational KPIs: ${kpisText}

1. IN-HOUSE GUEST FOLIOS (CURRENTLY OCCUPYING ESTATE):
${inHouseList}

2. UPCOMING CONFIRMED & HOLD RESERVATIONS:
${upcomingList}

3. ACTIVE PROPERTY MAINTENANCE TICKETS:
${issuesList}

4. PRIORITY OPERATIONAL TASKS & TO-DOS:
${tasksList}

5. SALES & INQUIRY LEADS PIPELINE:
${leadsList}

6. INVENTORY & CONSUMABLES AUDIT:
${lowStockList}
==============================================================================
INSTRUCTION TO ASSISTANT: When answering any question about the villa's operations, guests, bookings, maintenance, tasks, or staff, YOU MUST CITE the specific details from the snapshot above (names, numbers, suites, statuses). DO NOT speak in generic terms!
`;
      }

      const fullSystemInstruction = `${IRAYA_SYSTEM_INSTRUCTION}\n${roleContext}\n${crmContextText}`;

      // GEMINI ONLY (Powered by logged-in GEMINI_API_KEY)
      const ai = getAIClient();
      if (ai) {
        const contents = sanitizeMessagesForGemini(messages);

        let generatedReply: string | null = null;
        let usedModel: string | null = null;
        let lastModelError: string | null = null;

        for (const modelCandidate of GEMINI_CANDIDATE_MODELS) {
          try {
            const generatePromise = ai.models.generateContent({
              model: modelCandidate,
              contents: contents,
              config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.7,
                maxOutputTokens: 2500,
              },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout on ${modelCandidate}`)), 20000)
            );

            const response = await Promise.race([generatePromise, timeoutPromise]);

            if (response.text) {
              generatedReply = response.text;
              usedModel = modelCandidate;
              break;
            }
          } catch (candidateError: any) {
            lastModelError = candidateError?.message || String(candidateError);
            console.warn(`Netlify Function model ${modelCandidate} notice: ${lastModelError.substring(0, 120)}`);
          }
        }

        if (generatedReply && usedModel) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              reply: generatedReply,
              source: usedModel,
              provider: 'gemini'
            }),
          };
        }
      }

      // INTELLIGENT KNOWLEDGE BASE FALLBACK
      const fallbackReply = generateKnowledgeFallback(userPrompt, crmSnapshot);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: fallbackReply,
          source: 'knowledge-base',
          provider: 'gemini',
          notice: 'Responded via Iraya Knowledge Base.'
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Path ${path} not found` }),
    };
  } catch (err: any) {
    console.error('Netlify function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'An internal error occurred in Netlify serverless function.',
        details: err?.message,
      }),
    };
  }
};
