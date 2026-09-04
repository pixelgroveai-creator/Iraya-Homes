import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
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

LUCKNOW LOCAL GUIDE & RECOMMENDATIONS:
- Culinary Icons: Tunday Kababi (Aminabad & Chowk), Dastarkhwan (Hazratganj), Royal Cafe Basket Chaat, Prakash Kulfi, Sharma Tea Stall.
- Heritage: Bara Imambara, Bhulbhulaiya, Rumi Darwaza, British Residency, Gomti Riverfront Park.
- Shopping: Authentic Chikankari & Zardozi at Janpath / Chowk, Awadhi Ittar.`;

function generateKnowledgeFallback(userPrompt: string): string {
  const query = userPrompt.toLowerCase();

  if (query.includes('amenit') || query.includes('facility') || query.includes('pool') || query.includes('lawn') || query.includes('room') || query.includes('suite')) {
    return `### 🏡 Iraya Homes — Villa Amenities & Accommodations\n\nAadab! Welcome to Iraya Homes in Gomti Nagar, Lucknow.\n\n- **Accommodations (4 Luxury Suites)**: Royal Master Suite, Poolside Veranda Suite, Garden Deluxe Suite, and Upper Terrace Suite (accommodating 12–16 guests).\n- **Key Amenities**: Private filtered swimming pool, banquet lawn & gazebo lounge, on-demand Awadhi chef, 300+ Mbps Wi-Fi, 100% power backup, and 24/7 butler service.`;
  }

  if (query.includes('check-in') || query.includes('check in') || query.includes('checkout') || query.includes('check-out') || query.includes('timing') || query.includes('policy')) {
    return `### 🕒 Check-in, Check-out & House Policies\n\n- **Check-in**: 2:00 PM (14:00)\n- **Check-out**: 11:00 AM (11:00)\n- **ID Requirement**: Valid Govt photo ID required for all adult guests.\n- **Quiet Hours**: 10:30 PM outdoors.\n- **Smoking**: Outdoor lawn/gazebo areas only; strictly prohibited inside bedrooms.`;
  }

  if (query.includes('food') || query.includes('restaurant') || query.includes('kebab') || query.includes('biryani') || query.includes('lucknow')) {
    return `### 🍲 Lucknow Heritage & Culinary Guide\n\n- **Tunday Kababi**: Legendary Galouti Kebabs & Ulte Tawe Ka Paratha in Chowk/Aminabad.\n- **Dastarkhwan**: Mutton Dum Biryani & Sheermal in Hazratganj.\n- **Royal Cafe**: Famous Basket Chaat.\n- **Prakash Kulfi**: Authentic Falooda Kulfi.`;
  }

  return `### 🌟 Aadab! I am Iraya Buddy\n\nI am your personal AI Assistant for **Iraya Homes** luxury villa in Gomti Nagar, Lucknow.\n\nI can assist you with villa accommodations, house policies, Lucknow heritage dining recommendations, staff SOPs, and guest communication drafts.`;
}

// Router for API endpoints
const router = express.Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    assistant: 'Iraya Buddy (Vercel Serverless / Cloud Run)',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

router.get('/assistant/info', (_req: Request, res: Response) => {
  res.json({
    name: 'Iraya Buddy',
    role: 'AI Personal Assistant for Iraya Homes',
    location: 'Gomti Nagar, Lucknow',
    model: 'gemini-3.8-flash',
    geminiActive: !!process.env.GEMINI_API_KEY,
  });
});

router.get('/admin/system', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    },
  });
});

router.post('/chat', async (req: Request, res: Response) => {
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
        return res.json({
          reply: replyText,
          source: 'gemini-3.8-flash',
        });
      } catch (geminiError: any) {
        console.warn('Gemini generateContent fallback:', geminiError?.message || geminiError);
        const fallbackReply = generateKnowledgeFallback(userPrompt);
        return res.json({
          reply: fallbackReply,
          source: 'knowledge-base',
        });
      }
    } else {
      const fallbackReply = generateKnowledgeFallback(userPrompt);
      return res.json({
        reply: fallbackReply,
        source: 'knowledge-base',
      });
    }
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      error: 'An internal error occurred while processing the chat request.',
      details: err.message,
    });
  }
});

// Support both /api/* and root mount
app.use('/api', router);
app.use('/', router);

export default app;
