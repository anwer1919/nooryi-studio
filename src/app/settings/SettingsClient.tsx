"use client"
import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { User, Mail, Phone, Lock, Loader2, CheckCircle2, Settings, CalendarCheck, Home, Music, LogOut, Eye, EyeOff } from "lucide-react"

export default function SettingsClient({ user }: { user: { name: string; email: string; phone: string } }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone })
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [showPw, setShowPw] = useState(false)
  const inputCls = "w-full pr-10 pl-4 py-3 border border-line bg-card text-fg placeholder:text-muted rounded-xl focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none transition-all"

  const saveProfile = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(null)
    try {
      const r = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profile.name, phone: profile.phone }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "فشل الحفظ")
      setMsg({ ok: true, text: "تم حفظ التغييرات بنجاح" })
    } catch (err) { setMsg({ ok: false, text: err.message }) } finally { setLoading(false) }
  }

  const savePassword = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(null)
    if (pw.next !== pw.confirm) { setMsg({ ok: false, text: "كلمتا المرور غير متطابقتين" }); setLoading(false); return }
    try {
      const r = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "فشل التغيير")
      setMsg({ ok: true, text: "تم تغيير كلمة المرور بنجاح" })
      setPw({ current: "", next: "", confirm: "" })
    } catch (err) { setMsg({ ok: false, text: err.message }) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg pt-24 md:pt-28 pb-16" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 text-[#F5A623] text-xs font-bold mb-2"><Settings size={14} /> إعدادات الحساب</div>
          <h1 className="text-2xl md:text-3xl font-black text-fg">إدارة حسابك</h1>
          <p className="text-muted text-sm mt-1">عدّل بياناتك الشخصية وكلمة المرور</p>
        </div>
        {msg && (<div className={`p-4 rounded-xl border flex items-center gap-2 text-sm font-bold ${msg.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}><CheckCircle2 size={16} /> {msg.text}</div>)}
        <div className="bg-card border border-line rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-fg text-2xl font-black">{(user.name || "م").charAt(0)}</div>
            <div className="flex-1 min-w-0"><p className="text-lg font-black text-fg truncate">{user.name || "مستخدم Nooryi"}</p><p className="text-sm text-muted truncate" dir="ltr">{user.email}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5">
            <Link href="/" className="flex items-center justify-center gap-2 py-2.5 bg-card border border-line rounded-xl text-xs font-bold text-muted hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><Home size={14} /> الرئيسية</Link>
            <Link href="/artists" className="flex items-center justify-center gap-2 py-2.5 bg-card border border-line rounded-xl text-xs font-bold text-muted hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><Music size={14} /> الفنانين</Link>
            <Link href="/my-bookings" className="flex items-center justify-center gap-2 py-2.5 bg-card border border-line rounded-xl text-xs font-bold text-muted hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><CalendarCheck size={14} /> حجوزاتي</Link>
          </div>
        </div>
        <form onSubmit={saveProfile} className="bg-card border border-line rounded-2xl p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-black text-fg flex items-center gap-2"><User size={18} className="text-[#F5A623]" /> البيانات الشخصية</h2>
          <div><label className="block text-sm font-bold text-muted mb-2">الاسم الكامل</label><div className="relative"><User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" /><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={inputCls} placeholder="اسمك الكامل" /></div></div>
          <div><label className="block text-sm font-bold text-muted mb-2">رقم الهاتف</label><div className="relative"><Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" /><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className={inputCls} placeholder="01xxxxxxxxx" dir="ltr" /></div></div>
          <div><label className="block text-sm font-bold text-muted mb-2">البريد الإلكتروني (لا يمكن تعديله)</label><div className="relative"><Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" /><input value={user.email} disabled className={inputCls + " opacity-50 cursor-not-allowed"} dir="ltr" /></div></div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#F5A623] text-fg font-black rounded-xl hover:bg-[#E8961A] transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-[0.97]">{loading ? <Loader2 size={18} className="animate-spin" /> : "حفظ التغييرات"}</button>
        </form>
        <form onSubmit={savePassword} className="bg-card border border-line rounded-2xl p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-black text-fg flex items-center gap-2"><Lock size={18} className="text-[#F5A623]" /> تغيير كلمة المرور</h2>
          <div><label className="block text-sm font-bold text-muted mb-2">كلمة المرور الحالية</label><div className="relative"><Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" /><input type={showPw ? "text" : "password"} value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} className={inputCls} placeholder="••••••••" dir="ltr" /></div></div>
          <div><label className="block text-sm font-bold text-muted mb-2">كلمة المرور الجديدة</label><div className="relative"><Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" /><input type={showPw ? "text" : "password"} value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} className={inputCls} placeholder="••••••••" dir="ltr" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-[#F5A623]">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div><label className="block text-sm font-bold text-muted mb-2">تأكيد كلمة المرور</label><div className="relative"><Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" /><input type={showPw ? "text" : "password"} value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} className={inputCls} placeholder="••••••••" dir="ltr" /></div></div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-card border border-[#F5A623]/30 text-[#F5A623] font-black rounded-xl hover:bg-[#F5A623]/10 transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-[0.97]">{loading ? <Loader2 size={18} className="animate-spin" /> : "تغيير كلمة المرور"}</button>
        </form>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full py-3.5 bg-card border border-red-500/20 text-red-400 font-black rounded-xl hover:bg-red-500/10 transition-all flex justify-center items-center gap-2"><LogOut size={18} /> تسجيل الخروج</button>
      </div>
    </div>
  )
}
