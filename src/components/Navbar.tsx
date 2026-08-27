"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode, useState, useEffect } from "react"

export function Providers({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // أثناء التحميل الأول، عرض الأطفال بدون SessionProvider
  // هذا يمنع Hydration mismatch
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}