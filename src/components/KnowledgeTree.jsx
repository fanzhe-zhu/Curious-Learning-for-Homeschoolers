import { useEffect, useRef } from 'react'

// Icons as simple SVG components
function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function EmptyTreeIllustration() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      {/* Simple tree illustration */}
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        <circle cx="48" cy="32" r="20" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="2" />
        <circle cx="26" cy="58" r="16" fill="#ddd6fe" stroke="#c4b5fd" strokeWidth="2" />
        <circle cx="70" cy="58" r="16" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="2" />
        <line x1="48" y1="52" x2="30" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="52" x2="66" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <text x="48" y="36" textAnchor="middle" fontSize="18" fill="#60a5fa">?</text>
        <text x="26" y="63" textAnchor="middle" fontSize="14" fill="#a78bfa">?</text>
        <text x="70" y="63" textAnchor="middle" fontSize="14" fill="#f472b6">?</text>
      </svg>
      <p className="text-slate-500 text-sm leading-relaxed">
        Your <span className="font-semibold text-blue-500">knowledge tree</span> is waiting to grow!
      </p>
      <p className="text-slate-400 text-xs leading-relaxed">
        Ask your first question and watch a new branch appear here.
      </p>
    </div>
  )
}

function TreeNode({ node, depth = 0, isLast = false }) {
  const colors = [
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', dot: 'bg-blue-400' },
    { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-700', dot: 'bg-violet-400' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', dot: 'bg-pink-400' },
    { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700', dot: 'bg-amber-400' },
  ]
  const c = colors[depth % colors.length]

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-2">
        {/* Vertical connector line */}
        {depth > 0 && (
          <div className="flex flex-col items-center" style={{ minWidth: 20 }}>
            <div className={`w-px bg-slate-200 ${isLast ? 'h-4' : 'h-full'}`} />
            <div className="w-3 h-px bg-slate-200" />
          </div>
        )}

        {/* Node card */}
        <div className="flex-1 mb-2">
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer
              transition-all duration-200 hover:scale-[1.02] hover:shadow-md
              ${c.bg} ${c.border}
            `}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
            <span className={`text-xs font-medium leading-snug ${c.text}`}>{node.label}</span>
            {node.isNew && (
              <span className="ml-auto flex-shrink-0">
                <StarIcon />
              </span>
            )}
          </div>

          {/* Children */}
          {node.children && node.children.length > 0 && (
            <div className="ml-4 mt-1">
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

export default function KnowledgeTree({ nodes }) {
  const isEmpty = !nodes || nodes.length === 0

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-100">
        <span className="text-xl">🌳</span>
        <div>
          <h2 className="text-sm font-bold text-slate-700">My Knowledge Tree</h2>
          <p className="text-xs text-slate-400">
            {isEmpty ? 'Empty — start exploring!' : `${countNodes(nodes)} topics learned`}
          </p>
        </div>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-y-auto p-3">
        {isEmpty ? (
          <EmptyTreeIllustration />
        ) : (
          <div className="space-y-1">
            {nodes.map((node) => (
              <TreeNode key={node.id} node={node} depth={0} />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

function countNodes(nodes) {
  let count = 0
  for (const n of nodes) {
    count += 1
    if (n.children) count += countNodes(n.children)
  }
  return count
}
