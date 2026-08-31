"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function NavbarClient() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 text-sm font-bold rounded-lg transition"
    >
      <LogOut size={16} />
      خروج
    </button>
  )
}