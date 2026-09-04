import { prisma } from "@/lib/prisma"
import { Facebook, Instagram, Youtube, MessageCircle, Send } from "lucide-react"

export default async function SocialLinks() {
  let settings: any = null
  try {
    settings = await prisma.siteSetting.findUnique({
      where: { id: "site_settings" }
    })
  } catch (error) {
    console.error("Error fetching social settings:", error)
  }

  const socials = [
    { name: "facebook", icon: Facebook, url: settings?.facebook, color: "hover:text-blue-500" },
    { name: "instagram", icon: Instagram, url: settings?.instagram, color: "hover:text-pink-500" },
    { name: "youtube", icon: Youtube, url: settings?.youtube, color: "hover:text-red-500" },
    { name: "tiktok", icon: null, url: settings?.tiktok, color: "hover:text-white" },
    { name: "whatsapp", icon: MessageCircle, url: settings?.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}` : null, color: "hover:text-green-500" },
    { name: "twitter", icon: Send, url: settings?.twitter, color: "hover:text-gray-900 dark:hover:text-white" },
  ].filter(s => s.url)

  if (socials.length === 0) return null

  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.url!}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 ${social.color} hover:border-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/20 hover:scale-110 transition-all duration-300`}
          aria-label={social.name}
        >
          {social.icon ? (
            <social.icon size={18} />
          ) : social.name === "tiktok" ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12.53.02C13.84 0 15.14.01 16.44.02c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.76v4.04c-1.72.14-3.43.66-4.74 1.73-1.3 1.08-2.27 2.59-2.68 4.29H14v1h-2v-1h-1c-.33 0-.67-.01-1-.03-1.4-.09-2.74-.71-3.75-1.72-1.08-1.08-1.73-2.6-1.78-4.16h3v-1H5.5c.05-1.57.7-3.08 1.78-4.16C8.4 1.29 10 .67 11.53.58c.33-.02.67-.03 1-.03zM9 15h6v4H9z"/>
            </svg>
          ) : null}
        </a>
      ))}
    </div>
  )
}