"use client"
import { useState, useTransition } from "react"
import { updateUserSettings } from "./actions"
import { User, Mail, Phone, Save, Loader2, CheckCircle } from "lucide-react"

export default function SettingsForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await updateUserSettings(formData)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle size={20} /> تم حفظ التغييرات بنجاح
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><User size={16}/> الاسم الكامل</label>
        <input name="name" defaultValue={user?.name || ""} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mail size={16}/> البريد الإلكتروني</label>
        <input name="email" type="email" defaultValue={user?.email || ""} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Phone size={16}/> رقم الجوال</label>
        <input name="phone" type="tel" defaultValue={user?.phone || ""} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none" placeholder="01xxxxxxxxx" />
      </div>

      <button disabled={isPending} className="w-full py-4 bg-[#111] text-[#d4af37] font-black rounded-xl hover:bg-[#232323] transition flex items-center justify-center gap-2">
        {isPending ? <Loader2 size={20} className="animate-spin"/> : <><Save size={20}/> حفظ التغييرات</>}
      </button>
    </form>
  )
}