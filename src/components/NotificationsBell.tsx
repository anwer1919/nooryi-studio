"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Bell } from "lucide-react"

export default function NotificationsBell() {
  const { status } = useSession()
  const [unread, setUnread] = useState(0)

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications")
      const d = await r.json()
      setUnread(d.unread || 0)
    } catch {}
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      load()
      const iv = setInterval(load, 30000)
      return () => clearInterval(iv)
    }
  }, [status, load])

  if (status !== "authenticated") return null

  return (
    <Link href="/notifications" aria-label="الإشعارات" className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-card border border-line rounded-xl text-[#F5A623] hover:border-[#F5A623] hover:bg-surface transition">
      <Bell size={17} />
      {unread > 0 && (
        <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  )
}
