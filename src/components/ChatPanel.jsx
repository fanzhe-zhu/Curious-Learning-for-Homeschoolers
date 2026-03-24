import { useState, useRef, useEffect } from 'react'

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function WelcomeBanner() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8 py-12 text-center">
      <div className="text-6xl animate-bounce">🦉</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-700">
          Hi there, curious learner!
        </h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-sm">
          I&apos;m here to explore big questions with you. Ask me anything — about
          space, animals, history, science, or whatever you wonder about!
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
        {['🌍 How big is the Earth?', '🦕 Why did dinosaurs go extinct?', '⭐ Why do stars twinkle?', '🐬 How do dolphins talk?'].map((q) => (
          <span
            key={q}
            className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100 cursor-default"
          >
            {q}
          </span>
        ))}
      </div>
    </div>
  )
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm
          ${isUser ? 'bg-blue-500 text-white' : 'bg-amber-100 text-amber-600'}
        `}
      >
        {isUser ? '😊' : '🦉'}
      </div>

      {/* Bubble */}
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md'
          }
        `}
      >
        {message.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm">🦉</div>
      <div className="px-4 py-3 bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-md">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatPanel({ messages, onSendMessage, isThinking }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const hasMessages = messages && messages.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setInput('')
  }

  return (
    <main className="flex-1 flex flex-col h-screen bg-gradient-to-b from-sky-50 to-blue-50 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">🦉</div>
        <div>
          <h2 className="text-sm font-bold text-slate-700">Curious Owl</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">Ready to explore</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <span>🌳</span>
          <span>Knowledge tree on the left</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <WelcomeBanner />
        ) : (
          <div className="flex flex-col gap-4 p-6 pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isThinking && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-4 bg-white/80 backdrop-blur border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything… 💡"
            className="
              flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200
              text-sm text-slate-700 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
              transition-all duration-200
            "
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="
              w-11 h-11 rounded-2xl bg-blue-500 text-white
              flex items-center justify-center flex-shrink-0
              hover:bg-blue-600 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 shadow-sm hover:shadow-md
            "
          >
            <SendIcon />
          </button>
        </form>
        <p className="text-center text-xs text-slate-300 mt-2">
          Type a question and press Enter ↵
        </p>
      </div>
    </main>
  )
}
