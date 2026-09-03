// نظام الأذونات المركزي
export const PERMISSIONS = {
  // الفنانين
  VIEW_ALL_ARTISTS: "view_all_artists",
  EDIT_ANY_ARTIST: "edit_any_artist",
  DELETE_ANY_ARTIST: "delete_any_artist",
  
  // الحجوزات
  VIEW_ALL_BOOKINGS: "view_all_bookings",
  APPROVE_ANY_BOOKING: "approve_any_booking",
  REJECT_ANY_BOOKING: "reject_any_booking",
  
  // التقويم
  MANAGE_ANY_CALENDAR: "manage_any_calendar",
  
  // التسعير
  MANAGE_ANY_PRICING: "manage_any_pricing",
  
  // التقارير
  VIEW_ALL_STATS: "view_all_stats",
  
  // المستخدمين
  MANAGE_USERS: "manage_users",
  MANAGE_ADMINS: "manage_admins",
  MANAGE_PERMISSIONS: "manage_permissions",
  
  // الإعدادات
  MANAGE_SETTINGS: "manage_settings",
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// الأذونات الافتراضية لكل دور
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS), // كل الصلاحيات
  
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
  
  ARTIST_MANAGER: [
    // لا أذونات افتراضية - يحددها السوبر أدمن
  ],
}

// خريطة الأذونات للقائمة الجانبية
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

// دالة للتحقق من الصلاحية
export function hasPermission(
  userRole: string,
  userPermissions: string[],
  requiredPermission: Permission
): boolean {
  // السوبر أدمن له كل الصلاحيات
  if (userRole === "SUPER_ADMIN") return true
  
  // التحقق من الأذونات المحددة
  return userPermissions.includes(requiredPermission)
}

// دالة للتحقق من صلاحية الوصول لصفحة
export function canAccessPage(
  userRole: string,
  userPermissions: string[],
  href: string
): boolean {
  // السوبر أدمن يصل لكل الصفحات
  if (userRole === "SUPER_ADMIN") return true
  
  // الصفحة الرئيسية متاحة للجميع
  if (href === "/admin") return true
  
  const requiredPermission = MENU_PERMISSIONS[href]
  if (!requiredPermission) return false
  
  return hasPermission(userRole, userPermissions, requiredPermission)
}

// دالة للتحقق من صلاحية إدارة فنان محدد
export function canManageArtist(
  userRole: string,
  userPermissions: string[],
  userArtistId: string | undefined | null,
  targetArtistId: string
): boolean {
  // السوبر أدمن يدير كل الفنانين
  if (userRole === "SUPER_ADMIN") return true
  
  // الأدمن العادي يدير كل الفنانين
  if (userRole === "ADMIN" && userPermissions.includes(PERMISSIONS.EDIT_ANY_ARTIST)) {
    return true
  }
  
  // مدير الأعمال يدير فنانته فقط
  if (userRole === "ARTIST_MANAGER" && userArtistId === targetArtistId) {
    return true
  }
  
  return false
}