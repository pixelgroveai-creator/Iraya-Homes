import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  X, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Copy, 
  Check, 
  MessageSquare, 
  Utensils, 
  Home, 
  Clock, 
  ClipboardList, 
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { generateClientKnowledgeResponse, CRMSnapshot } from '../../utils/chatKnowledge';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  source?: string;
  provider?: 'gemini' | 'knowledge-base' | string;
}

const SUGGESTED_TOPICS = [
  {
    icon: Home,
    label: 'Villa & Suites',
    prompt: 'Tell me about Iraya Homes villa, our 4 luxury suites, and property amenities'
  },
  {
    icon: Sparkles,
    label: 'Ask Anything / Generic',
    prompt: 'Tell me a witty joke and share an interesting science fact!'
  },
  {
    icon: Clock,
    label: 'Check-in & Policies',
    prompt: 'What are the check-in, check-out timings, quiet hours, and house rules?'
  },
  {
    icon: Utensils,
    label: 'Lucknow Food & Sights',
    prompt: 'What are the top Awadhi food spots (kebabs/biryani) and historical sights in Lucknow?'
  },
  {
    icon: ClipboardList,
    label: 'Inventory SOP',
    prompt: 'How does staff log daily consumables and manage inventory in the CRM?'
  },
  {
    icon: FileText,
    label: 'Draft Guest Welcome',
    prompt: 'Draft a polite WhatsApp welcome message for a guest arriving today at Iraya Homes'
  }
];

export const IrayaBuddyModal: React.FC = () => {
  const { 
    isIrayaBuddyOpen, 
    setIsIrayaBuddyOpen, 
    toggleIrayaBuddy,
    irayaBuddyPrompt, 
    clearIrayaBuddyPrompt,
    currentStaff,
    bookings,
    tasks,
    issues,
    leads
  } = useCRM();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `### 🌟 Aadab! I am Iraya Buddy

I am your **AI Personal Assistant** for **Iraya Homes** luxury boutique villa in Gomti Nagar, Lucknow, powered by **Google Gemini**.

I can assist you with:
- 🏡 **Iraya Homes Villa**: 4 luxury suites, heated indoor pool, tournament pool table lounge & tariff details
- 🕒 **Policies & SOPs**: Check-in (2:00 PM), check-out (11:00 AM), guest IDs, security deposit & quiet hours
- 🍲 **Lucknow Guide**: Authentic Awadhi food (Tunday Kababi, Dastarkhwan) & heritage places
- 📋 **Staff Operations**: Daily inventory logging, booking workflows & message drafts
- 🌐 **General Knowledge & Open Queries**: Ask me *anything* — general questions, science, mathematics, poetry, translations, or writing!

Ask me any question about the villa or anything under the sun!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-3.1-flash-lite'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isIrayaBuddyOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isIrayaBuddyOpen, isLoading]);

  // Handle external prompt requests (e.g. from navbar or other components)
  useEffect(() => {
    if (irayaBuddyPrompt && isIrayaBuddyOpen) {
      handleSendMessage(irayaBuddyPrompt);
      clearIrayaBuddyPrompt();
    }
  }, [irayaBuddyPrompt, isIrayaBuddyOpen]);

  // Build live snapshot of CRM state for bot context
  const getCRMSnapshot = (): CRMSnapshot => {
    return {
      inHouseGuests: (bookings || [])
        .filter(b => b.status === 'Checked-in' || b.status === 'confirmed')
        .map(b => `${b.guestName} (${b.guestCount} Guests, ${b.suites?.join(', ') || 'Villa Buyout'})`),
      upcomingArrivals: (bookings || [])
        .filter(b => b.status === 'confirmed')
        .map(b => `${b.guestName} (${b.checkInDate} to ${b.checkOutDate})`),
      urgentTasks: (tasks || [])
        .filter(t => t.status !== 'completed')
        .slice(0, 5)
        .map(t => `${t.title} [${t.priority || 'Normal'}]`),
      openIssues: (issues || [])
        .filter(i => i.status !== 'resolved')
        .map(i => `${i.title} (${i.area || 'Villa'}, ${i.severity || 'Medium'})`),
      pendingLeadsCount: (leads || []).filter(l => l.status === 'New' || l.status === 'Contacted').length,
      activeStaffName: currentStaff?.name || 'Kunal Singh',
      activeStaffRole: currentStaff?.role || 'Staff Lead'
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    const crmSnapshot = getCRMSnapshot();

    try {
      // Create an abort controller with a 40s timeout so Gemini has ample time to complete complex responses
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userRole: currentStaff?.role || 'Staff',
          crmSnapshot
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      if (!data.reply) {
        throw new Error('Empty response received');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.1-flash-lite',
        provider: data.provider || 'gemini'
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('API call resolved to client knowledge engine:', err?.message || err);
      // Seamlessly generate accurate response from client knowledge engine with live CRM context
      const fallbackReply = generateClientKnowledgeResponse(query, crmSnapshot);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'knowledge-base',
        provider: 'knowledge-base'
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `### 🌟 Chat Cleared — How can I help?

Aadab! I am **Iraya Buddy**, your AI Personal Assistant. Ask me anything about Iraya Homes villa, amenities, check-in policies, Lucknow food & sights, or generic open-domain queries!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Iraya Buddy Engine'
      }
    ]);
  };

  // Render markdown formatting safely
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // H1
          if (trimmed.startsWith('# ')) {
            const headingText = trimmed.replace(/^#\s+/, '').replace(/^\*\*|\*\*$/g, '');
            return (
              <h3 key={idx} className="font-serif font-bold text-base text-[#2d1217] pt-1">
                {headingText}
              </h3>
            );
          }
          // H2
          if (trimmed.startsWith('## ')) {
            const headingText = trimmed.replace(/^##\s+/, '').replace(/^\*\*|\*\*$/g, '');
            return (
              <h4 key={idx} className="font-serif font-bold text-sm text-[#2d1217] pt-1">
                {headingText}
              </h4>
            );
          }
          // H3
          if (trimmed.startsWith('### ')) {
            const headingText = trimmed.replace(/^###\s+/, '').replace(/^\*\*|\*\*$/g, '');
            return (
              <h4 key={idx} className="font-serif font-bold text-sm text-[#2d1217] pt-1">
                {headingText}
              </h4>
            );
          }
          // H4
          if (trimmed.startsWith('#### ')) {
            const headingText = trimmed.replace(/^####\s+/, '').replace(/^\*\*|\*\*$/g, '');
            return (
              <h5 key={idx} className="font-serif font-semibold text-xs text-[#721828] pt-1 uppercase tracking-wide">
                {headingText}
              </h5>
            );
          }
          // Bullet list items
          if (/^[-*•]\s+/.test(trimmed)) {
            const itemText = trimmed.replace(/^[-*•]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-[#45373a]">
                <span className="text-[#c29342] shrink-0 leading-5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
              </div>
            );
          }
          // Numbered list items
          if (/^\d+[\.)]\s+/.test(trimmed)) {
            const numMatch = trimmed.match(/^(\d+)[\.)]\s+(.*)/);
            if (numMatch) {
              return (
                <div key={idx} className="flex items-start gap-1.5 pl-1 text-[#45373a]">
                  <span className="text-[#721828] font-bold shrink-0">{numMatch[1]}.</span>
                  <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numMatch[2]) }} />
                </div>
              );
            }
          }
          // Horizontal rule
          if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
            return <hr key={idx} className="border-t border-[#e4d8cf] my-2" />;
          }
          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  };

  // Helper for inline bold / italics / code
  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#2d1217]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-[#45373a]">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-[#f2e6de] px-1 py-0.5 rounded text-[11px] font-mono text-[#721828]">$1</code>');
  };

  const getSourceBadge = (source?: string, provider?: string) => {
    if (!source && !provider) return 'Google Gemini';
    if (source?.includes('gemini') || provider === 'gemini') {
      return source || 'Gemini Flash';
    }
    if (source === 'knowledge-base' || provider === 'knowledge-base') {
      return 'Knowledge Base';
    }
    return source || 'Google Gemini';
  };

  return (
    <>
      {/* 1. Floating Action Button (Always Accessible at Bottom-Right) */}
      {!isIrayaBuddyOpen && (
        <button
          id="iraya-buddy-floating-trigger"
          onClick={toggleIrayaBuddy}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 bg-[#721828] hover:bg-[#881d30] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-[#f0ded2] cursor-pointer hover:scale-105 active:scale-95"
          title="Open Iraya Buddy — AI Personal Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#fdf8f5]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#721828] animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-serif font-bold tracking-wide flex items-center gap-1 text-white">
              Iraya Buddy <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
            <span className="text-[10px] text-amber-100 font-sans opacity-90 leading-tight">
              Google Gemini Assistant
            </span>
          </div>
        </button>
      )}

      {/* 2. Interactive Slide-Over / Floating Assistant Modal */}
      {isIrayaBuddyOpen && (
        <div 
          id="iraya-buddy-drawer"
          className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col bg-white border border-[#e4d8cf] ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-10 rounded-2xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] md:w-[480px] h-[660px] max-h-[calc(100vh-2rem)] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d1217] via-[#5c1320] to-[#721828] text-white px-4 py-3 rounded-t-2xl flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm tracking-wide text-white">
                    Iraya Buddy
                  </h3>
                  <span className="bg-white/15 text-amber-200 text-[10px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    Google Gemini
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#e8d5ce]">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span>Online • Villa & Generic Queries</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-white/80">
              <button
                onClick={resetChat}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsIrayaBuddyOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Topics Banner */}
          <div className="bg-[#f7efe9] border-b border-[#e4d8cf] px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#7f6b6f] tracking-wider shrink-0 pl-1">
              Ask:
            </span>
            {SUGGESTED_TOPICS.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSendMessage(topic.prompt)}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-[11px] font-medium bg-white hover:bg-[#fbf2f4] text-[#721828] px-2.5 py-1 rounded-full border border-[#e4d8cf] hover:border-[#721828] shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-3 h-3 text-[#c29342]" />
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fdfaf8]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 relative text-left shadow-2xs ${
                      isUser
                        ? 'bg-[#721828] text-white rounded-br-xs'
                        : 'bg-white border border-[#e4d8cf] text-[#45373a] rounded-bl-xs'
                    }`}
                  >
                    {!isUser ? (
                      <div>
                        {renderFormattedContent(msg.content)}
                        <div className="mt-2.5 pt-2 border-t border-[#f2e6de] flex items-center justify-between text-[10px] text-[#968186]">
                          <span className="flex items-center gap-1">
                            <Bot className="w-3 h-3 text-[#721828]" />
                            <span className="font-medium text-[#721828]">
                              {getSourceBadge(msg.source, msg.provider)}
                            </span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1 hover:text-[#721828] transition-colors cursor-pointer"
                            title="Copy reply text"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-[13px] whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-[#968186] mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing Loader Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-[#e4d8cf] rounded-2xl rounded-bl-xs p-3.5 shadow-2xs flex items-center gap-2 text-xs text-[#7f6b6f]">
                  <Bot className="w-4 h-4 text-[#721828] animate-bounce" />
                  <span>Querying Google Gemini...</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#721828] rounded-full animate-ping" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-[#e4d8cf] rounded-b-2xl shrink-0">
            <div className="flex items-center gap-2 bg-[#fdfaf8] border border-[#e4d8cf] rounded-xl px-3 py-1.5 focus-within:border-[#721828] focus-within:ring-1 focus-within:ring-[#721828] transition-all">
              <MessageSquare className="w-4 h-4 text-[#968186] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Iraya Homes or any generic question..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs sm:text-sm text-[#2d1217] placeholder-[#968186] focus:outline-none disabled:opacity-50 py-1"
              />
              <button
                id="send-chat-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#721828] hover:bg-[#881d30] disabled:bg-[#d8c8c2] text-white p-2 rounded-lg transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#968186] mt-1.5 px-1 font-sans">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-[#c29342]" />
                Personal AI Assistant for Iraya Homes & Generic Knowledge
              </span>
              <span className="font-medium text-[#721828]">
                Powered by Google Gemini
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
