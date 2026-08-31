"use client"

import { useEffect } from "react"

export default function ConsoleErrorFilter() {
  useEffect(() => {
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args: any[]) => {
      const message = args.join(" ")
      
      // تجاهل أخطاء Hydration و startTime
      if (
        message.includes("Minified React error #441") ||
        message.includes("startTime") ||
        message.includes("hydrat") ||
        message.includes("Hydrat") ||
        message.includes("web-vitals") ||
        message.includes("reportAllChanges")
      ) {
        return
      }
      
      originalError.apply(console, args)
    }
    
    console.warn = (...args: any[]) => {
      const message = args.join(" ")
      
      if (
        message.includes("hydrat") ||
        message.includes("Hydrat") ||
        message.includes("startTime") ||
        message.includes("web-vitals")
      ) {
        return
      }
      
      originalWarn.apply(console, args)
    }
    
    // منع أخطاء unhandled promise rejection
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason?.message || String(event.reason || "")
      if (
        reason.includes("startTime") ||
        reason.includes("hydrat") ||
        reason.includes("#441") ||
        reason.includes("web-vitals")
      ) {
        event.preventDefault()
      }
    })
    
    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])
  
  return null
}