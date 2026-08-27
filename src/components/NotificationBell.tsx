"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Check, CheckCheck, X } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  link?: string
}

export default function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user) return

    const fetchNotifications = () => {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.notifications) {
            setNotifications(data.notifications)
            setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length)
          }
        })
        .catch(() => {})
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [session?.user])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (!session?.user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-80 glass rounded-2xl z-50 shadow-2xl border border-white/10 max-h-96 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="font-bold text-sm">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300"
                  >
                    <CheckCheck size={12} />
                    قراءة الكل
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-sm">
                  لا توجد إشعارات بعد
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                      !notification.isRead ? "bg-yellow-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{notification.title}</p>
                        <p className="text-xs text-white/60 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-white/40 mt-1">
                          {new Date(notification.createdAt).toLocaleString("ar-EG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}