'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  ArrowLeft,
  Wifi,
  Battery,
  Signal,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_LANGUAGES } from '@/lib/mock-data';
import VoiceInput from '@/components/ai/VoiceInput';

interface Message {
  id: string;
  role: 'farmer' | 'ai';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

const QUICK_MESSAGES = [
  'My tomato plants have yellow leaves',
  'Cotton crop is being attacked by insects',
  'Wheat seeds are not germinating',
  'My drip irrigation is not working',
  'Hailstorm damaged my crops',
];

function makeInitialMessages(): Message[] {
  return [
    {
      id: '1',
      role: 'ai',
      content:
        'Namaste! 🙏 I am KrishiBot, your AI farming assistant from KrishiFlow AI. I can help you with crop diseases, pest problems, irrigation issues, and more.\n\nWhat problem are you facing with your crops today?',
      timestamp: new Date(Date.now() - 60000),
    },
  ];
}

/**
 * Render **bold** markdown as <strong> and newlines as <br>.
 * Keeps the rest as plain text — no external markdown library needed.
 */
function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export default function WhatsAppDemo() {
  const [messages, setMessages] = useState<Message[]>(makeInitialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [language, setLanguage] = useState('hi');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Count only farmer messages to decide when to auto-create ticket
  const farmerMsgCount = messages.filter((m) => m.role === 'farmer').length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const reset = () => {
    setMessages(makeInitialMessages());
    setInput('');
    setIsTyping(false);
    setTicketId(null);
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'farmer',
      content: messageText,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate delivery tick after 500 ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'delivered' } : m))
      );
    }, 500);

    try {
      // Build conversation history for the API (include the new message)
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role === 'farmer' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory, language }),
      });

      const data = await res.json();

      // Simulate realistic typing delay
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));

      setIsTyping(false);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response,
        timestamp: new Date(),
      };

      // Mark farmer message as read when AI replies
      setMessages((prev) => [
        ...prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'read' as const } : m)),
        aiMsg,
      ]);

      // Auto-create a real ticket after the farmer has sent 2+ messages and no ticket yet
      const newFarmerCount = farmerMsgCount + 1;
      if (newFarmerCount >= 2 && !ticketId) {
        setTimeout(async () => {
          try {
            // Derive a crop name from the conversation (best-effort)
            const allFarmerText = [...messages, userMsg]
              .filter((m) => m.role === 'farmer')
              .map((m) => m.content)
              .join(' ');

            const cropMatch = allFarmerText.match(
              /\b(tomato|cotton|wheat|rice|sugarcane|banana|orange|soybean|maize|corn|onion|potato|groundnut|mustard|sunflower)\b/i
            );
            const crop = cropMatch ? cropMatch[1] : 'Not specified';

            // First classify with AI
            const classifyRes = await fetch('/api/ai/classify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ issue: allFarmerText, crop, language }),
            });
            const classifyData = await classifyRes.json();
            const classification = classifyData.classification;

            // Then create the ticket
            const ticketRes = await fetch('/api/tickets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                farmerName: 'WhatsApp User',
                district: 'Nashik',
                state: 'Maharashtra',
                language,
                crop,
                issue: allFarmerText.slice(0, 500),
                severity: classification?.severity ?? 'Medium',
                category: classification?.category ?? 'Crop Disease',
                department: classification?.department,
                suggestedAction: classification?.suggestedAction,
              }),
            });
            const ticketData = await ticketRes.json();
            const newTicketId: string = ticketData.ticket?.ticketId ?? `KF-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

            setTicketId(newTicketId);

            const ticketMsg: Message = {
              id: (Date.now() + 2).toString(),
              role: 'ai',
              content: `✅ I have automatically created a support ticket for you!\n\n🎫 **Ticket ID: ${newTicketId}**\n\nAn agriculture officer will contact you within 24 hours. You can track your ticket status on the KrishiFlow AI portal.\n\nIs there anything else I can help you with?`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, ticketMsg]);
          } catch {
            // Ticket creation failed silently — don't disrupt the chat
          }
        }, 1500);
      }
    } catch {
      setIsTyping(false);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'I apologize, I am having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col" style={{ maxHeight: '88vh' }}>
      {/* Phone status bar */}
      <div className="bg-[#075e54] px-4 py-1.5 flex items-center justify-between shrink-0">
        <span className="text-white text-xs font-medium">9:41 AM</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3 h-3 text-white" />
          <Wifi className="w-3 h-3 text-white" />
          <Battery className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* WhatsApp Header */}
      <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3 shrink-0">
        <button className="text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">KrishiBot AI</p>
          <p className="text-green-300 text-xs">{isTyping ? 'typing...' : 'online'}</p>
        </div>
        <div className="flex items-center gap-3 text-white/80">
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setShowLangPicker((v) => !v)}
              className="text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Change language"
            >
              {selectedLang?.nativeName ?? 'Lang'}
            </button>
            {showLangPicker && (
              <div className="absolute right-0 top-8 z-50 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 min-w-[160px]">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLanguage(l.code); setShowLangPicker(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      l.code === language
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-slate-300 hover:bg-white/5'
                    )}
                  >
                    {l.nativeName} <span className="text-slate-500 text-xs">({l.name})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={reset}
            title="Reset conversation"
            className="hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <Video className="w-5 h-5" />
          <Phone className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{
          minHeight: 0,
          background:
            'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {/* Date separator */}
        <div className="flex justify-center">
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full">Today</span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex', msg.role === 'farmer' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md',
                msg.role === 'farmer'
                  ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-sm'
                  : 'bg-white/10 text-white rounded-tl-sm backdrop-blur-sm border border-white/10'
              )}
            >
              <p className="text-sm leading-relaxed">{renderContent(msg.content)}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className={cn('text-xs', msg.role === 'farmer' ? 'text-slate-500' : 'text-slate-400')}>
                  {formatTime(msg.timestamp)}
                </span>
                {msg.role === 'farmer' && (
                  <>
                    {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-slate-500" />}
                    {msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-slate-500" />}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies — only shown at the start */}
      {messages.length <= 2 && (
        <div className="bg-slate-900/90 px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/5 shrink-0">
          {QUICK_MESSAGES.map((msg) => (
            <button
              key={msg}
              onClick={() => sendMessage(msg)}
              disabled={isTyping}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {msg}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="bg-[#1f2c34] px-3 py-3 flex items-center gap-2 shrink-0">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Smile className="w-6 h-6" />
        </button>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Paperclip className="w-6 h-6" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message"
          disabled={isTyping}
          className="flex-1 bg-[#2a3942] text-white placeholder:text-slate-500 rounded-full px-4 py-2.5 text-sm focus:outline-none border border-white/5 disabled:opacity-60"
        />
        {input.trim() ? (
          <button
            onClick={() => sendMessage()}
            disabled={isTyping}
            className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center hover:bg-[#00c49a] disabled:opacity-60 transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        ) : (
          <VoiceInput
            onTranscript={(text) => {
              setInput(text);
              // Auto-send after voice input
              setTimeout(() => sendMessage(text), 300);
            }}
            language={language}
            size="md"
            className="shrink-0"
          />
        )}
      </div>

      {/* Ticket created banner */}
      {ticketId && (
        <div className="bg-green-600/20 border-t border-green-500/30 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <span className="text-green-400 text-xs">
            🎫 Ticket <span className="font-mono font-semibold">{ticketId}</span> created
          </span>
          <Link
            href={`/tickets`}
            className="flex items-center gap-1 text-xs text-green-300 hover:text-green-200 transition-colors shrink-0"
          >
            View tickets
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
