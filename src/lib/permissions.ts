// نظام الأذونات المركزي
export const PERMISSIONS = {
  VIEW_ALL_ARTISTS: "view_all_artists",
  EDIT_ANY_ARTIST: "edit_any_artist",
  DELETE_ANY_ARTIST: "delete_any_artist",
  VIEW_ALL_BOOKINGS: "view_all_bookings",
  APPROVE_ANY_BOOKING: "approve_any_booking",
  REJECT_ANY_BOOKING: "reject_any_booking",
  MANAGE_ANY_CALENDAR: "manage_any_calendar",
  MANAGE_ANY_PRICING: "manage_any_pricing",
  VIEW_ALL_STATS: "view_all_stats",
  MANAGE_USERS: "manage_users",
  MANAGE_ADMINS: "manage_admins",
  MANAGE_PERMISSIONS: "manage_permissions",
  MANAGE_SETTINGS: "manage_settings",
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.VIEW_ALL_ARTISTS,
    PERMISSIONS.EDIT_ANY_ARTIST,
    PERMISSIONS.VIEW_ALL_BOOKINGS,
    PERMISSIONS.APPROVE_ANY_BOOKING,
    PERMISSIONS.REJECT_ANY_BOOKING,
    PERMISSIONS.MANAGE_ANY_CALENDAR,
    PERMISSIONS.MANAGE_ANY_PRICING,
    PERMISSIONS.VIEW_ALL_STATS,
    PERMISSIONS.MANAGE_ADMINS,
  ],
  ARTIST_MANAGER: [],
}

export const MENU_PERMISSIONS: Record<string, Permission> = {
  "/admin/artists": PERMISSIONS.VIEW_ALL_ARTISTS,
  "/admin/bookings": PERMISSIONS.VIEW_ALL_BOOKINGS,
  "/admin/calendar": PERMISSIONS.MANAGE_ANY_CALENDAR,
  "/admin/pricing": PERMISSIONS.MANAGE_ANY_PRICING,
  "/admin/stats": PERMISSIONS.VIEW_ALL_STATS,
  "/admin/users": PERMISSIONS.MANAGE_USERS,
  "/admin/admins": PERMISSIONS.MANAGE_ADMINS,
  "/admin/permissions": PERMISSIONS.MANAGE_PERMISSIONS,
  "/admin/settings": PERMISSIONS.MANAGE_SETTINGS,
}

export function hasPermission(
  userRole: string,
  userPermissions: string[],
  requiredPermission: Permission
): boolean {
  if (userRole === "SUPER_ADMIN") return true
  return userPermissions.includes(requiredPermission)
}

export function canAccessPage(
  userRole: string,
  userPermissions: string[],
  href: string
): boolean {
  if (userRole === "SUPER_ADMIN") return true
  if (href === "/admin") return true
  const requiredPermission = MENU_PERMISSIONS[href]
  if (!requiredPermission) return false
  return hasPermission(userRole, userPermissions, requiredPermission)
}

export function canManageArtist(
  userRole: string,
  userPermissions: string[],
  userArtistId: string | undefined | null,
  targetArtistId: string
): boolean {
  if (userRole === "SUPER_ADMIN") return true
  if (userRole === "ADMIN" && userPermissions.includes(PERMISSIONS.EDIT_ANY_ARTIST)) return true
  if (userRole === "ARTIST_MANAGER" && userArtistId === targetArtistId) return true
  return false
}

// ✅ الدوال المساعدة المطلوبة
export function isAdmin(userRole: string): boolean {
  return userRole === "SUPER_ADMIN" || userRole === "ADMIN"
}

export function isSuperAdmin(userRole: string): boolean {
  return userRole === "SUPER_ADMIN"
}

export function isArtistManager(userRole: string): boolean {
  return userRole === "ARTIST_MANAGER"
}

export function getEffectivePermissions(
  userRole: string,
  userPermissions: string[]
): Permission[] {
  if (userRole === "SUPER_ADMIN") return Object.values(PERMISSIONS)
  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[userRole] || []
  const allPerms = new Set([...defaultPerms, ...userPermissions])
  return Array.from(allPerms)
}

export function hasEffectivePermission(
  userRole: string,
  userPermissions: string[],
  requiredPermission: Permission
): boolean {
  if (userRole === "SUPER_ADMIN") return true
  const effectivePerms = getEffectivePermissions(userRole, userPermissions)
  return effectivePerms.includes(requiredPermission)
}