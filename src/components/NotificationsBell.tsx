"use client"

import { useEffect, useState, useRef } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function NotificationsBell() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // جلب الإشعارات - فقط لو المستخدم مسجل دخول
  const fetchNotifications = async () => {
    // مهم جداً: لا تحاول الجلب لو المستخدم مش مسجل
    if (status !== "authenticated" || !session?.user) {
      return
    }
    
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      // لا تعرض خطأ في الكونسول لو فشلت العملية
      // console.error("Failed to fetch notifications")
    }
  }

  // جلب الإشعارات عند تسجيل الدخول
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchNotifications()
      // تحديث كل 30 ثانية
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    } else {
      // مسح الإشعارات عند تسجيل الخروج
      setNotifications([])
      setUnreadCount(0)
    }
  }, [status, session?.user])

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // تحديث عند تغيير الصفحة
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // تحديد إشعار كمقروء
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      // تجاهل الأخطاء
    }
  }

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/all/read", { method: "POST" })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      // تجاهل الأخطاء
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "الآن"
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    return date.toLocaleDateString("ar-EG")
  }

  // لا تعرض الجرس لو المستخدم مش مسجل دخول
  if (status !== "authenticated" || !session?.user) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-400 hover:text-yellow-500 transition rounded-lg hover:bg-neutral-800"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h3 className="font-bold text-white">الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400 transition"
              >
                <CheckCheck size={14} />
                قراءة الكل
              </button>
            )}
          </div>

          {/* قائمة الإشعارات */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                <Bell className="mx-auto mb-3 opacity-50" size={32} />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={`p-4 border-b border-neutral-800 cursor-pointer transition ${
                    notification.isRead
                      ? "bg-neutral-900"
                      : "bg-yellow-500/5 hover:bg-yellow-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${notification.isRead ? "bg-neutral-600" : "bg-yellow-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold mb-1 ${notification.isRead ? "text-neutral-400" : "text-white"}`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs leading-relaxed ${notification.isRead ? "text-neutral-500" : "text-neutral-300"}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-500 mt-2">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}