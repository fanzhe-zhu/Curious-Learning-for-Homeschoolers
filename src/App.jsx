import { useState } from 'react'
import KnowledgeTree from './components/KnowledgeTree'
import ChatPanel from './components/ChatPanel'

// Derive a short topic label from a question string
function topicFromQuestion(question) {
  const cleaned = question
    .replace(/^(why|how|what|when|where|who|is|are|can|do|does|did)\s+/i, '')
    .replace(/[?!.]/g, '')
    .trim()
  return cleaned.length > 32 ? cleaned.slice(0, 32) + '\u2026' : cleaned
}

let nextId = 1
function uid() { return nextId++ }

function clearNewFlags(nodes) {
  return nodes.map((n) => ({
    ...n,
    isNew: false,
    children: n.children ? clearNewFlags(n.children) : [],
  }))
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [treeNodes, setTreeNodes] = useState([])
  const [isThinking, setIsThinking] = useState(false)

  function handleSendMessage(text) {
    const userMsg = { id: uid(), role: 'user', content: text }

    setMessages((prev) => [...prev, userMsg])
    setIsThinking(true)

    // Add a knowledge tree node for the question
    const newNode = {
      id: uid(),
      label: topicFromQuestion(text),
      isNew: true,
      children: [],
    }

    setTreeNodes((prev) => {
      if (prev.length === 0) {
        // First question becomes a root node
        return [newNode]
      }
      // Subsequent questions branch off the last root node
      const updated = [...prev]
      const last = { ...updated[updated.length - 1] }
      last.children = [...(last.children || []), newNode]
      updated[updated.length - 1] = last
      return updated
    })

    // Placeholder AI response
    setTimeout(() => {
      const placeholder = {
        id: uid(),
        role: 'assistant',
        content:
          "That\u2019s a wonderful question! \uD83C\uDF1F I\u2019m still learning how to answer \u2014 but your curiosity just grew your knowledge tree! Keep exploring.",
      }
      setMessages((prev) => [...prev, placeholder])
      setIsThinking(false)

      // Remove "new" badge after a moment
      setTreeNodes((prev) => clearNewFlags(prev))
    }, 1500)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <KnowledgeTree nodes={treeNodes} />
      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
      />
    </div>
  )
}
