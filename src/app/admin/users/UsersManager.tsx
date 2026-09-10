"use client"

import { useState, useEffect } from "react"
import { Shield, Key, RefreshCw, CheckCircle2, XCircle, Eye, EyeOff, Music, UserPlus } from "lucide-react"

interface Artist { id: string; name: string; slug: string }
interface User {
  id: string; email: string; name: string | null; role: string
  phone: string | null; artistId: string | null; createdAt: string
  managedArtist: Artist | null
}

const ROLE_LABELS: Record<string, string> = { SUPER_ADMIN: "مدير عام", ADMIN: "مشرف", ARTIST_MANAGER: "مدير أعمال", USER: "مستخدم" }
const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800",
  ADMIN: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800",
  ARTIST_MANAGER: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800",
  USER: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700",
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [showPasswordFor, setShowPasswordFor] = useState<string | null>(null)
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)
  const [changingRoleFor, setChangingRoleFor] = useState<string | null>(null)
  const [assigningArtistFor, setAssigningArtistFor] = useState<string | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<Record<string, string>>({})

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, artistsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/artists"),
      ])
      const usersData = await usersRes.json()
      const artistsData = await artistsRes.json()
      if (usersData.users) setUsers(usersData.users)
      if (artistsData.artists) setArtists(artistsData.artists)
      else if (Array.isArray(artistsData)) setArtists(artistsData)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleResetPassword = async (userId: string) => {
    const pw = newPasswords[userId]
    if (!pw || pw.length < 6) { setMessage({ type: "error", text: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }); return }
    setResettingId(userId); setMessage(null)
    try {
      const res = await fetch("/api/admin/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, newPassword: pw }) })
      const data = await res.json()
      if (data.success) { setMessage({ type: "success", text: data.message }); setNewPasswords(p => ({ ...p, [userId]: "" })); setShowPasswordFor(null) }
      else setMessage({ type: "error", text: data.error })
    } catch { setMessage({ type: "error", text: "فشل إعادة التعيين" }) }
    finally { setResettingId(null) }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRoleFor(userId); setMessage(null)
    try {
      const res = await fetch("/api/admin/users/" + userId + "/role", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) })
      const data = await res.json()
      if (data.success) { setMessage({ type: "success", text: "تم تحديث الدور بنجاح" }); fetchData() }
      else setMessage({ type: "error", text: data.error })
    } catch { setMessage({ type: "error", text: "فشل تحديث الدور" }) }
    finally { setChangingRoleFor(null) }
  }

  const handleAssignArtist = async (userId: string) => {
    const artistId = selectedArtist[userId]
    if (!artistId) { setMessage({ type: "error", text: "اختر فناناً أولاً" }); return }
    setAssigningArtistFor(userId); setMessage(null)
    try {
      const res = await fetch("/api/admin/users/" + userId + "/assign-artist", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ artistId }) })
      const data = await res.json()
      if (data.success) { setMessage({ type: "success", text: "تم ربط مدير الأعمال بالفنان بنجاح" }); fetchData() }
      else setMessage({ type: "error", text: data.error })
    } catch { setMessage({ type: "error", text: "فشل الربط" }) }
    finally { setAssigningArtistFor(null) }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#"
    let pw = ""; for (let i = 0; i < 10; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length)); return pw
  }

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw size={32} className="animate-spin text-[#F5A623]" /></div>

  const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 ${message.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-800"}`}>
          {message.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />} {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} مستخدم | {artists.length} فنان</p>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl text-sm font-bold hover:bg-gray-200 transition"><RefreshCw size={14} /> تحديث</button>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center">
                  <span className="text-lg font-black text-[#111]">{(user.name || user.email).charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white">{user.name || "بدون اسم"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">{user.email}</p>
                  {user.managedArtist && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-0.5">
                      <Music size={10} /> يدير: <strong>{user.managedArtist.name}</strong>
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[user.role] || ROLE_COLORS.USER}`}>
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>

            <div className="px-5 pb-5 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
              {/* تغيير الدور */}
              {user.role !== "SUPER_ADMIN" && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Shield size={12} /> الدور:</span>
                  {["USER", "ARTIST_MANAGER", "ADMIN"].map((role) => (
                    <button key={role} onClick={() => handleRoleChange(user.id, role)} disabled={changingRoleFor === user.id || user.role === role}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${user.role === role ? "bg-[#F5A623]/20 text-[#E8961A] cursor-default" : "bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 hover:bg-gray-200"}`}>
                      {ROLE_LABELS[role]}
                    </button>
                  ))}
                  {changingRoleFor === user.id && <RefreshCw size={12} className="animate-spin text-[#F5A623]" />}
                </div>
              )}

              {/* ربط بفنان (لمديري الأعمال) */}
              {(user.role === "ARTIST_MANAGER" || assigningArtistFor === user.id) && (
                <div className="flex items-center gap-2 flex-wrap bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1"><UserPlus size={12} /> ربط بفنان:</span>
                  <select value={selectedArtist[user.id] || user.artistId || ""} onChange={(e) => setSelectedArtist(p => ({ ...p, [user.id]: e.target.value }))}
                    className="px-3 py-2 border border-purple-200 dark:border-purple-700 dark:bg-[#1a1a1a] dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-[#F5A623] min-w-[180px]">
                    <option value="">-- اختر فنان --</option>
                    {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <button onClick={() => handleAssignArtist(user.id)} disabled={assigningArtistFor === user.id || !selectedArtist[user.id]}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg text-xs font-black hover:shadow-lg transition disabled:opacity-50 flex items-center gap-1">
                    {assigningArtistFor === user.id ? <RefreshCw size={12} className="animate-spin" /> : <Music size={12} />} ربط
                  </button>
                  {user.managedArtist && <span className="text-xs text-purple-600 dark:text-purple-400">← حالياً: {user.managedArtist.name}</span>}
                </div>
              )}

              {/* كلمة المرور */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Key size={12} /> كلمة المرور:</span>
                <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                  <input type={showPasswordFor === user.id ? "text" : "password"} value={newPasswords[user.id] || ""}
                    onChange={(e) => setNewPasswords(p => ({ ...p, [user.id]: e.target.value }))} placeholder="كلمة مرور جديدة (6+)"
                    className={inputClass + " pr-8"} />
                  <button type="button" onClick={() => setShowPasswordFor(showPasswordFor === user.id ? null : user.id)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswordFor === user.id ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button type="button" onClick={() => setNewPasswords(p => ({ ...p, [user.id]: generatePassword() }))}
                  className="px-3 py-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg text-xs font-bold hover:bg-gray-200 transition">🎲 توليد</button>
                <button onClick={() => handleResetPassword(user.id)} disabled={resettingId === user.id || !newPasswords[user.id]}
                  className="px-4 py-2 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#111] rounded-lg text-xs font-black hover:shadow-lg transition disabled:opacity-50 flex items-center gap-1">
                  {resettingId === user.id ? <RefreshCw size={12} className="animate-spin" /> : <Key size={12} />} تعيين
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}