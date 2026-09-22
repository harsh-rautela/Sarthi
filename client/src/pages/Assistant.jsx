import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Key,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../lib/AuthContext';

// Simple markdown formatter component
function FormattedMessage({ text }) {
  if (!text) return null;

  // Split into lines for rendering
  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-base font-black text-slate-900 mt-3 mb-1">
          {trimmed.replace('### ', '')}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={index} className="text-sm font-bold text-emerald-800 mt-2.5 mb-1">
          {trimmed.replace('#### ', '')}
        </h4>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      elements.push(
        <li key={index} className="ml-4 list-disc text-sm text-slate-700 my-0.5 leading-relaxed">
          <RenderInline content={content} />
        </li>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={index} className="rounded-lg bg-amber-50/80 border-l-4 border-amber-400 p-2.5 text-xs text-amber-900 my-2 italic">
          <RenderInline content={trimmed.replace('> ', '').replace('[!NOTE]', '').trim()} />
        </blockquote>
      );
    } else if (trimmed === '') {
      elements.push(<div key={index} className="h-1.5" />);
    } else {
      elements.push(
        <p key={index} className="text-sm text-slate-700 leading-relaxed my-1">
          <RenderInline content={trimmed} />
        </p>
      );
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
}

// Inline parser for bold text and markdown links
function RenderInline({ content }) {
  if (!content) return null;

  // Split by markdown link pattern [label](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="font-bold text-emerald-700 hover:text-emerald-900 underline inline-flex items-center gap-0.5"
      >
        <span>{match[1]}</span>
        <ExternalLink size={11} className="inline" />
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  // Handle bold formatting **text**
  return (
    <>
      {parts.map((part, pIdx) => {
        if (typeof part !== 'string') return part;
        const boldSplit = part.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={pIdx}>
            {boldSplit.map((piece, bIdx) => {
              if (piece.startsWith('**') && piece.endsWith('**')) {
                return <strong key={bIdx} className="font-semibold text-slate-900">{piece.slice(2, -2)}</strong>;
              }
              return piece;
            })}
          </span>
        );
      })}
    </>
  );
}

export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `👋 **Namaste! I am SchemeSathi AI**, your verified government scheme assistant powered by **LangGraph multi-step workflows** and **Groq LLMs**.\n\nI combine 100% deterministic eligibility verification with intelligent scheme guidance. Ask me about scholarships, farming grants, health insurance, loans, or specific eligibility criteria!`,
      mode: 'langgraph-ready',
      recommendations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('scheme_sathi_groq_key') || '');
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('scheme_sathi_groq_key', key);
  };

  const handleSend = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: q
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build previous conversation history for multi-turn LangGraph context
      const history = messages
        .filter(m => m.id !== 1)
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/assistant/chat', {
        question: q,
        history,
        apiKey: apiKey || undefined
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.answer || 'I evaluated your inquiry against verified scheme rules.',
        mode: res.data.mode || 'deterministic-rule-engine',
        modelUsed: res.data.modelUsed,
        recommendations: res.data.recommendations || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `⚠️ An error occurred while evaluating your request: ${err.response?.data?.message || err.message}. Please try again.`,
          mode: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    '🎯 Which schemes am I 100% eligible for right now?',
    '📚 What higher education scholarships can I apply for?',
    '🌾 What agricultural subsidies and insurance are available in my state?',
    '🏥 How does Ayushman Bharat ₹5 Lakh health coverage work?',
    '💼 How can I get a collateral-free loan under PM MUDRA or SVANidhi?'
  ];

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: `Conversation reset. How else can I assist you with government schemes today?`,
        mode: 'langgraph-ready',
        recommendations: []
      }
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col card overflow-hidden border border-emerald-100 shadow-sm">
      {/* Assistant Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white shadow-sm">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900">SchemeSathi AI Assistant</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <Cpu size={11} />
                LangGraph + Groq
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Grounded in verified government portals · Deterministic rule evaluation
            </p>
          </div>
        </div>

        {/* Actions (Settings, Clear) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn-secondary !px-3 py-1.5 text-xs font-semibold ${apiKey ? 'border-emerald-500 text-emerald-800 bg-emerald-50' : ''}`}
            title="Configure AI Model & Groq Key"
          >
            <Key size={14} className="mr-1 inline" />
            <span>{apiKey ? 'Groq Active' : 'Configure AI'}</span>
          </button>
          <button
            onClick={clearChat}
            className="btn-secondary !px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            title="Reset Chat"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Settings Dropdown Drawer (if toggled) */}
      {showSettings && (
        <div className="border-b border-emerald-100 bg-emerald-50/70 p-4 transition-all">
          <div className="max-w-xl mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Key size={14} />
                Groq API Key (Optional)
              </span>
              <button onClick={() => setShowSettings(false)} className="text-xs text-slate-500 hover:text-slate-800">
                Close
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Provide your Groq API Key to enable ultra-fast inference with <strong>llama-3.3-70b-versatile</strong>. If left empty, our intelligent deterministic rule synthesizer powers the assistant.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={e => saveApiKey(e.target.value)}
                className="input text-xs py-1.5 flex-1 bg-white"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={() => saveApiKey('')}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white mt-1 shadow-sm">
                <Bot size={18} />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
              }`}
            >
              {/* Message metadata / mode indicator */}
              {msg.role === 'assistant' && msg.mode && (
                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-400 pb-1.5 border-b border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-800">
                    <Sparkles size={12} />
                    {msg.mode === 'langgraph-llm'
                      ? `LangGraph + Groq (${msg.modelUsed || 'llama-3.3'})`
                      : 'LangGraph Rule-Engine Grounded'}
                  </span>
                  <span className="text-[10px] text-slate-400">Zero Hallucination</span>
                </div>
              )}

              {/* Message Content */}
              {msg.role === 'user' ? (
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
              ) : (
                <FormattedMessage text={msg.content} />
              )}

              {/* Embedded Scheme Recommendation Cards */}
              {msg.recommendations?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Verified Scheme Matches
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {msg.recommendations.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-100/70 transition"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {rec.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              rec.status === 'eligible'
                                ? 'bg-green-100 text-green-800'
                                : rec.status === 'needs_verification'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {rec.status === 'eligible' ? '✓ Eligible' : rec.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-xs font-bold text-slate-900 line-clamp-1">
                          {rec.name}
                        </h4>
                        {rec.requirementSummary && (
                          <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                            {rec.requirementSummary}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <Link
                            to={`/schemes/${rec.slug}`}
                            className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-0.5"
                          >
                            <span>Details</span>
                            <ChevronRight size={12} />
                          </Link>
                          {rec.officialUrl && (
                            <a
                              href={rec.officialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-slate-700 inline-flex items-center gap-0.5"
                            >
                              <span>Official</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 mt-1 shadow-sm font-bold text-xs">
                {user?.name?.[0] || 'U'}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <Bot size={18} />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                <span>LangGraph Workflow: Retrieving schemes & verifying deterministic rules…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="border-t border-slate-100 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-slate-400 shrink-0">Try asking:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              disabled={loading}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 transition disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box Footer */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-slate-200 bg-white p-4 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Ask a question about government schemes, eligibility, or documentation..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          className="input flex-1 text-sm py-2.5"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-primary !px-5 py-2.5 flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <span>Send</span>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
