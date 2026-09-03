import { prisma } from "@/lib/prisma";
import { Users, Mail, Phone, Calendar, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let users: any[] = [];
  let customers: any[] = [];
  
  try {
    // جلب المستخدمين (USER فقط)
    users = await prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
    });
  } catch (e: any) {
    console.error("Users error:", e);
  }

  try {
    // جلب العملاء من جدول Customer (الذين يحجزون)
    customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: true } },
      },
    }).catch(() => []);
  } catch (e: any) {
    console.error("Customers error:", e);
  }

  const stats = {
    registered: users.length,
    customers: customers.length,
    total: users.length + customers.length,
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <div className="badge-gold mb-3">إدارة المستخدمين</div>
        <h1 className="text-4xl font-black text-gray-900">المستخدمين والعملاء</h1>
        <p className="text-gray-500 mt-1">إجمالي {stats.total} حساب ({stats.registered} مسجل + {stats.customers} عميل)</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">حسابات مسجلة</span>
            <Users size={20} className="text-[#b8941f]" />
          </div>
          <div className="stat-value">{stats.registered}</div>
          <p className="text-xs text-gray-500 mt-1">USER</p>
        </div>
        <div className="stat-card dark">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">عملاء</span>
            <UserPlus size={20} />
          </div>
          <div className="stat-value">{stats.customers}</div>
          <p className="text-xs text-gray-400 mt-1">CUSTOMER</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">الإجمالي</span>
            <Calendar size={20} className="text-[#b8941f]" />
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
      </div>

      {/* المستخدمون المسجلون */}
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} className="text-[#b8941f]" />
          المستخدمون المسجلون ({users.length})
        </h2>
        {users.length === 0 ? (
          <div className="card-pro text-center py-10">
            <p className="text-gray-500">لا يوجد مستخدمون مسجلون</p>
          </div>
        ) : (
          <div className="card-pro overflow-hidden">
            <table className="table-pro">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الهاتف</th>
                  <th>تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="icon-circle">
                          <Users size={18} />
                        </div>
                        <p className="font-black text-gray-900">{u.name || "مستخدم"}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm" dir="ltr">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-700">{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm" dir="ltr">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-gray-700">{u.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* العملاء */}
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-[#b8941f]" />
          العملاء ({customers.length})
        </h2>
        {customers.length === 0 ? (
          <div className="card-pro text-center py-10">
            <p className="text-gray-500">لا يوجد عملاء بعد</p>
          </div>
        ) : (
          <div className="card-pro overflow-hidden">
            <table className="table-pro">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>البريد الإلكتروني</th>
                  <th>الهاتف</th>
                  <th>عدد الحجوزات</th>
                  <th>تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="icon-circle dark">
                          <UserPlus size={18} />
                        </div>
                        <p className="font-black text-gray-900">{c.name || "عميل"}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm" dir="ltr">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-700">{c.email || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm" dir="ltr">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-gray-700">{c.phone || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-[#b8941f]" />
                        <span className="font-black">{c._count?.bookings || 0}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("ar-EG") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}