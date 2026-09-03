import { prisma } from "@/lib/prisma";
import { Users, Mail, Phone, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  }).catch(() => []);

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <div className="badge-gold mb-3">إدارة المستخدمين</div>
        <h1 className="text-4xl font-black text-gray-900">المستخدمين</h1>
        <p className="text-gray-500 mt-1">إجمالي {users.length} مستخدم مسجل</p>
      </div>

      {users.length === 0 ? (
        <div className="card-pro text-center py-20">
          <Users className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-gray-500">لا يوجد مستخدمين مسجلين</p>
        </div>
      ) : (
        <div className="card-pro overflow-hidden">
          <table className="table-pro">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>الحجوزات</th>
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
                  <td>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-[#b8941f]" />
                      <span className="font-black">{u._count.bookings}</span>
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
  );
}