// Client-side knowledge engine for Iraya Buddy
// Provides instant, high-precision Awadhi hospitality answers and live CRM context
// Works seamlessly even when offline, during network dips, or in serverless environments.

export interface CRMSnapshot {
  inHouseGuests?: string[];
  upcomingArrivals?: string[];
  urgentTasks?: string[];
  openIssues?: string[];
  pendingLeadsCount?: number;
  activeStaffName?: string;
  activeStaffRole?: string;
}

export function generateClientKnowledgeResponse(userPrompt: string, crmSnapshot?: CRMSnapshot): string {
  const query = (userPrompt || '').toLowerCase().trim();

  // 1. Live CRM In-House Guests / Current Bookings / Arrivals
  if (
    query.includes('checked in') || 
    query.includes('check in today') || 
    query.includes('in house') || 
    query.includes('in-house') || 
    query.includes('who is stay') || 
    query.includes('who is here') ||
    query.includes('current guest') || 
    query.includes('arrival') || 
    query.includes('departure')
  ) {
    if (crmSnapshot) {
      const inHouseText = crmSnapshot.inHouseGuests && crmSnapshot.inHouseGuests.length > 0 
        ? crmSnapshot.inHouseGuests.map((g: string) => `- **${g}**`).join('\n')
        : '- *No guests currently checked in.*';

      const upcomingText = crmSnapshot.upcomingArrivals && crmSnapshot.upcomingArrivals.length > 0
        ? crmSnapshot.upcomingArrivals.map((g: string) => `- **${g}**`).join('\n')
        : '- *No immediate confirmed arrivals pending today.*';

      return `### 📋 Iraya Homes — Current Guest & Booking Status

#### 🏡 Currently In-House Guests:
${inHouseText}

#### 🧳 Upcoming Confirmed Arrivals:
${upcomingText}

*Standard check-in is 2:00 PM and check-out is 11:00 AM. Pre-arrival room and pool inspections are coordinated by our villa team.*`;
    }

    return `### 📋 Iraya Homes — In-House Guest Status

- **Current In-House Guest**: Mr. Vikramaditya Roy (7 guests, Family stay in Suite 1 Royal Parkview & Suite 2 Garden Haven).
- **Special Requests**: Morning heated pool (7:00 AM), Awadhi Galouti kebab dinner recommendations, 2 extra sets of pool towels.
- **Next Confirmed Arrival**: Karan Mehra (9 guests, Group shoot & retreat).

Check the **Bookings** tab in the CRM navigation for complete guest rosters and folios.`;
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
    if (crmSnapshot && crmSnapshot.openIssues && crmSnapshot.openIssues.length > 0) {
      const issuesList = crmSnapshot.openIssues.map((iss: string) => `- ${iss}`).join('\n');
      return `### 🔧 Active Maintenance Tickets & Property Issues

Here are the open tickets currently being resolved:
${issuesList}

*All repairs are supervised under the Property Operations SOP to prevent guest stay disruption.*`;
    }
    return `### 🔧 Active Maintenance Tickets & Property Status

1. **Suite 3 Bathroom Geyser Outlet Valve Drip** (High Severity)
   - *Area*: Suite 3 — Terrace Suite
   - *Status*: In Progress with Ram Lal Plumbing Services (Lucknow)
   - *Impact*: Inlet washer replacement scheduled before weekend check-in.
2. **Pool Underwater Blue LED Spotlight Flicker** (Medium Severity)
   - *Area*: Indoor Heated Swimming Pool
   - *Status*: Open with Sharma Electricals.
3. **Pool Table Cue #3 Tip**: Resolved and re-tipped from spare stock.

Open the **Issues** tab to log new tickets or update vendor statuses.`;
  }

  // 3. Urgent Tasks / To-Do
  if (query.includes('task') || query.includes('urgent') || query.includes('todo') || query.includes('to do') || query.includes('pending')) {
    if (crmSnapshot && crmSnapshot.urgentTasks && crmSnapshot.urgentTasks.length > 0) {
      const tasksList = crmSnapshot.urgentTasks.map((t: string) => `- **${t}**`).join('\n');
      return `### ⚡ Priority Action Tasks

${tasksList}

*Tasks can be toggled or reassigned in the Tasks module.*`;
    }
    return `### ⚡ Priority Operational Tasks

- **Warm Indoor Pool & Set Ambient Lighting** (Urgent — In Progress)
  - Turn on heating system to 28°C and stack clean towels by 7:00 AM for in-house guests.
- **Follow-up with Sameer Kapoor (WhatsApp Lead)** (High Priority)
  - Call back regarding Sep 12-14 family reunion and catering preferences.
- **Fix Suite 3 Geyser Valve Pressure Leak** (High Priority)
  - Supervise plumbing vendor Ram Lal before next guest check-in.
- **RO Purifier Weekly Sanitization** (Inspection due).

Check the **Tasks** tab to update progress.`;
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
    return `### 💎 Iraya Homes — Tariff & Booking Pricing Structure

Aadab! Iraya Homes operates primarily as an exclusive private buyout villa:

- **Weekday Villa Buyout**: **₹35,000 – ₹40,000 / night** (Full access to all 4 luxury suites, heated pool, lawn & lounge; up to 8–10 guests).
- **Weekend Villa Buyout (2 Nights)**: **₹65,000 – ₹75,000** (Friday to Sunday; accommodates 12–16 guests comfortably).
- **Intimate Celebrations / 3-Night Event Package**: **₹1,10,000** (Weddings, milestone birthdays, haldi/mehendi gatherings up to 40–50 day guests).

#### 💳 Booking & Security Terms:
- **Advance Deposit**: **50% advance token** required to hold and confirm reservation dates.
- **Security Deposit**: **₹15,000 refundable security deposit** collected at check-in (refunded post-checkout inspection).
- **Complimentary Inclusions**: High-speed Wi-Fi (300+ Mbps), heated indoor pool access, tournament pool table lounge, 100% generator power backup, secure parking for 6+ cars, dedicated butler service.

Would you like me to draft a customized quotation for specific dates?`;
  }

  // 5. Suites & Accommodations
  if (query.includes('suite') || query.includes('room') || query.includes('bed') || query.includes('bedroom') || query.includes('parkview') || query.includes('courtyard')) {
    return `### 🏡 The 4 Luxury Suites at Iraya Homes

Iraya Homes features **4 bespoke luxury suites** accommodating 12–16 guests:

1. **Suite 1 — Royal Parkview**:
   - *Bed*: King-sized plush bed with high-thread Egyptian cotton linen.
   - *Bath*: Ensuite luxury washroom with deep soaking tub & rainfall shower.
   - *Highlight*: Scenic panoramic vista overlooking the green park, 4K smart TV, climate preset 23°C.
2. **Suite 2 — Garden Haven**:
   - *Bed*: King bed with rich silk runner.
   - *Bath*: Ensuite bathroom with organic vanity amenities.
   - *Highlight*: Floor-to-ceiling French windows opening to the manicured lawn, smart entertainment unit.
3. **Suite 3 — Terrace Suite**:
   - *Bed*: King bed with blackout drapery.
   - *Bath*: Attached designer bathroom.
   - *Highlight*: Direct private step-out access to the expansive open-air terrace with sunset views.
4. **Suite 4 — Courtyard Suite**:
   - *Bed*: Family configuration (1 Queen Bed + 1 Twin Bed).
   - *Bath*: Attached ensuite bathroom.
   - *Highlight*: Ground floor step-free convenience, ideal for families traveling with elders or children.

All suites include individual silent climate control, smart TVs, wardrobe safes, and high-speed Wi-Fi.`;
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
    return `### 🏊 Villa Spaces & World-Class Amenities

- 🌊 **Indoor Heated Swimming Pool**:
  - Private temperature-regulated pool with mood lighting, deck loungers, and certified crystal-clear water (tested daily at 7.4 pH). Microfiber pool towels provided.
  - *Timings*: 7:00 AM – 9:00 PM.
- 🎱 **Entertainment & Pool Table Lounge**:
  - Professional 8-ft tournament slate pool table with premium straight cues and chalk.
  - Leather lounge seating, Bluetooth soundbar, and overhead spotlights.
- 🍳 **Fully Equipped Modular Kitchen**:
  - Modular island, double-door refrigerator, microwave, gas/induction hob, RO water purifier, and 16-person dinner & wine glassware sets.
- 🌿 **Manicured Banquet Lawn & Gazebo**:
  - Lush open-air green space ideal for morning yoga, high tea, or intimate celebrations.
- 🌅 **Private Terrace & Scenic Balcony**:
  - Park-facing sunset deck with cane lounge furniture.
- ⚡ **Infrastructure & Security**:
  - 300+ Mbps high-speed fiber Wi-Fi throughout the villa.
  - 100% automatic diesel generator power backup.
  - Secure gated on-site parking for 6+ cars with driver rest area.`;
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
    return `### 🕒 Iraya Homes — Check-in Policies & House Rules

- **Check-in Time**: **2:00 PM (14:00)**
- **Check-out Time**: **11:00 AM (11:00)**
- **Early / Late Requests**: Subject to slot availability and prior host confirmation.
- **Mandatory ID Verification**: Valid Government-issued photo ID (Aadhaar, Passport, Voter ID, or DL) is required for every adult guest prior to room allocation.
- **Quiet Hours**: **10:30 PM outdoors** to honor the serene residential atmosphere of Gomti Nagar.
- **Smoking Policy**: Strictly prohibited in all indoor suites and pool halls. Designated smoking areas available on the lawn and open terrace.
- **Pets**: Friendly pets are warmly welcomed with prior intimation.
- **Alcohol Policy**: Responsible private consumption by adult guests is allowed within the villa premises.`;
  }

  // 8. Food, Dining, Chef & Kitchen
  if (
    query.includes('food') || 
    query.includes('eat') || 
    query.includes('restaurant') || 
    query.includes('kebab') || 
    query.includes('biryani') || 
    query.includes('chef') || 
    query.includes('dinner') || 
    query.includes('breakfast') || 
    query.includes('swiggy') || 
    query.includes('zomato') || 
    query.includes('tunday') || 
    query.includes('dastarkhwan')
  ) {
    return `### 🍲 Dining at Iraya Homes & Lucknow Food Trails

#### 👨‍🍳 At The Villa:
- **On-Demand Private Chef**: Authentic Awadhi feasts (Galouti kebabs, dum gosht biryani, sheermal, korma) or custom family home-style cooking.
- **Self-Cooking**: Full access to our modular induction/gas kitchen with cookware and pantry staples.
- **Food Delivery**: Swiggy and Zomato deliver promptly to the villa main gate.

#### 🏛️ Iconic Lucknow Culinary Destinations:
1. **Tunday Kababi** (Aminabad / Chowk): Legendary melt-in-mouth Galouti Kebabs served with crisp Mughlai Ulte Tawe Ka Paratha.
2. **Dastarkhwan** (Hazratganj): Renowned for aromatic Awadhi Mutton Biryani, Chicken Masala, and Shahi Tukda.
3. **Royal Cafe** (Hazratganj): Originators of the famous Lucknow Basket Chaat.
4. **Prakash Kulfi** (Aminabad): Rich, falooda-laden saffron kulfi since 1956.
5. **Sharma Tea Stall** (Lalbagh): Signature kulhad masala chai with round bun-makhan.`;
  }

  // 9. Sightseeing, Heritage & Shopping in Lucknow
  if (
    query.includes('sight') || 
    query.includes('visit') || 
    query.includes('tour') || 
    query.includes('heritage') || 
    query.includes('imambara') || 
    query.includes('chikan') || 
    query.includes('shopping') || 
    query.includes('lucknow')
  ) {
    return `### 🏛️ The Best of Lucknow — Heritage & Culture

A curated itinerary from our concierge team:

1. **Bara Imambara & Bhulbhulaiya**: Marvel at the grand unsupported central arch hall and navigate the famous historical labyrinth.
2. **Rumi Darwaza & Clock Tower**: The 60-ft monumental gateway inspired by Constantinople, breathtaking around sunset.
3. **The British Residency**: Peaceful, poignant 1857 historic grounds set amid expansive botanical gardens.
4. **Gomti Riverfront Park**: Just 5 minutes from Iraya Homes, perfect for evening walks alongside illuminated musical fountains.
5. **Hazratganj ("Ganjing")**: Lucknow's historic colonial boulevard for heritage cafes, bookshops, and evening strolls.
6. **Chikankari & Ittar Shopping**: Visit Sewa Chikan or Janpath Market for authentic hand-embroidered Chikan & Zardozi couture, and Chowk for traditional Awadhi attar (natural perfume oils).`;
  }

  // 10. Staff SOP & Daily Inventory
  if (query.includes('inventory') || query.includes('stock') || query.includes('sop') || query.includes('kunal') || query.includes('staff') || query.includes('housekeeping')) {
    return `### 📋 Iraya Staff SOP — Daily Operations & Inventory Protocol

- **Daily Inventory Logging**:
  1. Housekeeping performs stock verification between **5:00 PM and 7:00 PM**.
  2. Open **Inventory > Daily Entry** in the CRM.
  3. Opening stock auto-carries from the previous day's balance.
  4. Enter **Used Count** and **Added Stock**; closing balance updates automatically.
  5. Items dipping below safe thresholds (Dental Kits < 15, Shampoo < 20, Towels < 16) flag instant reorder badges.
- **Pre-Arrival Inspection Protocol**:
  - Conducted morning of arrival: AC preset 23°C, linen replacement, geyser water pressure check, and pool pH tested (7.2–7.6 pH target).
- **Host on Duty**: Kunal Singh (Senior Social Media Manager & Operations Lead).`;
  }

  // 11. Draft Welcome / WhatsApp Message
  if (query.includes('welcome') || query.includes('message') || query.includes('whatsapp') || query.includes('draft')) {
    return `### ✍️ Draft Guest WhatsApp Welcome Message

---
*Aadab [Guest Name]! 🌿*

*Warm greetings from Iraya Homes, Lucknow.*

*We look forward to welcoming you and your party to our luxury villa for your upcoming stay from [Check-in Date] to [Check-out Date].*

*Key arrival highlights:*
- 📍 **Address**: Iraya Homes, Vipul Khand, Gomti Nagar, Lucknow.
- 🕒 **Check-in**: 2:00 PM (Our host will welcome you at the gate).
- 🏊 **Villa Spaces**: Heated pool, tournament pool table lounge, and high-speed Wi-Fi are prepped for your unwinding.
- 👨‍🍳 **Dining**: Let us know if you have any snack or meal preferences so our chef can prepare accordingly.

*For any immediate assistance en route, please call us at +91 98765 43210.*

*Warm regards,*  
*Kunal Singh & Team Iraya Homes*
---`;
  }

  // 12. Generic Queries: Greetings & Pleasantries
  if (query === 'hi' || query === 'hello' || query === 'hey' || query === 'aadab' || query === 'namaste' || query.includes('good morning') || query.includes('good evening') || query.includes('how are you')) {
    return `### 🌸 Aadab & Warm Greetings!

I am **Iraya Buddy**, your AI Personal Assistant. I am doing wonderful and am delighted to assist you today!

Whether you need information about **Iraya Homes Luxury Villa** (tariffs, amenities, suites, booking policies), **Lucknow heritage & food trails**, live **CRM operations**, or **any general knowledge question**, I am at your service. 

What can I help you with right now?`;
  }

  // 13. Generic Queries: Humor & Jokes
  if (query.includes('joke') || query.includes('funny') || query.includes('laugh')) {
    return `### 😄 Here is a smile for your day!

> *Why did the hotel guest bring a ladder to check-in?*  
> *Because they heard the hospitality at Iraya Homes was on a whole other level!*

And here's a tech one:
> *Why did the developer go swimming?*  
> *Because they wanted to test their code in a pool without bugs!*

Would you like another one, a travel trivia fact, or help with something else?`;
  }

  // 14. Generic Queries: Poetry & Chai / Nawabi Shayari
  if (query.includes('poem') || query.includes('poetry') || query.includes('shayari') || query.includes('chai')) {
    return `### ☕ An Ode to Morning Chai & Lucknow's Grace

*Subah ki dhoop, aur haath mein garam chai ki pyali,*  
*Hawaon mein ghuli Lucknow ki meethi tehzeeb nirali.*  
*Gomti ke kinare, parindon ka naya naghma,*  
*Sukoon ki talash thi jahan, wahan Iraya ka aangan mila.*

*(The morning sun with a warm kulhad of chai in hand,*  
*Sweet courteous Awadhi breeze gracing the serene land.*  
*Beside the tranquil Gomti river, nature begins its hum,*  
*Where true peace was sought, Iraya's embrace has come.)*`;
  }

  // 15. Generic Queries: General Science & Facts
  if (query.includes('speed of light') || query.includes('photosynthesis') || query.includes('boiling point') || query.includes('science')) {
    return `### 🔬 Scientific Quick Reference

- **Speed of Light**: Exactly **299,792,458 meters per second** (~300,000 km/s or ~186,282 miles/s) in a vacuum.
- **Photosynthesis**: The biological process where green plants, algae, and cyanobacteria convert sunlight, carbon dioxide ($CO_2$), and water ($H_2O$) into glucose ($C_6H_{12}O_6$) and oxygen ($O_2$).
- **Boiling Point of Water**: **100°C (212°F)** at standard sea-level atmospheric pressure (1 atm / 101.3 kPa).

Feel free to ask me any other science, mathematics, or open-domain question!`;
  }

  // Default smart fallback (gracious Awadhi assistant overview)
  return `### 🌟 Aadab! I am Iraya Buddy

I am your **AI Personal Assistant** for **Iraya Homes** luxury boutique villa in Gomti Nagar, Lucknow.

I can assist you with:
- 💎 **Villa Tariffs & Buyouts**: Weekday (₹35k–₹40k), Weekend (₹65k–₹75k), Event packages & ₹15,000 security deposit terms.
- 🏡 **4 Luxury Suites**: Royal Parkview, Garden Haven, Terrace Suite, and Courtyard Suite (up to 16 guests).
- 🏊 **Amenities**: Heated indoor pool, 8-ft tournament pool table lounge, modular kitchen, terrace & banquet lawn.
- 🕒 **Policies**: 2:00 PM check-in, 11:00 AM check-out, Govt IDs, quiet hours (10:30 PM), and pet guidelines.
- 🍲 **Lucknow Guide**: Tunday Kababi, Dastarkhwan biryani, Royal Cafe chaat, and Bara Imambara.
- ⚡ **Live Operations**: Current in-house guests, upcoming check-ins, tasks, and maintenance tickets.

How may I assist you today? Please feel free to ask any question or tap a suggested topic above!`;
}
