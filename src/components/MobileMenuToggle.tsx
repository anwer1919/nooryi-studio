"use client"

export default function MobileMenuToggle() {
  const handleToggle = () => {
    window.dispatchEvent(new CustomEvent("toggle-admin-menu"))
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 hover:bg-gray-100 rounded-lg transition lg:hidden flex items-center justify-center"
      aria-label="فتح القائمة"
    >
      <span className="text-2xl leading-none">☰</span>
    </button>
  )
}