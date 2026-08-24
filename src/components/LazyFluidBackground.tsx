"use client"

import dynamic from "next/dynamic"

const FluidBackground = dynamic(() => import("./FluidBackground"), {
  ssr: false,
  loading: () => (
    <div 
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background: "#1a0a04",
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(255, 122, 42, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(255, 206, 90, 0.1) 0%, transparent 50%)
        `,
      }}
    />
  ),
})

export default FluidBackground