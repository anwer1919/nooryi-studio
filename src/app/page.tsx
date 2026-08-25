"use client"

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <div style={{ padding: "50px", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#1a0a04", color: "white" }}>
      <h1 style={{ fontSize: "40px", color: "#EAB308", marginBottom: "20px" }}>
        🎉 مبروك! Nooryi Studio يعمل بنجاح 🎉
      </h1>
      <p style={{ fontSize: "20px", marginBottom: "30px" }}>
        تم تجاوز جميع أخطاء البناء. الموقع حي ويعمل على Vercel.
      </p>
      <a href="/login" style={{ backgroundColor: "#EAB308", color: "black", padding: "15px 30px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
        اذهب لتسجيل الدخول
      </a>
    </div>
  )
}
