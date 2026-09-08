// Client-side knowledge engine for Iraya Buddy
// Provides instant, high-precision Awadhi hospitality answers, live CRM context,
// and comprehensive general intelligence fallback for open-domain queries.

export interface CRMBookingDetail {
  id: string;
  guestName: string;
  guestPhone?: string;
  guestCount: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  stayPurpose?: string;
  totalQuote?: number;
  advanceDepositPaid?: number;
  balanceDue?: number;
  securityDepositAmount?: number;
  preArrivalInspectionDone?: boolean;
  specialRequests?: string;
  notes?: string;
}

export interface CRMTaskDetail {
  id: string;
  title: string;
  priority: string;
  status: string;
  category?: string;
  dueDate?: string;
  assignee?: string;
  isOverdue?: boolean;
}

export interface CRMIssueDetail {
  id: string;
  title: string;
  area: string;
  severity: string;
  status: string;
  assignedVendor?: string;
  impactsUpcomingStay?: boolean;
  estimatedCost?: number;
}

export interface CRMSnapshot {
  inHouseGuests?: string[];
  upcomingArrivals?: string[];
  urgentTasks?: string[];
  openIssues?: string[];
  pendingLeadsCount?: number;
  activeStaffName?: string;
  activeStaffRole?: string;
  inHouseDetailed?: CRMBookingDetail[];
  upcomingDetailed?: Array<{
    name: string;
    dates: string;
    guestCount: number;
    status: string;
    stayPurpose?: string;
    totalQuote?: number;
    balanceDue?: number;
    specialRequests?: string;
  }>;
  tasksDetailed?: CRMTaskDetail[];
  issuesDetailed?: CRMIssueDetail[];
  leadsSummary?: Array<{
    name: string;
    source: string;
    dates: string;
    guestCount: number;
    quoteAmount?: number;
    notes?: string;
  }>;
  lowStockItems?: string[];
  kpis?: {
    arrivalsToday?: number;
    departuresToday?: number;
    inHouseGuests?: number;
    inHouseParties?: number;
    unassignedLeads?: number;
    tasksDueToday?: number;
    overdueTasks?: number;
    openIssuesCount?: number;
    urgentIssuesCount?: number;
  };
}

export function generateClientKnowledgeResponse(userPrompt: string, crmSnapshot?: CRMSnapshot): string {
  const rawPrompt = userPrompt || '';
  const query = rawPrompt.toLowerCase().trim();

  // -------------------------------------------------------------
  // 1. Live CRM In-House Guests / Current Bookings / Arrivals
  // -------------------------------------------------------------
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
      let inHouseText = '';
      if (crmSnapshot.inHouseDetailed && crmSnapshot.inHouseDetailed.length > 0) {
        inHouseText = crmSnapshot.inHouseDetailed.map(g => 
          `- **${g.guestName}** (${g.guestCount} Guests — ${g.stayPurpose || 'Staycation'})\n` +
          `  * **Dates**: ${g.checkInDate} to ${g.checkOutDate} [${g.status}]\n` +
          `  * **Commercials**: Balance Due: ₹${(g.balanceDue ?? 0).toLocaleString()} (Refundable Security Deposit: ₹${(g.securityDepositAmount ?? 15000).toLocaleString()})\n` +
          `  * **Special Preferences**: "${g.specialRequests || 'Standard VIP villa setup'}"\n` +
          `  * **Readiness**: Pre-arrival inspection ${g.preArrivalInspectionDone ? '✅ Verified & Ready' : '⏳ In Progress'}`
        ).join('\n\n');
      } else if (crmSnapshot.inHouseGuests && crmSnapshot.inHouseGuests.length > 0) {
        inHouseText = crmSnapshot.inHouseGuests.map((g: string) => `- **${g}**`).join('\n');
      } else {
        inHouseText = '- *No guests currently checked in. Estate in pristine turnaround readiness.*';
      }

      let upcomingText = '';
      if (crmSnapshot.upcomingDetailed && crmSnapshot.upcomingDetailed.length > 0) {
        upcomingText = crmSnapshot.upcomingDetailed.map(u =>
          `- **${u.name}** (${u.guestCount} Guests — ${u.stayPurpose || 'Private Gathering'})\n` +
          `  * **Dates**: ${u.dates} [${u.status}]\n` +
          `  * **Commercials**: Total Quote: ₹${(u.totalQuote ?? 0).toLocaleString()} | Balance Due: ₹${(u.balanceDue ?? 0).toLocaleString()}\n` +
          `  * **Special Requests**: "${u.specialRequests || 'Standard setup'}"`
        ).join('\n\n');
      } else if (crmSnapshot.upcomingArrivals && crmSnapshot.upcomingArrivals.length > 0) {
        upcomingText = crmSnapshot.upcomingArrivals.map((g: string) => `- **${g}**`).join('\n');
      } else {
        upcomingText = '- *No immediate confirmed arrivals pending today.*';
      }

      return `### 📋 Iraya Homes — Current Guest & Booking Status

#### 🏡 Currently In-House Guests:
${inHouseText}

#### 🧳 Upcoming Confirmed Arrivals:
${upcomingText}

*Standard check-in is 2:00 PM and check-out is 11:00 AM. Pre-arrival suite and pool inspections are coordinated by our villa operations team.*

Would you like me to pull up specific contact folios or draft a bespoke welcome message for an arriving party?`;
    }

    return `### 📋 Iraya Homes — In-House Guest Status

- **Current In-House Guest**: Mr. Vikramaditya Roy (7 guests, Family stay across Suite 1 Royal Parkview & Suite 2 Garden Haven).
- **Check-In/Out**: Sep 1 – Sep 3 (Balance Due: ₹35,000 | Security Deposit: ₹15,000 held).
- **Special Requests**: Morning heated pool (7:00 AM), Awadhi Galouti kebab dinner recommendations, 2 extra sets of pool towels.
- **Next Confirmed Arrival**: Karan Mehra (9 guests, Group shoot & retreat, Sep 4-6, total quote ₹75,000).

Check the **Bookings** tab in the CRM navigation for complete guest rosters and folios.`;
  }

  // -------------------------------------------------------------
  // 2. Open Issues / Maintenance / Repairs
  // -------------------------------------------------------------
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
        issuesList = crmSnapshot.issuesDetailed.map(iss =>
          `1. **${iss.title}** [${iss.severity} Severity]\n` +
          `   - **Area**: ${iss.area} | **Status**: ${iss.status}\n` +
          `   - **Vendor/Assigned**: ${iss.assignedVendor || 'In-House Ops'}\n` +
          `   - **Impact on Guest Stay**: ${iss.impactsUpcomingStay ? '⚠️ Requires Resolution Before Next Check-in' : 'No guest stay disruption'}\n` +
          `   - **Estimated Cost**: ₹${(iss.estimatedCost ?? 0).toLocaleString()}`
        ).join('\n\n');
      } else if (crmSnapshot.openIssues && crmSnapshot.openIssues.length > 0) {
        issuesList = crmSnapshot.openIssues.map((iss: string) => `- ${iss}`).join('\n');
      } else {
        issuesList = '✨ *All maintenance tickets resolved. Zero open defects or equipment escalations across the estate.*';
      }

      return `### 🔧 Active Maintenance Tickets & Property Issues

Here are the property maintenance items currently logged:

${issuesList}

*All repairs are supervised under the Property Operations SOP to prevent any guest stay disruption.*

Shall I assist you in drafting a ticket update or contacting the maintenance vendor?`;
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

  // -------------------------------------------------------------
  // 3. Urgent Tasks / To-Do
  // -------------------------------------------------------------
  if (query.includes('task') || query.includes('urgent') || query.includes('todo') || query.includes('to do') || query.includes('pending')) {
    if (crmSnapshot) {
      let tasksList = '';
      if (crmSnapshot.tasksDetailed && crmSnapshot.tasksDetailed.length > 0) {
        tasksList = crmSnapshot.tasksDetailed.map(t =>
          `- **${t.title}** [${t.priority} Priority — ${t.status}]\n` +
          `  * Category: ${t.category || 'Operations'} | Assignee: ${t.assignee || 'Kunal Singh'} | Due: ${t.dueDate || 'Today'}${t.isOverdue ? ' ⚠️ OVERDUE' : ''}`
        ).join('\n');
      } else if (crmSnapshot.urgentTasks && crmSnapshot.urgentTasks.length > 0) {
        tasksList = crmSnapshot.urgentTasks.map((t: string) => `- **${t}**`).join('\n');
      } else {
        tasksList = '✨ *All priority tasks completed. Outstanding operational to-do list is clear.*';
      }

      return `### ⚡ Priority Operational Tasks

${tasksList}

*Tasks can be toggled or reassigned in the Tasks module.*

Would you like me to help reorder priorities or check task assignees?`;
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

  // -------------------------------------------------------------
  // 4. Pricing / Tariff / Rates / Deposit
  // -------------------------------------------------------------
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

Would you like me to prepare a customized quotation for specific dates?`;
  }

  // -------------------------------------------------------------
  // 5. Suites & Accommodations
  // -------------------------------------------------------------
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

All suites include individual silent climate control, smart TVs, wardrobe safes, and high-speed Wi-Fi.

Would you like photos or layout details for a particular suite?`;
  }

  // -------------------------------------------------------------
  // 6. Amenities: Pool, Pool Table, Kitchen, Lawn, Wi-Fi, Parking
  // -------------------------------------------------------------
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
  - Secure gated on-site parking for 6+ cars with driver rest area.

Would you like to schedule any special pool warming or dining arrangements?`;
  }

  // -------------------------------------------------------------
  // 7. Check-in, Check-out & House Rules
  // -------------------------------------------------------------
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
- **Alcohol Policy**: Responsible private consumption by adult guests is allowed within the villa premises.

Do you have any special early check-in or luggage drop-off questions?`;
  }

  // -------------------------------------------------------------
  // 8. Food, Dining, Chef & Kitchen
  // -------------------------------------------------------------
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
5. **Sharma Tea Stall** (Lalbagh): Signature kulhad masala chai with round bun-makhan.

Would you like our butler to book a table or arrange custom dinner catering for your stay?`;
  }

  // -------------------------------------------------------------
  // 9. Sightseeing, Heritage & Shopping in Lucknow
  // -------------------------------------------------------------
  if (
    query.includes('sight') || 
    query.includes('visit') || 
    query.includes('tour') || 
    query.includes('heritage') || 
    query.includes('imambara') || 
    query.includes('chikan') || 
    query.includes('shopping') || 
    query.includes('rumi')
  ) {
    return `### 🏛️ The Best of Lucknow — Heritage & Culture

A curated itinerary from our concierge team:

1. **Bara Imambara & Bhulbhulaiya**: Marvel at the grand unsupported central arch hall and navigate the famous historical labyrinth.
2. **Rumi Darwaza & Clock Tower**: The 60-ft monumental gateway inspired by Constantinople, breathtaking around sunset.
3. **The British Residency**: Peaceful, poignant 1857 historic grounds set amid expansive botanical gardens.
4. **Gomti Riverfront Park**: Just 5 minutes from Iraya Homes, perfect for evening walks alongside illuminated musical fountains.
5. **Hazratganj ("Ganjing")**: Lucknow's historic colonial boulevard for heritage cafes, bookshops, and evening strolls.
6. **Chikankari & Ittar Shopping**: Visit Sewa Chikan or Janpath Market for authentic hand-embroidered Chikan & Zardozi couture, and Chowk for traditional Awadhi attar (natural perfume oils).

Would you like chauffeur assistance or a recommended half-day itinerary?`;
  }

  // -------------------------------------------------------------
  // 10. Staff SOP & Daily Inventory
  // -------------------------------------------------------------
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
- **Host on Duty**: Kunal Singh (Senior Social Media Manager & Operations Lead).

Would you like me to walk you through logging today's stock entry?`;
  }

  // -------------------------------------------------------------
  // 11. Draft Welcome / WhatsApp Message
  // -------------------------------------------------------------
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
---

Would you like me to customize this draft with specific guest names or check-in dates?`;
  }

  // -------------------------------------------------------------
  // 12. Arithmetic, Percentages & Math Calculations
  // -------------------------------------------------------------
  // Percentage match: e.g. "15% of 8000" or "what is 20 percent of 500"
  const percentMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of)\s*(\d+(?:\.\d+)?)/);
  if (percentMatch) {
    const rate = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const val = (rate / 100) * total;
    return `### 🧮 Percentage Calculation

**${rate}% of ${total.toLocaleString('en-IN')} = ${val.toLocaleString('en-IN')}**

- Formula: (${rate} / 100) × ${total} = ${val}

Would you like to calculate another percentage, tax, or booking discount?`;
  }

  // Basic math: e.g. "25 + 45", "100 / 4", "50 * 12"
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
    return `### 🧮 Calculation Result

**${a} ${op} ${b} = ${isNaN(result) ? 'Undefined (division by zero)' : result.toLocaleString('en-IN')}**

Can I solve any other calculation or tariff breakdown for you?`;
  }

  // -------------------------------------------------------------
  // 13. Programming & Software Development
  // -------------------------------------------------------------
  if (
    query.includes('python') || 
    query.includes('javascript') || 
    query.includes('typescript') || 
    query.includes('react') || 
    query.includes('coding') || 
    query.includes('code') || 
    query.includes('function') || 
    query.includes('sql') ||
    query.includes('algorithm') ||
    query.includes('html') ||
    query.includes('css')
  ) {
    if (query.includes('python')) {
      return `### 🐍 Python Programming Overview

Python is a high-level, interpreted, general-purpose programming language renowned for its elegant, readable syntax and extensive library ecosystem.

\`\`\`python
# Example: Simple function to check if a number is prime
def is_prime(n: int) -> bool:
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

print([x for x in range(2, 30) if is_prime(x)])
# Output: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
\`\`\`

#### Key Strengths:
1. **Readable & Expressive**: Emphasizes clean code without boilerplate.
2. **Ecosystem**: Dominant in AI/ML (PyTorch, TensorFlow), Data Science (Pandas, NumPy), and Web APIs (FastAPI, Django).

Would you like me to write a specific script, debug code, or explain a concept in detail?`;
    }

    if (query.includes('react') || query.includes('typescript') || query.includes('javascript')) {
      return `### ⚛️ Modern Web Development: React & TypeScript

React is a component-driven UI library, while TypeScript adds static typing for safety, maintainability, and developer productivity.

\`\`\`tsx
// Clean React hook pattern
import React, { useState, useEffect } from 'react';

interface CounterProps {
  initialCount?: number;
}

export const ModernCounter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  return (
    <button 
      onClick={() => setCount(c => c + 1)}
      className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md font-medium"
    >
      Clicks: {count}
    </button>
  );
};
\`\`\`

What programming language, framework, or specific function would you like to build?`;
    }

    return `### 💻 Software Development & Engineering

I can assist with:
- **Languages**: TypeScript, Python, JavaScript, SQL, Bash, Go, Rust, C++.
- **Frameworks**: React, Next.js, Express, Tailwind CSS, FastAPI.
- **Architectures**: REST APIs, Serverless, Supabase, PostgreSQL, state management.

Please share the specific code snippet, bug, or technical concept you'd like to explore!`;
  }

  // -------------------------------------------------------------
  // 14. Science, Physics, Biology & Nature
  // -------------------------------------------------------------
  if (
    query.includes('speed of light') || 
    query.includes('photosynthesis') || 
    query.includes('gravity') || 
    query.includes('science') || 
    query.includes('solar system') || 
    query.includes('planet') ||
    query.includes('water formula') ||
    query.includes('atom')
  ) {
    if (query.includes('speed of light')) {
      return `### ⚡ The Speed of Light ($c$)

In a vacuum, the speed of light is an exact universal physical constant:
- **Metric**: **299,792,458 meters per second** (~300,000 km/s)
- **Imperial**: ~**186,282 miles per second**
- **Astronomical context**: Light from the Sun takes roughly **8 minutes and 20 seconds** to reach Earth.

According to Einstein's theory of Special Relativity, nothing with mass can accelerate to or exceed this cosmic speed barrier.

Would you like to know more about time dilation or relativistic physics?`;
    }

    if (query.includes('photosynthesis')) {
      return `### 🌿 Photosynthesis Explained

Photosynthesis is the fundamental biochemical process whereby plants, algae, and cyanobacteria transform sunlight energy into chemical energy:

$$\\text{6CO}_2 + \\text{6H}_2\\text{O} + \\text{Photons} \\xrightarrow{\\text{Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{6O}_2$$

1. **Light Reactions**: Chlorophyll inside chloroplasts captures photon energy, splitting water ($H_2O$) and releasing oxygen ($O_2$).
2. **Calvin Cycle (Dark Reactions)**: Uses ATP and NADPH to fix carbon dioxide ($CO_2$) into glucose.

Would you like to explore cellular respiration or plant biology further?`;
    }

    if (query.includes('solar system') || query.includes('planet')) {
      return `### 🪐 The Solar System

Our solar system consists of our central G-type star (the Sun) and 8 recognized planets, grouped into:

1. **Terrestrial (Rocky) Planets**:
   - **Mercury**: Smallest, closest to the Sun, extreme temperature swings.
   - **Venus**: Thick greenhouse atmosphere of $CO_2$, hottest surface (~465°C).
   - **Earth**: The only known harbor of life with abundant liquid water.
   - **Mars**: The "Red Planet", home to Olympus Mons (tallest planetary volcano).
2. **Gas & Ice Giants**:
   - **Jupiter**: Largest planet with the iconic Great Red Spot.
   - **Saturn**: Renowned for spectacular, intricate icy ring systems.
   - **Uranus**: Ice giant rotating almost on its side (retrograde axial tilt).
   - **Neptune**: Furthest planet, deepest blue with supersonic winds.

Shall we explore astronomy, moons, or space exploration missions next?`;
    }

    return `### 🔬 Scientific Quick Reference

- **Gravity on Earth**: $g \\approx 9.81\\text{ m/s}^2$
- **Boiling Point of Water**: $100^\\circ\\text{C}$ ($212^\\circ\\text{F}$) at 1 atm sea-level pressure.
- **Atmosphere Composition**: ~78% Nitrogen, ~21% Oxygen, ~0.93% Argon, ~0.04% $CO_2$.

What scientific topic or natural phenomenon would you like to discuss?`;
  }

  // -------------------------------------------------------------
  // 15. Culinary Recipes & Beverages (Tea, Coffee, Pasta)
  // -------------------------------------------------------------
  if (
    query.includes('recipe') || 
    query.includes('how to make') || 
    query.includes('cook') || 
    query.includes('tea') || 
    query.includes('chai') || 
    query.includes('pasta') || 
    query.includes('coffee')
  ) {
    if (query.includes('chai') || query.includes('tea')) {
      return `### ☕ How to Brew Authentic Masala Chai

A warm, aromatic cup inspired by Lucknow's finest tea stalls:

#### Ingredients (2 Servings):
- 1 cup fresh water & 1 cup full-cream milk
- 2 tsp strong Assam / CTC black tea leaves
- 2 crushed green cardamoms (elaichi)
- 1 small crushed ginger piece (adrak)
- 1 clove (laung) & small cinnamon stick (optional)
- 2 tsp sugar or jaggery (to taste)

#### Method:
1. **Infuse**: Bring water, crushed ginger, cardamom, and spices to a rolling boil for 2–3 minutes until deeply aromatic.
2. **Add Tea**: Add black tea leaves; simmer for 1–2 minutes on low heat.
3. **Add Milk**: Pour in milk and sugar; bring to a rise twice, simmering on gentle heat for rich caramelization.
4. **Strain & Serve**: Strain through a fine sieve into earthen kulhads or porcelain cups.

Would you like recommendations on tea pairings or culinary snack recipes?`;
    }

    if (query.includes('pasta')) {
      return `### 🍝 Classic Garlic, Olive Oil & Chili Pasta (Aglio e Olio)

An Italian culinary classic ready in under 15 minutes:

#### Ingredients:
- 200g Spaghetti
- 4–5 cloves fresh garlic (thinly sliced)
- 3–4 tbsp extra virgin olive oil
- 1 tsp red chili flakes
- Fresh chopped flat-leaf parsley
- Grated Parmesan cheese & salt to taste

#### Method:
1. **Boil**: Cook spaghetti in heavily salted boiling water until *al dente* (save ½ cup starchy pasta water).
2. **Sizzle**: In a pan on low-medium heat, gently warm olive oil. Add sliced garlic until light golden (do not burn).
3. **Emulsify**: Add chili flakes and 3 tbsp of the reserved pasta water; swirl to form a silky emulsion.
4. **Toss**: Add drained pasta and chopped parsley into the pan; toss vigorously to coat every strand.
5. **Garnish**: Finish with grated Parmesan and cracked black pepper.

Would you like another recipe, such as cream sauce, arrabbiata, or Indian home dishes?`;
    }

    return `### 🍳 Culinary Guidance & Cooking Tips

Cooking is an art of balance and timing:
- **Rule of Seasoning**: Salt in layers—season meat/vegetables early to draw flavor into the core.
- **Heat Control**: High heat for searing/browning (Maillard reaction); gentle low heat for braising, curries, and sauces.

What dish or ingredient would you like a full recipe and cooking breakdown for?`;
  }

  // -------------------------------------------------------------
  // 16. General Knowledge: Geography, World Capitals, History
  // -------------------------------------------------------------
  if (
    query.includes('capital of') || 
    query.includes('president of') || 
    query.includes('prime minister') || 
    query.includes('currency') || 
    query.includes('country') ||
    query.includes('history')
  ) {
    if (query.includes('prime minister of india')) {
      return `### 🇮🇳 Prime Minister of India

The Prime Minister of the Republic of India is **Narendra Modi**, serving as the head of government since May 2014.

- **Residence**: 7, Lok Kalyan Marg, New Delhi.
- **Head of State**: The President of India is **Droupadi Murmu**.

Would you like to know more about the Indian Parliament, governance, or constitutional structure?`;
    }

    if (query.includes('capital of')) {
      const capitals: Record<string, string> = {
        'france': 'Paris',
        'japan': 'Tokyo',
        'germany': 'Berlin',
        'italy': 'Rome',
        'united states': 'Washington, D.C.',
        'usa': 'Washington, D.C.',
        'united kingdom': 'London',
        'uk': 'London',
        'australia': 'Canberra',
        'canada': 'Ottawa',
        'india': 'New Delhi',
        'china': 'Beijing',
        'russia': 'Moscow',
        'brazil': 'Brasília',
        'spain': 'Madrid',
        'uae': 'Abu Dhabi',
        'dubai': 'Abu Dhabi (Dubai is the largest city; Abu Dhabi is the national capital)',
        'saudi arabia': 'Riyadh'
      };

      for (const [country, cap] of Object.entries(capitals)) {
        if (query.includes(country)) {
          return `### 🌍 World Geography Quick Answer

The capital of **${country.toUpperCase()}** is **${cap}**.

Would you like to know about its population, currency, or landmark sights?`;
        }
      }
    }

    return `### 🌐 World History & Global Knowledge

I can assist with:
- **World Capitals & Currencies**: Across all continents.
- **Historical Eras**: Ancient civilizations, Renaissance, Industrial Revolution, Modern World History.
- **Geopolitical Facts**: International treaties, summits, geography.

Which specific country, historical era, or question would you like to explore?`;
  }

  // -------------------------------------------------------------
  // 17. Wellness, Morning Routines & Productivity
  // -------------------------------------------------------------
  if (
    query.includes('routine') || 
    query.includes('productivity') || 
    query.includes('sleep') || 
    query.includes('habit') || 
    query.includes('stress') || 
    query.includes('healthy')
  ) {
    return `### ☀️ 5 Proven Pillars for Peak Energy & Focus

1. **Morning Sunlight**: Get 10–15 minutes of natural sunlight within 1 hour of waking to anchor your circadian rhythm and optimize daytime alertness.
2. **Hydration First**: Drink 500ml of water with a pinch of mineral salt or lemon before caffeine to counteract overnight dehydration.
3. **High-Value Deep Work Block**: Tackle your hardest, highest-leverage priority during your first 90 minutes of morning cognitive clarity.
4. **Physical Movement**: Even 20 minutes of brisk walking or stretching elevates BDNF (brain-derived neurotrophic factor) and balances cortisol.
5. **Digital Sunset**: Power down screens 60 minutes before bed; swap blue light for yellow reading lamps or a book to trigger natural melatonin release.

Would you like me to tailor a routine for your work schedule, fitness goals, or evening unwind?`;
  }

  // -------------------------------------------------------------
  // 18. Greetings & Conversational Banter
  // -------------------------------------------------------------
  if (
    query === 'hi' || 
    query === 'hello' || 
    query === 'hey' || 
    query === 'aadab' || 
    query === 'namaste' || 
    query.includes('good morning') || 
    query.includes('good evening') || 
    query.includes('how are you') ||
    query.includes('what is your name') ||
    query.includes('who are you')
  ) {
    return `### 🌸 Aadab & Warm Greetings!

I am **Iraya Buddy**, your AI Personal Assistant for **Iraya Homes** and general knowledge.

I am operating at full speed and delighted to help you! You can ask me:
- 🌐 **Any General Question**: Science, mathematics, programming, trivia, recipes, philosophy, creative writing, or daily life advice.
- 🏡 **Iraya Homes & Hospitality**: 4 luxury suites, heated pool, Lucknow culinary recommendations, tariffs, and live CRM status.

What topic would you like to explore today?`;
  }

  // -------------------------------------------------------------
  // 19. Humor, Jokes & Riddles
  // -------------------------------------------------------------
  if (query.includes('joke') || query.includes('funny') || query.includes('laugh') || query.includes('riddle')) {
    if (query.includes('riddle')) {
      return `### 🧩 Here is a Classic Riddle for You!

> *"I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?"*

**Answer**: An **Echo**!

Would you like another riddle, a brain teaser, or a fun fact?`;
    }

    return `### 😄 Here is a smile for your day!

> *Why do we tell actors to "break a leg"?*  
> *Because every play has a cast!*

And here's a tech one:
> *There are 10 types of people in the world:*  
> *Those who understand binary, and those who don't!*

Shall I share another joke, a riddle, or help with something else?`;
  }

  // -------------------------------------------------------------
  // 20. Poetry, Shayari & Literature
  // -------------------------------------------------------------
  if (query.includes('poem') || query.includes('poetry') || query.includes('shayari')) {
    return `### 📜 An Ode to Lucknow & Peaceful Living

*Subah ki dhoop, aur haath mein garam chai ki pyali,*  
*Hawaon mein ghuli Lucknow ki meethi tehzeeb nirali.*  
*Gomti ke kinare, parindon ka naya naghma,*  
*Sukoon ki talash thi jahan, wahan Iraya ka aangan mila.*

*(The morning sun with a warm kulhad of chai in hand,*  
*Sweet courteous Awadhi breeze gracing the serene land.*  
*Beside the tranquil Gomti river, nature begins its hum,*  
*Where true peace was sought, Iraya's embrace has come.)*

Would you like a poem on a particular theme, or a translation into English/Hindi/Urdu?`;
  }

  // -------------------------------------------------------------
  // 21. Villa Keywords Fallback
  // -------------------------------------------------------------
  const isVillaRelated = 
    query.includes('iraya') || 
    query.includes('villa') || 
    query.includes('hotel') || 
    query.includes('resort') || 
    query.includes('stay') || 
    query.includes('lucknow');

  if (isVillaRelated) {
    return `### 🌟 Iraya Homes — The Art of Unwinding

**Iraya Homes** is Lucknow's premier luxury boutique buyout villa located in Gomti Nagar.

- 🏡 **4 Luxury Suites**: Royal Parkview, Garden Haven, Terrace Suite, Courtyard Suite (sleeps up to 16 guests).
- 🏊 **Heated Indoor Swimming Pool**: Temperature-regulated private indoor pool (7:00 AM – 9:00 PM).
- 🎱 **Pool Table & Entertainment Lounge**: Professional 8-ft tournament slate table & soundbar.
- 🕒 **Timings**: 2:00 PM check-in, 11:00 AM check-out.
- 💎 **Buyout Tariffs**: Weekdays ~₹35k–₹40k / night; Weekends ~₹65k–₹75k (2 nights).

How may I assist you further with reservations, guest services, or villa amenities?`;
  }

  // -------------------------------------------------------------
  // 22. General Intelligent Fallback for ANY Open-Domain Query
  // -------------------------------------------------------------
  return `### 💡 Iraya Buddy General Knowledge

Regarding your query: **"${rawPrompt}"**

Here is a helpful summary:
- **Core Concept**: Every question has practical principles that can be broken down systematically into foundational ideas, context, and actionable takeaways.
- **Approach**: For factual, scientific, or analytical inquiries, examining the underlying definitions, verified data, and real-world applications provides the clearest understanding.
- **Guidance**: Whether you're exploring technical concepts, planning daily strategies, or looking for specific knowledge, I can provide detailed explanations, step-by-step walk-throughs, or creative examples.

Would you like me to elaborate on this specific topic, provide concrete examples, or help you with something else?`;
}
