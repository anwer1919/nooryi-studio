"use client"

export default function HomePage() {
  return (
    <div style={{ padding: "50px", textAlign: "center", minHeight: "100vh", backgroundColor: "#1a0a04", color: "white" }}>
      <h1 style={{ fontSize: "40px", color: "#EAB308" }}>🎉 مبروك! Nooryi Studio يعمل بنجاح</h1>
      <p style={{ fontSize: "20px", marginTop: "20px" }}>تم البدء من جديد بنجاح.</p>
      <a href="/login" style={{ display: "inline-block", marginTop: "30px", backgroundColor: "#EAB308", color: "black", padding: "15px 30px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
        اذهب لتسجيل الدخول
      </a>
    </div>
  )
}