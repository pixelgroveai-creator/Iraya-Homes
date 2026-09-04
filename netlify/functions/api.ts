import { GoogleGenAI } from '@google/genai';

// Lazy-initialized Gemini Client
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
- Guest Communications: Can draft polite WhatsApp welcome letters, directions, dietary preference forms, payment reminders, and feedback requests.`;

function generateKnowledgeFallback(userPrompt: string): string {
  const query = userPrompt.toLowerCase();

  if (query.includes('amenit') || query.includes('facility') || query.includes('pool') || query.includes('lawn') || query.includes('room') || query.includes('suite')) {
    return `### 🏡 Iraya Homes — Villa Amenities & Accommodations\n\nAadab! Welcome to Iraya Homes in Gomti Nagar, Lucknow.\n\n- **Accommodations (4 Luxury Suites)**:\n  - **Royal Master Suite**: King bed, ensuite bath with luxury soaking tub.\n  - **Poolside Veranda Suite**: Direct step-out access to pool.\n  - **Garden Deluxe Suite**: French windows overlooking lawn.\n  - **Upper Terrace Suite**: Open-air terrace with sunset views.\n\n- **Amenities**: Private swimming pool, banquet lawn, on-demand Awadhi chef, 300+ Mbps Wi-Fi, 100% power backup, and 24/7 butler service.`;
  }

  if (query.includes('check-in') || query.includes('check in') || query.includes('checkout') || query.includes('check-out') || query.includes('timing') || query.includes('policy') || query.includes('rule')) {
    return `### 🕒 Iraya Homes — Policies & Timings\n\n- **Check-in**: 2:00 PM (14:00)\n- **Check-out**: 11:00 AM (11:00)\n- **ID**: Govt-issued photo ID required for all adult guests.\n- **Quiet Hours**: 10:30 PM onwards outdoors.\n- **Smoking**: Outdoor zones only; strictly non-smoking in rooms.\n- **Pets**: Welcome with prior confirmation.`;
  }

  if (query.includes('food') || query.includes('restaurant') || query.includes('kebab') || query.includes('biryani') || query.includes('lucknow')) {
    return `### 🍲 Lucknow Culinary Guide by Iraya Buddy\n\n- **Tunday Kababi**: Iconic Galouti Kebabs with Ulte Tawe Ka Paratha.\n- **Dastarkhwan**: Tender Mutton Dum Biryani in Hazratganj.\n- **Royal Cafe**: Famous Basket Chaat.\n- **Prakash Kulfi**: Creamy Falooda Kulfi.\n- **Sharma Tea Stall**: Kulhad Chai & Bun Makkhan.`;
  }

  if (query.includes('inventory') || query.includes('stock') || query.includes('soap') || query.includes('towel')) {
    return `### 📋 Iraya Staff SOP — Consumables Tracking\n\n1. Housekeeping audits inventory daily between 5:00 PM - 7:00 PM.\n2. Open **Inventory > Daily Entry** in the CRM to record Used and Added items.\n3. Opening stock auto-populates from the previous day's closing count.\n4. Low stock warnings trigger automatically when stock dips below safe thresholds.`;
  }

  return `### 🌟 Aadab! I am Iraya Buddy\n\nI am your personal AI Assistant for **Iraya Homes** luxury villa in Gomti Nagar, Lucknow.\n\nI can assist you with villa accommodations, house policies, Awadhi culinary recommendations, staff SOPs, and guest communication drafts.`;
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
  // Normalize path (strip prefix if netlify routes through /.netlify/functions/api)
  const path = rawPath.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');

  try {
    // GET /health
    if (path === '/health' || path === '') {
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
          role: 'AI Personal Assistant for Iraya Homes',
          location: 'Gomti Nagar, Lucknow',
          model: 'gemini-3.8-flash',
          geminiActive: !!process.env.GEMINI_API_KEY,
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
    if (path === '/chat' && event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { messages, userRole } = body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Messages array is required' }),
        };
      }

      const lastMessage = messages[messages.length - 1];
      const userPrompt = lastMessage?.content || '';

      const ai = getAIClient();
      if (ai) {
        try {
          const contents = messages.map((m: any) => ({
            role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }));

          const roleContext = userRole ? `Current user role in CRM: ${userRole}. Tailor insights accordingly.` : '';

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: contents,
            config: {
              systemInstruction: `${IRAYA_SYSTEM_INSTRUCTION}\n${roleContext}`,
              temperature: 0.7,
              maxOutputTokens: 1200,
            },
          });

          const replyText = response.text || generateKnowledgeFallback(userPrompt);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              reply: replyText,
              source: 'gemini-3.8-flash',
            }),
          };
        } catch (geminiError: any) {
          console.warn('Netlify function Gemini notice:', geminiError?.message || geminiError);
          const fallbackReply = generateKnowledgeFallback(userPrompt);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              reply: fallbackReply,
              source: 'knowledge-base',
            }),
          };
        }
      } else {
        const fallbackReply = generateKnowledgeFallback(userPrompt);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: fallbackReply,
            source: 'knowledge-base',
          }),
        };
      }
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
