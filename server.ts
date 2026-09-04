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

const IRAYA_SYSTEM_INSTRUCTION = `You are "Iraya Buddy", the official, warm, and highly courteous AI Personal Assistant for Iraya Homes.
You assist both villa guests and villa management/operations staff.

ABOUT IRAYA HOMES:
- Concept: An exclusive boutique luxury villa located in Gomti Nagar, Lucknow, Uttar Pradesh, India. Celebrated for "The Art of Unwinding", refined Nawabi/Awadhi hospitality ("Tehzeeb"), lush open gardens, and discreet personalized service.
- Accommodations: 4 lavish private suites (The Royal Master Suite with soaking tub, Garden Deluxe Suite, Poolside Veranda Suite, and Upper Terrace Suite). Accommodates up to 12-16 guests comfortably for private villa buyouts, intimate weddings, staycations, milestone celebrations, family reunions, and executive retreats.
- Amenities: Private swimming pool with sun deck, manicured private lawn/garden, gazebo lounge, high-speed Wi-Fi (300+ Mbps), 24/7 dedicated butler & housekeeping team, on-demand private chef curating authentic Awadhi dishes & continental breakfast/dinners, smart 4K TVs, 100% power backup, secure parking for 6+ cars.
- Policies & Timings:
  * Check-in Time: 2:00 PM (14:00)
  * Check-out Time: 11:00 AM (11:00)
  * Early check-in / late check-out subject to availability.
  * Valid Govt Photo ID (Aadhaar, Passport, Voter ID, Driving License) required for all adult guests at check-in.
  * Quiet Hours: 10:30 PM outdoors to respect the serene upscale neighborhood.
  * Smoking: Permitted only in designated outdoor lawn and gazebo zones; strictly prohibited inside bedrooms.
  * Pets: Welcome with prior notice and confirmation.
  * Alcohol: Responsible private consumption permitted for registered adult guests.

LUCKNOW LOCAL GUIDE & GENERIC RECOMMENDATIONS:
- Culinary Icons:
  * Galouti Kebabs & Ulte Tawe Ka Paratha: Tunday Kababi (historic Aminabad & Chowk branches).
  * Awadhi Dum Biryani & Sheermal: Dastarkhwan (Hazratganj) & Naushijaan.
  * Basket Chaat: Royal Cafe, Hazratganj.
  * Sweets & Chai: Prakash Kulfi (Aminabad), Kashmiri Chai / Kulhad Chai (Chowk), Sharma Tea Stall (Lalbagh).
- Heritage & Culture:
  * Bara Imambara & the gravity-defying Bhulbhulaiya (labyrinth) & Asfi Mosque.
  * Chhota Imambara & Rumi Darwaza.
  * The British Residency (historical siege museum & tranquil grounds).
  * Clock Tower (Ghanta Ghar) & Picture Gallery.
  * Gomti Riverfront Park (evening walking promenade, 5 mins from villa).
- Shopping & Souvenirs:
  * Authentic hand-embroidered Chikankari & Zardozi: Sewa Chikan, Nazrana Chikan (Hazratganj & Chowk).
  * Traditional Awadhi Ittar (perfumes): Sugandh Co., Chowk.

CRM & OPERATIONAL ASSISTANCE FOR STAFF:
- Inventory Logging: Staff record daily stock in Inventory > Daily Entry. Opening stock auto-carries from previous day's remaining stock.
- Leads & Bookings: Capture inquiries from WhatsApp, Airbnb, Direct Calls. Convert to Confirmed Bookings with token advance (50%).
- Morning Briefings & Evening Audits: Review today's expected arrivals/departures, VIP requests, and maintenance checklists.
- Guest Communications: Can draft polite WhatsApp welcome letters, directions, dietary preference forms, payment reminders, and feedback requests.

COMMUNICATION STYLE:
- Gracious, welcoming, courteous, and polite ("Aadab" / Nawabi warmth).
- Well-structured with bullet points, headings, and clear highlights.
- Clear, practical, and immediately actionable.`;

// Intelligent knowledge base fallback when Gemini API key is not present or offline
function generateKnowledgeFallback(userPrompt: string): string {
  const query = userPrompt.toLowerCase();

  if (query.includes('amenit') || query.includes('facility') || query.includes('pool') || query.includes('lawn') || query.includes('room') || query.includes('suite')) {
    return `### 🏡 Iraya Homes — Villa Amenities & Accommodations

Aadab! Welcome to Iraya Homes in Gomti Nagar, Lucknow. Here is what our boutique villa offers:

- **Accommodations (4 Luxury Suites)**:
  - **Royal Master Suite**: King bed, ensuite bath with luxury soaking tub, and private sit-out.
  - **Poolside Veranda Suite**: Direct step-out access to the swimming pool deck.
  - **Garden Deluxe Suite**: Floor-to-ceiling French windows overlooking our manicured lawn.
  - **Upper Terrace Suite**: Private open-air terrace with sunset views of Gomti Nagar.
  *(Total capacity: 12–16 guests for exclusive full-villa buyouts)*

- **Signature Villa Amenities**:
  - 🏊 **Private Swimming Pool**: Clean, filtered pool with sun lounger deck.
  - 🌿 **Lush Banquet Lawn & Gazebo**: Ideal for quiet morning tea, yoga, or intimate celebrations.
  - 👨‍🍳 **Private Chef on Demand**: Curating authentic Awadhi kebabs, dum biryani, and multi-cuisine breakfast.
  - 📶 **High-Speed Wi-Fi & Smart Entertainment**: 300+ Mbps fiber internet and 4K smart TVs.
  - ⚡ **100% Power Backup & 24/7 Butler Support**: Uninterrupted comfort and on-call service.
  - 🚗 **Secure Parking**: Ample space for up to 6 vehicles with driver amenities.

Would you like to check room availability or learn more about our dining packages?`;
  }

  if (query.includes('check-in') || query.includes('check in') || query.includes('checkout') || query.includes('check-out') || query.includes('timing') || query.includes('policy') || query.includes('rule')) {
    return `### 🕒 Iraya Homes — Check-in, Check-out & House Guidelines

Here are our standard villa policies for a seamless stay:

- **Timings**:
  - **Check-in**: 2:00 PM (14:00)
  - **Check-out**: 11:00 AM (11:00)
  - *Early check-in or late check-out*: Subject to villa availability and prior confirmation with the manager.

- **Guest Verification**:
  - All adult guests must present a valid Government-issued photo ID (Aadhaar Card, Passport, Voter ID, or Driver's License) upon arrival.

- **House Rules & Etiquette**:
  - 🌙 **Quiet Hours**: 10:30 PM onwards outdoors, respecting our tranquil residential neighborhood.
  - 🚭 **Smoking**: Strictly non-smoking inside bedroom suites. Smoking is permitted in designated outdoor lawn and gazebo areas.
  - 🐾 **Pet Policy**: Pets are welcome upon prior intimation with our hospitality team.
  - 🥂 **Alcohol**: Responsible consumption is permitted for registered adult guests.

Let me know if you require special arrangements for your arrival!`;
  }

  if (query.includes('food') || query.includes('restaurant') || query.includes('kebab') || query.includes('biryani') || query.includes('lucknow') || query.includes('eat') || query.includes('sight') || query.includes('visit') || query.includes('tourist')) {
    return `### 🍲 Lucknow Heritage & Culinary Guide by Iraya Buddy

Lucknow is the heart of Awadhi culture and cuisine. Here are our top hand-picked recommendations:

#### 🍽️ Must-Try Awadhi Culinary Spots:
1. **Tunday Kababi (Chowk & Aminabad)**: Legendary melt-in-mouth Galouti Kebabs served with flaky Ulte Tawe Ka Paratha.
2. **Dastarkhwan (Hazratganj)**: Renowned for tender Mutton Dum Biryani, Chicken Masala, and Sheermal.
3. **Royal Cafe (Hazratganj)**: Birthplace of the famous crispy *Basket Chaat*.
4. **Prakash Kulfi (Aminabad)**: Authentic Falooda Kulfi, operating since 1956.
5. **Sharma Tea Stall (Lalbagh)**: Hot Kulhad Chai paired with fresh Bun Makkhan and round samosas.

#### 🏛️ Architectural & Historical Heritage:
1. **Bara Imambara & Bhulbhulaiya**: A monumental 18th-century marvel with its famous acoustic labyrinth.
2. **Rumi Darwaza**: The iconic 60-foot Turkish Gate, the symbol of Lucknow.
3. **The British Residency**: Peaceful, historical ruins surrounded by manicured gardens.
4. **Gomti Riverfront Park**: Scenic riverside walking promenade just 5 minutes from Iraya Homes.

#### 🛍️ Chikankari & Zardozi Shopping:
- Visit **Janpath Market (Hazratganj)** or **Chowk** for authentic handcrafted Chikankari kurtas, sarees, and pure Awadhi ittar (perfumes).

Would you like our team to arrange a local chauffeur or private guide for your city tour?`;
  }

  if (query.includes('inventory') || query.includes('stock') || query.includes('soap') || query.includes('towel') || query.includes('shampoo') || query.includes('log')) {
    return `### 📋 Iraya Staff SOP — Inventory & Consumables Tracking

Here is the daily protocol for tracking consumables at Iraya Homes:

1. **Daily Logging Schedule**:
   - The housekeeping supervisor inspects linen, toiletries, and cleaning supplies each evening between **5:00 PM and 7:00 PM**.
2. **Using the CRM Inventory Module**:
   - Navigate to the **Inventory** tab > **Daily Entry**.
   - Select today's date (or any past date). The system **auto-populates opening stock** from the previous day's remaining balance.
   - Enter the **Used Count** (consumed by guests/housekeeping) and **Added Stock** (new deliveries received).
   - Remaining stock is calculated automatically (\`Opening + Added - Used\`).
3. **Low Stock Alerts**:
   - If stock for essential items (e.g. Dental Kits, Luxury Shampoos, Bath Towels) drops below the minimum threshold (typically < 10 units), an automated warning badge highlights the item for reorder.
4. **Monthly Reports**:
   - Access the **Monthly Summary** tab to review total consumption, wastage trends, and restock forecasts.

Is there a specific item you would like to audit or record today?`;
  }

  if (query.includes('welcome') || query.includes('message') || query.includes('whatsapp') || query.includes('draft') || query.includes('guest')) {
    return `### ✍️ Draft Guest Welcome Message (WhatsApp / Email)

Here is a ready-to-use personalized welcome message for incoming guests:

---
*Aadab [Guest Name]! 🌿*

*Warm greetings from Iraya Homes, Lucknow.*

*We are delighted to welcome you to our boutique villa for your stay from [Check-in Date] to [Check-out Date].*

*Key details for your arrival:*
- 📍 **Location**: Iraya Homes, Gomti Nagar, Lucknow (Google Maps link provided below)
- 🕒 **Check-in Time**: 2:00 PM onwards
- 🏊 **Villa Amenities**: Private pool, lawn lounge, and Wi-Fi credentials will be ready upon arrival.
- 👨‍🍳 **Dining Preferences**: Please let us know if you have any dietary restrictions or would like our private chef to prepare a traditional Awadhi dinner.

*If you need directions or have special requests, please feel free to call us at +91 98765 43210.*

*Wishing you a truly unwinding stay!*  
*Warm regards,*  
*Team Iraya Homes*
---

Feel free to copy and personalize this with the guest's name!`;
  }

  return `### 🌟 Aadab! I am Iraya Buddy

I am your personal AI Assistant for **Iraya Homes** — our boutique luxury villa in Gomti Nagar, Lucknow.

Here are ways I can assist you today:
- 🏡 **Villa Accommodations & Amenities**: Details on our 4 private luxury suites, swimming pool, and gardens.
- 🕒 **Timings & Policies**: Check-in (2:00 PM), check-out (11:00 AM), guest IDs, quiet hours, and pet rules.
- 🍲 **Lucknow Local Guide**: Famous Awadhi delicacies (Tunday Kababi, Biryani, Chaat) and heritage spots (Bara Imambara, Rumi Darwaza).
- 📋 **Staff Operations & SOPs**: Daily inventory logging, housekeeping checklists, and morning briefings.
- ✍️ **Draft Communications**: Professional WhatsApp welcome letters, booking estimates, and follow-ups.

How may I assist you today? You can ask me any question or pick one of the quick topics!`;
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
    const { messages, userRole } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content || '';

    const ai = getAIClient();

    if (ai) {
      try {
        // Format history for Gemini API
        const contents = messages.map(m => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const roleContext = userRole ? `Current user role in CRM: ${userRole}. Tailor insights accordingly.` : '';

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: `${IRAYA_SYSTEM_INSTRUCTION}\n${roleContext}`,
            temperature: 0.7,
            maxOutputTokens: 1200
          }
        });

        const replyText = response.text || generateKnowledgeFallback(userPrompt);
        return res.json({
          reply: replyText,
          source: 'gemini-3.8-flash'
        });
      } catch (geminiError: any) {
        console.warn('Gemini generateContent notice (using knowledge fallback):', geminiError?.message || geminiError);
        const fallbackReply = generateKnowledgeFallback(userPrompt);
        return res.json({
          reply: fallbackReply,
          source: 'knowledge-base',
          notice: 'Gemini service responded via local knowledge base.'
        });
      }
    } else {
      // Graceful fallback when GEMINI_API_KEY is not configured
      const fallbackReply = generateKnowledgeFallback(userPrompt);
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
