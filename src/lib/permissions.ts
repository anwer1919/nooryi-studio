import { prisma } from "./prisma"

export interface UserWithRole {
  id: string
  role: string
  artistId?: string | null
}

// التحقق من أن المستخدم سوبر أدمن
export function isSuperAdmin(user: UserWithRole | null): boolean {
  return user?.role === "SUPER_ADMIN"
}

// التحقق من أن المستخدم أدمن فنان
export function isArtistAdmin(user: UserWithRole | null): boolean {
  return user?.role === "ARTIST_ADMIN" && !!user?.artistId
}

// التحقق من أن المستخدم أدمن (سوبر أو فنان)
export function isAdmin(user: UserWithRole | null): boolean {
  return isSuperAdmin(user) || isArtistAdmin(user)
}

// فلترة where condition حسب صلاحيات المستخدم
export function filterByArtistAccess(user: UserWithRole | null) {
  if (isSuperAdmin(user)) {
    return {} // لا فلترة - يشوف الكل
  }
  
  if (isArtistAdmin(user)) {
    return { artistId: user!.artistId } // يشوف فنان واحد فقط
  }
  
  // لو مش أدمن، يرجع شرط مستحيل
  return { artistId: "impossible-id" }
}