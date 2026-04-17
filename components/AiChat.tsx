'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  withActions?: boolean;
}

interface AiChatProps {
  onInsert: (html: string) => void;
  getContext: () => string;
}

export default function AiChat({ onInsert, getContext }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAiMarkdown, setLastAiMarkdown] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'ai',
          content:
            "Hi! I'm your writing helper. Ask me anything or tell me what to draft.\n\n*Tip:* after a suggestion, **press Tab** to insert it into your note.",
          withActions: true,
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Tab' && lastAiMarkdown) {
        e.preventDefault();
        handleInsert(lastAiMarkdown);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, lastAiMarkdown]);

  const renderMarkdown = (md: string): string => {
    // Simple markdown to HTML conversion
    let html = md
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/# (.*)/g, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
    return html;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Prompt: userMessage,
          contextHtml: getContext(),
        }),
      });

      const data = await res.json();
      const reply =
        data.ok && data.reply
          ? data.reply
          : data.error || "Sorry, I couldn't generate a response.";

      setLastAiMarkdown(reply);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: reply, withActions: true },
      ]);
    } catch (error) {
      setLastAiMarkdown('');
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'Oops — AI request failed. Please try again.',
          withActions: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = (markdown: string) => {
    const html = renderMarkdown(markdown);
    const divider = '<hr style="opacity:.25;margin:12px 0;" />';
    onInsert(`${divider}${html}`);
  };

  const handleCopy = async (content: string, button: HTMLButtonElement) => {
    await navigator.clipboard.writeText(content);
    button.textContent = 'Copied!';
    setTimeout(() => (button.textContent = 'Copy'), 1200);
  };

  return (
    <>
      <style jsx global>{`
        /* AI Chat Styles */
        #chat-fab {
          position: fixed;
          right: 24px;
          bottom: 24px;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgb(77, 77, 192);
          color: #fff;
          border: none;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          z-index: 1100;
          font-size: 28px;
          transition: transform 0.2s;
        }

        #chat-fab:hover {
          transform: scale(1.1);
        }

        .chat-sheet {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: min(560px, 100%);
          transform: translateX(100%);
          transition: transform 0.2s ease;
          background: #fff;
          border-left: 1px solid #ddd;
          z-index: 1101;
          display: grid;
          grid-template-rows: auto 1fr auto;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
        }

        .chat-sheet.open {
          transform: translateX(0%);
        }

        @media (prefers-color-scheme: dark) {
          .chat-sheet {
            background: #1f1f1f;
            border-left-color: #2a2a2a;
          }
        }

        .chat-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 18px;
          border-bottom: 1px solid #ddd;
          font-weight: 700;
        }

        @media (prefers-color-scheme: dark) {
          .chat-head {
            border-bottom-color: #2a2a2a;
            color: #eaeaea;
          }
        }

        .chat-head .title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-head .title .material-icons {
          font-size: 24px;
          color: rgb(77, 77, 192);
        }

        #chat-close {
          background: transparent;
          border: 1px solid #ddd;
          color: inherit;
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
        }

        @media (prefers-color-scheme: dark) {
          #chat-close {
            border-color: #2a2a2a;
            color: #eaeaea;
          }
        }

        .chat-body {
          padding: 16px 18px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .msg {
          display: flex;
          gap: 12px;
        }

        .msg.self {
          flex-direction: row-reverse;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 40px;
          overflow: hidden;
          color: #fff;
          font-weight: 800;
          font-size: 16px;
        }

        .avatar.user {
          background: #eef2ff;
          color: rgb(77, 77, 192);
        }

        .avatar.ai {
          background: #e6fffb;
          color: #0d9488;
        }

        .avatar svg {
          width: 22px;
          height: 22px;
        }

        .bubble {
          max-width: 78%;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 15.5px;
          line-height: 1.5;
          background: #f5f7fb;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          word-wrap: break-word;
        }

        @media (prefers-color-scheme: dark) {
          .bubble {
            background: #1f2937;
            color: #eaeaea;
          }
        }

        .msg.self .bubble {
          background: rgb(77, 77, 192);
          color: #fff;
        }

        .bubble .actions {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chip {
          border: 1px solid #ddd;
          background: #fff;
          color: #333;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chip:hover {
          background: #f5f5f5;
        }

        @media (prefers-color-scheme: dark) {
          .chip {
            border-color: #2a2a2a;
            background: #1f1f1f;
            color: #eaeaea;
          }

          .chip:hover {
            background: #2a2a2a;
          }
        }

        .ghost-hint {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 4px;
        }

        .chat-input {
          padding: 12px 16px;
          border-top: 1px solid #ddd;
          display: flex;
          gap: 10px;
          background: #fff;
        }

        @media (prefers-color-scheme: dark) {
          .chat-input {
            border-top-color: #2a2a2a;
            background: #1f1f1f;
          }
        }

        .chat-input form {
          display: flex;
          width: 100%;
          gap: 10px;
        }

        .chat-input input {
          flex: 1;
          border: 1px solid #ddd;
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 15.5px;
          background: #f8f9fa;
        }

        @media (prefers-color-scheme: dark) {
          .chat-input input {
            border-color: #2a2a2a;
            background: #1e1e1e;
            color: #eaeaea;
          }
        }

        .chat-input button {
          border: none;
          background: rgb(77, 77, 192);
          color: #fff;
          border-radius: 12px;
          min-width: 56px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .chat-input button:hover:not(:disabled) {
          background: rgb(60, 60, 160);
        }

        .chat-input button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .chat-input button .material-icons {
          font-size: 22px;
        }

        /* Loading dots */
        .dots {
          display: inline-flex;
          gap: 4px;
          align-items: center;
          justify-content: center;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
          opacity: 0.3;
          animation: pulse 1s infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
      `}</style>

      <button
        id="chat-fab"
        aria-label="Open AI assistant"
        type="button"
        title="Assistant"
        onClick={() => setIsOpen(true)}
      >
        <span className="material-icons">face_2</span>
      </button>

      <aside
        id="chat-sheet"
        className={`chat-sheet ${isOpen ? 'open' : ''}`}
        aria-live="polite"
        aria-hidden={!isOpen}
      >
        <header className="chat-head">
          <div className="title">
            <span className="material-icons">smart_toy</span> Assistant
          </div>
          <button
            id="chat-close"
            type="button"
            aria-label="Close"
            onClick={() => setIsOpen(false)}
          >
            &#10005;
          </button>
        </header>

        <main id="chat-body" className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`msg ${msg.role === 'user' ? 'self' : ''}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === 'ai' ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a2 2 0 1 1 0 4h-.1A8 8 0 0 1 20 14v1a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-1c0-3.87 3.13-7 7-7H12zm-3 8.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Zm6 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM8.5 17h7a.75.75 0 0 0 0-1.5h-7a.75.75 0 0 0 0 1.5Z" />
                  </svg>
                ) : (
                  'U'
                )}
              </div>
              <div className="bubble">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(msg.content),
                  }}
                />
                {msg.withActions && (
                  <>
                    <div className="actions">
                      <button
                        className="chip"
                        onClick={(e) =>
                          handleCopy(msg.content, e.target as HTMLButtonElement)
                        }
                      >
                        Copy
                      </button>
                      <button
                        className="chip"
                        onClick={() => handleInsert(msg.content)}
                      >
                        Insert to editor
                      </button>
                    </div>
                    <div className="ghost-hint">
                      Tip: Press Tab to insert this into your note.
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="chat-input">
          <form onSubmit={handleSend}>
            <input
              type="text"
              id="chat-input"
              placeholder="Ask for an outline, rewrite, bullets... (Tab accepts last suggestion)"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              id="chat-send"
              type="submit"
              aria-label="Send"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              ) : (
                <span className="material-icons">send</span>
              )}
            </button>
          </form>
        </footer>
      </aside>
    </>
  );
}
