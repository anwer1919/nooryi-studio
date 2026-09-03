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
  
  if (userRole === "ADMIN" && userPermissions.includes(PERMISSIONS.EDIT_ANY_ARTIST)) {
    return true
  }
  
  if (userRole === "ARTIST_MANAGER" && userArtistId === targetArtistId) {
    return true
  }
  
  return false
}

// ✅ الدوال المفقودة - مضافة الآن
export function isAdmin(userRole: string): boolean {
  return userRole === "SUPER_ADMIN" || userRole === "ADMIN"
}

export function isSuperAdmin(userRole: string): boolean {
  return userRole === "SUPER_ADMIN"
}

export function isArtistManager(userRole: string): boolean {
  return userRole === "ARTIST_MANAGER"
}

export function isUser(userRole: string): boolean {
  return userRole === "USER"
}

export function getEffectivePermissions(
  userRole: string,
  userPermissions: string[]
): Permission[] {
  if (userRole === "SUPER_ADMIN") {
    return Object.values(PERMISSIONS)
  }
  
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

export function canAccessRoute(
  userRole: string,
  userPermissions: string[],
  pathname: string
): boolean {
  if (userRole === "SUPER_ADMIN") return true
  if (pathname === "/admin") return true
  
  for (const [href, permission] of Object.entries(MENU_PERMISSIONS)) {
    if (pathname === href || pathname.startsWith(href + "/")) {
      return hasEffectivePermission(userRole, userPermissions, permission)
    }
  }
  
  return false
}

export function canManageBooking(
  userRole: string,
  userPermissions: string[],
  userArtistId: string | undefined | null,
  bookingArtistId: string
): boolean {
  if (userRole === "SUPER_ADMIN") return true
  
  if (userRole === "ADMIN") {
    return hasEffectivePermission(
      userRole,
      userPermissions,
      PERMISSIONS.APPROVE_ANY_BOOKING
    )
  }
  
  if (userRole === "ARTIST_MANAGER" && userArtistId === bookingArtistId) {
    return true
  }
  
  return false
}

export const PERMISSIONS_DESCRIPTIONS: Record<Permission, { 
  label: string
  description: string
  group: string
}> = {
  [PERMISSIONS.VIEW_ALL_ARTISTS]: {
    label: "عرض جميع الفنانين",
    description: "الوصول لقائمة جميع الفنانين في النظام",
    group: "الفنانين",
  },
  [PERMISSIONS.EDIT_ANY_ARTIST]: {
    label: "تعديل أي فنان",
    description: "تعديل بيانات أي فنان في النظام",
    group: "الفنانين",
  },
  [PERMISSIONS.DELETE_ANY_ARTIST]: {
    label: "حذف أي فنان",
    description: "حذف أي فنان من النظام",
    group: "الفنانين",
  },
  [PERMISSIONS.VIEW_ALL_BOOKINGS]: {
    label: "عرض جميع الحجوزات",
    description: "الوصول لقائمة جميع الحجوزات",
    group: "الحجوزات",
  },
  [PERMISSIONS.APPROVE_ANY_BOOKING]: {
    label: "الموافقة على أي حجز",
    description: "الموافقة على الحجوزات لأي فنان",
    group: "الحجوزات",
  },
  [PERMISSIONS.REJECT_ANY_BOOKING]: {
    label: "رفض أي حجز",
    description: "رفض الحجوزات لأي فنان",
    group: "الحجوزات",
  },
  [PERMISSIONS.MANAGE_ANY_CALENDAR]: {
    label: "إدارة أي تقويم",
    description: "إدارة التقويم لأي فنان",
    group: "التقويم",
  },
  [PERMISSIONS.MANAGE_ANY_PRICING]: {
    label: "إدارة أي تسعير",
    description: "إدارة الأسعار لأي فنان",
    group: "التسعير",
  },
  [PERMISSIONS.VIEW_ALL_STATS]: {
    label: "عرض جميع التقارير",
    description: "الوصول للتقارير المالية والإحصائيات",
    group: "التقارير",
  },
  [PERMISSIONS.MANAGE_USERS]: {
    label: "إدارة المستخدمين",
    description: "إدارة حسابات المستخدمين العاديين",
    group: "المستخدمين",
  },
  [PERMISSIONS.MANAGE_ADMINS]: {
    label: "إدارة المديرين",
    description: "إضافة/تعديل/حذف مديري الأعمال",
    group: "المستخدمين",
  },
  [PERMISSIONS.MANAGE_PERMISSIONS]: {
    label: "إدارة الصلاحيات",
    description: "تحديد صلاحيات المستخدمين والمديرين",
    group: "النظام",
  },
  [PERMISSIONS.MANAGE_SETTINGS]: {
    label: "إدارة الإعدادات",
    description: "تعديل إعدادات النظام العامة",
    group: "النظام",
  },
}