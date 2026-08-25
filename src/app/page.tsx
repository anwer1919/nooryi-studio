"use client"

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <div style={{ padding: "50px", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontSize: "40px", color: "#EAB308", marginBottom: "20px" }}>
        🎉 مبروك! Nooryi Studio يعمل بنجاح 🎉
      </h1>
      <p style={{ fontSize: "20px", color: "white", marginBottom: "30px" }}>
        تم تجاوز جميع أخطاء البناء بنجاح. الموقع حي ويعمل على Vercel.
      </p>
      <a 
        href="/login" 
        style={{ 
          backgroundColor: "#EAB308", 
          color: "black", 
          padding: "15px 30px", 
          borderRadius: "8px", 
          textDecoration: "none", 
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        اذهب لتسجيل الدخول
      </a>
    </div>
  )
}