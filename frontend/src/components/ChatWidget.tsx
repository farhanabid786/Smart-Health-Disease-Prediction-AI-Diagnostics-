import React from 'react';
import { MessageSquare, X, Send, Bot, AlertCircle, RefreshCw, Trash2, Sparkles } from 'lucide-react';
import type { HealthCardData } from './HealthCard';
import type { Prediction } from './PredictionResult';
import { useTheme } from '../context/ThemeContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  healthCard: HealthCardData;
  symptoms: string[];
  prediction: Prediction | null;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ healthCard, symptoms, prediction }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your AI Clinical Assistant. I have secure access to your Smart Health Passport, vital metrics, and active prediction history. How can I support your health queries today?"
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const SUGGESTED_CHIPS = [
    "Explain my blood pressure reading",
    "What lifestyle changes improve my SpO2?",
    "Summarize my diagnostic findings",
    "Are my current symptoms concerning?"
  ];

  React.useEffect(() => {
    if (prediction) {
      setMessages(prev => {
        const hasPredictionIntro = prev.some(m => m.content.includes("Diagnostic conclusion update"));
        if (hasPredictionIntro) return prev;
        
        return [
          ...prev,
          {
            role: 'assistant',
            content: `🏥 **Diagnostic conclusion update**: AI analysis indicates a **${prediction.risk_level}** risk profile for **${prediction.condition}** (${Math.round(prediction.confidence)}% confidence). Ask me to detail triage steps or vital factors!`
          }
        ];
      });
    }
  }, [prediction]);

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (userMsgText?: string) => {
    const messageToSend = userMsgText || input.trim();
    if (!messageToSend || loading) return;

    if (!userMsgText) setInput('');
    
    const newMessages = [...messages, { role: 'user', content: messageToSend } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const payload = {
        message: messageToSend,
        chat_history: newMessages.slice(0, -1).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        context: {
          health_card: healthCard,
          symptoms: symptoms,
          prediction: prediction ? {
            condition: prediction.condition,
            confidence: prediction.confidence,
            risk_level: prediction.risk_level,
            details: prediction.details,
            recommendations: prediction.recommendations
          } : null
        }
      };

      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('API server error');
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "⚠️ **Connection Failure**: Unable to reach FastAPI backend at http://127.0.0.1:8000."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat history cleared. Active health card and prediction context remain synchronized."
      }
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 cursor-pointer ${
            isDark 
              ? 'bg-gradient-to-tr from-teal-500 to-indigo-600 text-slate-100 border border-teal-400/30 pulse-glow' 
              : 'bg-teal-600 text-white hover:bg-teal-500 shadow-teal-600/30'
          }`}
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div 
          className={`flex h-[540px] w-[calc(100vw-32px)] sm:w-[420px] flex-col rounded-2xl border shadow-2xl overflow-hidden glass-card transition-all duration-300 ${
            isDark ? 'bg-slate-950/95 border-slate-800 text-slate-100' : 'bg-white/95 border-stone-200 text-stone-900'
          }`}
        >
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className={`rounded-xl p-2 ${isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'}`}>
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide">Smart Clinical Assistant</h4>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                  <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>Context Synced</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={clearChat}
                title="Clear Chat History"
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'
                }`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={`p-2.5 border-b overflow-x-auto whitespace-nowrap flex space-x-2 scrollbar-none ${
            isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-stone-50/80 border-stone-100'
          }`}>
            {SUGGESTED_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={loading}
                className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                  isDark 
                    ? 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-teal-300' 
                    : 'bg-white hover:bg-stone-100 border-stone-200 text-teal-700'
                }`}
              >
                <Sparkles className="w-3 h-3 mr-1 text-teal-500" />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none font-medium'
                      : isDark
                        ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                        : 'bg-stone-100 border border-stone-200 text-stone-800 rounded-bl-none'
                  }`}
                >
                  {msg.content.split('\n').map((paragraph, pIdx) => {
                    let text = paragraph;
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;

                    while ((match = boldRegex.exec(text)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(text.substring(lastIndex, match.index));
                      }
                      parts.push(
                        <strong key={match.index} className={`font-extrabold ${msg.role === 'user' ? 'text-white' : isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                          {match[1]}
                        </strong>
                      );
                      lastIndex = boldRegex.lastIndex;
                    }
                    if (lastIndex < text.length) {
                      parts.push(text.substring(lastIndex));
                    }

                    return (
                      <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
                        {parts.length > 0 ? parts : text}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className={`border rounded-2xl rounded-bl-none p-3 text-xs flex items-center space-x-2 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-stone-100 border-stone-200 text-stone-700'
                }`}>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-500" />
                  <span>Clinical model generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-stone-200 bg-stone-50/60'}`}
          >
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask about vitals, recommendations..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className={`flex-1 border rounded-xl px-3 py-2.5 text-xs outline-none transition-colors ${
                  isDark 
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-teal-400' 
                    : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-teal-600'
                }`}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 transition-colors cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className={`mt-2 text-[9px] text-center flex items-center justify-center space-x-1 ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
              <AlertCircle className="h-2.5 w-2.5 shrink-0" />
              <span>Contextually guided by Gemini AI & active health passport</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
