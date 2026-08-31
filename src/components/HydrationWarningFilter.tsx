"use client"

import { useEffect } from "react"

export default function HydrationWarningFilter() {
  useEffect(() => {
    // حفظ الدوال الأصلية
    const originalError = console.error
    const originalWarn = console.warn

    // فلترة تحذيرات Hydration فقط
    console.error = (...args: any[]) => {
      const message = args.join(" ")
      
      // تجاهل تحذيرات Hydration #441 فقط
      if (message.includes("Minified React error #441")) {
        return
      }
      
      // عرض جميع الأخطاء الأخرى
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const message = args.join(" ")
      
      // تجاهل تحذيرات Hydration
      if (message.includes("hydrat") || message.includes("Hydrat")) {
        return
      }
      
      // عرض جميع التحذيرات الأخرى
      originalWarn.apply(console, args)
    }

    // تنظيف عند إلغاء تحميل المكون
    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return null
}