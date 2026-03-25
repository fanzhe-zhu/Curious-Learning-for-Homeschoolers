import { useState, useRef, useEffect } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPTH_COLORS = [
  { bg: 'bg-blue-100',   border: 'border-blue-300',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-700', dot: 'bg-violet-400' },
  { bg: 'bg-pink-100',   border: 'border-pink-300',   text: 'text-pink-700',   dot: 'bg-pink-400'   },
  { bg: 'bg-green-100',  border: 'border-green-300',  text: 'text-green-700',  dot: 'bg-green-400'  },
  { bg: 'bg-amber-100',  border: 'border-amber-300',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
]

const SOCRATIC_RESPONSES = [
  "Interesting! What do you think might have happened to them? 🦕",
  "Great question! 🌟 What clues do you think might help us figure that out?",
  "Hmm, let's think together! What do you already know about it? 🤔",
  "Ooh, that's a fascinating one! Where do you think we should start? 🔍",
  "I love your curiosity! What have you heard about this before? ✨",
  "That's such a big question! Can you think of any examples you've seen? 🌍",
  "Wonderful! What would it mean if that were actually true? 💭",
]

const SAMPLE_CHIPS = [
  "Why did dinosaurs go extinct?",
  "How does rain form?",
  "Why is the sky blue?",
]

let _nextId = 0
const uid = () => ++_nextId

// ─── Input Classification ─────────────────────────────────────────────────────

const QUESTION_START = /^(what|why|how|who|when|where)\b/i
const SUMMARY_START  = /^(so\b|i think\b|that means\b)/i

/** Returns 'question' | 'summary' | 'passive' */
function classifyInput(text) {
  const t = text.trim()
  if (!t) return 'passive'
  if (QUESTION_START.test(t) || t.endsWith('?')) return 'question'
  if (SUMMARY_START.test(t)) return 'summary'
  return 'passive'
}

// ─── Tree Helpers ─────────────────────────────────────────────────────────────

function shortLabel(q) {
  const s = q
    .replace(/^(why|how|what|when|where|who|is|are|can|do|does|did)\s+/i, '')
    .replace(/[?!.]/g, '')
    .trim()
  return s.length > 30 ? s.slice(0, 30) + '…' : s
}

/** Recursively insert newNode as a child of parentId, or as a root if parentId is null */
function insertNode(nodes, parentId, newNode) {
  if (parentId === null) return [...nodes, newNode]
  return nodes.map(n => {
    if (n.id === parentId) return { ...n, children: [...n.children, newNode] }
    return { ...n, children: insertNode(n.children, parentId, newNode) }
  })
}

/** Clear the isNew flag on a specific node id */
function clearNew(nodes, id) {
  return nodes.map(n => ({
    ...n,
    isNew: n.id === id ? false : n.isNew,
    children: clearNew(n.children, id),
  }))
}

function countNodes(nodes) {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0)
}

// ─── KnowledgeTree ────────────────────────────────────────────────────────────

function EmptyTreeIllustration() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-12 text-center select-none">
      <svg width="130" height="108" viewBox="0 0 130 108" fill="none">
        {/* root */}
        <rect x="40" y="4" width="50" height="32" rx="10" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
        <text x="65" y="25" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#60a5fa">?</text>
        {/* stem */}
        <line x1="65" y1="36" x2="65" y2="54" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
        {/* branches */}
        <line x1="65" y1="54" x2="28" y2="54" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="65" y1="54" x2="102" y2="54" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="54" x2="28" y2="66" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="102" y1="54" x2="102" y2="66" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
        {/* left child */}
        <rect x="4" y="66" width="48" height="30" rx="8" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="1.5" />
        <text x="28" y="85" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#a78bfa">?</text>
        {/* right child */}
        <rect x="78" y="66" width="48" height="30" rx="8" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="1.5" />
        <text x="102" y="85" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#f472b6">?</text>
      </svg>
      <p className="text-slate-600 text-sm font-semibold">Ask anything to start exploring...</p>
      <p className="text-slate-400 text-xs leading-relaxed max-w-[170px]">
        Your questions will grow into a beautiful knowledge tree!
      </p>
    </div>
  )
}

function UnlockedBadge() {
  return (
    <span
      className="ml-auto flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200"
      style={{ animation: 'badgeFade 2s forwards' }}
    >
      🔓 Unlocked!
    </span>
  )
}

/** Renders an L-shaped SVG connector. isLast controls whether the vertical part continues. */
function Connector({ isLast }) {
  return (
    <svg
      width="18" height="28" viewBox="0 0 18 28"
      className="flex-shrink-0 self-start mt-2"
    >
      <line
        x1="9" y1="0" x2="9" y2={isLast ? '14' : '28'}
        stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"
      />
      <line
        x1="9" y1="14" x2="18" y2="14"
        stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  )
}

function TreeNode({ node, depth, isLast }) {
  const c = DEPTH_COLORS[depth % DEPTH_COLORS.length]
  const hasChildren = node.children.length > 0

  return (
    <div>
      {/* Connector + card row */}
      <div className="flex items-start gap-1">
        {depth > 0 && <Connector isLast={isLast} />}

        <div className="flex-1 min-w-0">
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl border-2
              cursor-pointer transition-all duration-200
              hover:shadow-md hover:scale-[1.01]
              ${c.bg} ${c.border}
            `}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
            <span className={`text-xs font-medium leading-snug flex-1 truncate ${c.text}`}>
              {node.label}
            </span>
            {node.isNew && <UnlockedBadge />}
          </div>

          {/* Children */}
          {hasChildren && (
            <div className="mt-1.5 ml-3 space-y-1.5">
              {node.children.map((child, i) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  isLast={i === node.children.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KnowledgeTree({ nodes }) {
  const empty = nodes.length === 0
  const total = countNodes(nodes)

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 h-screen">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100">
        <span className="text-2xl">🌳</span>
        <div>
          <h2 className="text-sm font-bold text-slate-700">Knowledge Tree</h2>
          <p className="text-xs text-slate-400">
            {empty ? 'Empty — start asking!' : `${total} topic${total !== 1 ? 's' : ''} explored`}
          </p>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-3">
        {empty ? (
          <EmptyTreeIllustration />
        ) : (
          <div className="space-y-2">
            {nodes.map((node, i) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                isLast={i === nodes.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────

function WelcomeScreen({ onChip }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-7 px-8 py-12 text-center">
      <div
        className="text-7xl leading-none"
        style={{ animation: 'owlBob 3s ease-in-out infinite' }}
      >
        🦉
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-700">Hi there, curious learner!</h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
          I'm here to explore big questions with you.<br />
          Ask me anything — or pick one below!
        </p>
      </div>
      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        {SAMPLE_CHIPS.map(q => (
          <button
            key={q}
            onClick={() => onChip(q)}
            className="
              w-full px-4 py-3 rounded-2xl text-sm font-medium text-left
              bg-blue-50 text-blue-700 border border-blue-100
              hover:bg-blue-100 hover:border-blue-200
              active:scale-95 transition-all duration-150
            "
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-base
          ${isUser ? 'bg-blue-500' : 'bg-amber-100'}
        `}
      >
        {isUser ? '😊' : '🦉'}
      </div>

      {/* Bubble */}
      <div
        className={`
          max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-sm'
          }
        `}
      >
        {msg.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        🦉
      </div>
      <div className="px-4 py-3 bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-slate-300 inline-block"
              style={{ animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function ChatPanel({ messages, thinking, onSend }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function send(text) {
    const val = (text ?? input).trim()
    if (!val) return
    onSend(val)
    setInput('')
  }

  return (
    <main className="flex-1 flex flex-col h-screen bg-gradient-to-b from-sky-50 to-blue-50 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-lg">
          🦉
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">Curious Owl</p>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full bg-emerald-400"
              style={{ animation: 'statusPulse 2s ease-in-out infinite' }}
            />
            <span className="text-xs text-slate-400">Ready to explore</span>
          </div>
        </div>
        <div className="ml-auto text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span>🌳</span>
          <span>Knowledge tree on the left</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <WelcomeScreen onChip={send} />
        ) : (
          <div className="flex flex-col gap-4 p-5 pb-3">
            {messages.map(m => (
              <ChatBubble key={m.id} msg={m} />
            ))}
            {thinking && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-4 bg-white/80 backdrop-blur border-t border-slate-100">
        {/* Dynamic hint label */}
        {(() => {
          const kind = classifyInput(input)
          const hint =
            kind === 'question' ? { text: '✨ New topic detected', cls: 'text-violet-500' } :
            kind === 'summary'  ? { text: '💡 Summary detected',   cls: 'text-green-600'  } :
            { text: 'Reply to owl...', cls: 'text-slate-400' }
          return (
            <p className={`text-xs font-medium mb-1.5 transition-colors duration-300 ${hint.cls}`}>
              {hint.text}
            </p>
          )
        })()}
        <form
          onSubmit={e => { e.preventDefault(); send() }}
          className="flex items-center gap-3"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything… 💡"
            className="
              flex-1 px-4 py-3 rounded-2xl text-sm
              bg-slate-50 border border-slate-200
              text-slate-700 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
              transition-all duration-200
            "
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="
              w-11 h-11 rounded-2xl bg-blue-500 text-white flex-shrink-0
              flex items-center justify-center
              hover:bg-blue-600 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 shadow-sm hover:shadow-md
            "
          >
            <SendIcon />
          </button>
        </form>
        <p className="text-center text-[11px] text-slate-300 mt-2">
          Type a question and press Enter ↵
        </p>
      </div>
    </main>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [messages, setMessages]   = useState([])
  const [nodes, setNodes]         = useState([])
  const [thinking, setThinking]   = useState(false)
  const [activeId, setActiveId]   = useState(null)   // node new questions branch from
  const responseIdx               = useRef(0)

  function handleSend(text) {
    // Add user message
    setMessages(prev => [...prev, { id: uid(), role: 'user', content: text }])
    setThinking(true)

    // Only unlock a new node for active output (question or summary)
    const kind = classifyInput(text)
    if (kind === 'question' || kind === 'summary') {
      const nodeId  = uid()
      const newNode = { id: nodeId, label: shortLabel(text), isNew: true, children: [] }
      setNodes(prev => insertNode(prev, activeId, newNode))
      setActiveId(nodeId)
      // Badge fades via CSS animation; clear isNew flag from state after 2s
      setTimeout(() => setNodes(prev => clearNew(prev, nodeId)), 2000)
    }

    // Owl reply after 1.5s
    const idx = responseIdx.current++
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: uid(), role: 'assistant', content: SOCRATIC_RESPONSES[idx % SOCRATIC_RESPONSES.length] },
      ])
      setThinking(false)
    }, 1500)
  }

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes badgeFade    { 0%,60%{opacity:1} 100%{opacity:0} }
        @keyframes owlBob       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes dotBounce    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes statusPulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        <KnowledgeTree nodes={nodes} />
        <ChatPanel messages={messages} thinking={thinking} onSend={handleSend} />
      </div>
    </>
  )
}
