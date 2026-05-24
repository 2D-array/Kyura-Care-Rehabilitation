"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Bot, Clock, MessageSquare, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser } from "@/context/UserContext"
import { toast } from "sonner"

interface Message {
  id: string
  appointment_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: {
    first_name?: string
    last_name?: string
    role?: string
  }
}

interface ChatPanelProps {
  appointmentId: string
  onClose?: () => void
}

export function ChatPanel({ appointmentId }: ChatPanelProps) {
  const { profile, session } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async (showLoading = false) => {
    if (!session?.access_token) return
    if (showLoading) setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/${appointmentId}/messages`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error("Failed to load chat history:", err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Fetch messages initially and poll every 3 seconds for real-time effect
  useEffect(() => {
    fetchMessages(true)

    // Mark messages as read on panel load
    const markAsRead = async () => {
      if (!session?.access_token) return
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/${appointmentId}/messages/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
      } catch (err) {
        console.error("Failed to mark messages as read:", err)
      }
    }
    markAsRead()

    const interval = setInterval(() => {
      fetchMessages(false)
    }, 3000)

    return () => clearInterval(interval)
  }, [appointmentId, session])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session?.access_token) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/${appointmentId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data])
      } else {
        toast.error("Failed to deliver message.")
        setNewMessage(content) // Restore input on failure
      }
    } catch (err) {
      console.error("Error sending message:", err)
      toast.error("Network issue. Failed to send message.")
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/5 shadow-2xl">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center gap-2 bg-slate-50 dark:bg-slate-950/20 shrink-0">
        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Session Chat Panel</h3>
          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3 text-indigo-500" /> End-to-end encrypted room notes
          </p>
        </div>
      </div>

      {/* Messages Logs Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-indigo-500/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-slate-400 font-medium">Opening secure message logs...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
            <Bot className="w-10 h-10 text-indigo-500/30" />
            <p className="text-xs font-bold text-slate-400">No session notes yet</p>
            <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed">
              Send treatment details or feedback here. These logs will remain accessible under appointments.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map(msg => {
                const isMe = msg.sender_id === profile?.id
                const senderName = msg.sender?.first_name || "Member"
                const senderInit = senderName[0].toUpperCase()

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm uppercase">
                        {senderInit}
                      </div>
                    )}
                    <div className="flex flex-col max-w-[75%] space-y-1">
                      <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed break-words shadow-sm relative ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-white/5"
                      }`}>
                        {msg.content}
                      </div>
                      <span className={`text-[9px] text-slate-400 font-semibold flex items-center gap-1 px-1 ${isMe ? "self-end" : "self-start"}`}>
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box Footer */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your secure notes..."
            disabled={sending || loading}
            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-10 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <Button
            type="submit"
            disabled={sending || loading || !newMessage.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white p-0 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/10"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>

    </div>
  )
}
