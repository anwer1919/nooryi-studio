"use client"

import { useEffect } from "react"

export default function HydrationWarningFilter() {
  useEffect(() => {
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args: any[]) => {
      const message = args.join(" ")
      if (message.includes("Minified React error #441")) return
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const message = args.join(" ")
      if (message.includes("hydrat") || message.includes("Hydrat")) return
      originalWarn.apply(console, args)
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return null
}