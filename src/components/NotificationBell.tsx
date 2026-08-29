"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Bell, X, Check, CheckCheck } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  link?: string
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Failed to fetch notifications")
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read")
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return "الآن"
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    return `منذ ${days} يوم`
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "booking_approved": return "✅"
      case "booking_rejected": return "❌"
      case "payment_confirmed": return "💰"
      case "new_booking": return "📅"
      default: return "🔔"
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          width: "44px",
          height: "44px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: isOpen ? "var(--color-primary-50)" : "var(--color-background-subtle)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all var(--transition-fast)"
        }}
        aria-label="الإشعارات"
      >
        <Bell 
          size={20} 
          style={{ 
            color: isOpen ? "var(--color-primary)" : "var(--color-text-secondary)",
            transition: "color var(--transition-fast)"
          }} 
        />
        
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            minWidth: "18px",
            height: "18px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-danger)",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 5px",
            border: "2px solid var(--color-background)"
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="animate-fade-in"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            backgroundColor: "var(--color-background)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-xl)",
            zIndex: 100,
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{
            padding: "var(--space-4) var(--space-5)",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <h3 style={{ 
                fontSize: "var(--text-base)", 
                fontWeight: "700", 
                color: "var(--color-text-primary)",
                margin: 0
              }}>
                الإشعارات
              </h3>
              {unreadCount > 0 && (
                <p style={{ 
                  fontSize: "var(--text-xs)", 
                  color: "var(--color-text-tertiary)",
                  margin: "2px 0 0 0"
                }}>
                  {unreadCount} غير مقروء
                </p>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "transparent",
                  color: "var(--color-primary)",
                  fontSize: "var(--text-xs)",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <CheckCheck size={14} />
                قراءة الكل
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ 
            maxHeight: "400px", 
            overflowY: "auto",
            padding: "var(--space-2)"
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: "var(--space-10) var(--space-4)",
                textAlign: "center"
              }}>
                <Bell 
                  size={40} 
                  style={{ 
                    color: "var(--color-text-tertiary)",
                    margin: "0 auto 12px",
                    opacity: 0.5
                  }} 
                />
                <p style={{ 
                  fontSize: "var(--text-sm)", 
                  color: "var(--color-text-secondary)",
                  margin: 0
                }}>
                  لا توجد إشعارات
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: notification.isRead 
                      ? "transparent" 
                      : "var(--color-primary-50)",
                    marginBottom: "4px",
                    cursor: "pointer",
                    transition: "background-color var(--transition-fast)"
                  }}
                  onClick={() => {
                    if (!notification.isRead) markAsRead(notification.id)
                    if (notification.link) {
                      window.location.href = notification.link
                    }
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: notification.isRead 
                        ? "var(--color-background-subtle)" 
                        : "var(--color-accent-50)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0
                    }}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "8px"
                      }}>
                        <p style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: notification.isRead ? "500" : "700",
                          color: "var(--color-text-primary)",
                          margin: 0,
                          lineHeight: 1.4
                        }}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: "var(--color-primary)",
                            flexShrink: 0,
                            marginTop: "6px"
                          }} />
                        )}
                      </div>
                      
                      <p style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-secondary)",
                        margin: "4px 0",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {notification.message}
                      </p>
                      
                      <p style={{
                        fontSize: "11px",
                        color: "var(--color-text-tertiary)",
                        margin: 0
                      }}>
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: "var(--space-3) var(--space-4)",
              borderTop: "1px solid var(--color-border-light)",
              textAlign: "center"
            }}>
              <Link
                href="/notifications"
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  textDecoration: "none"
                }}
              >
                عرض جميع الإشعارات
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}