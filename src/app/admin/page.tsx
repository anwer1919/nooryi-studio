import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminRootPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role || "USER";

  // مدير الأعمال → لوحة التحكم الاحترافية الجديدة
  if (role === "ARTIST_MANAGER") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { artistId: true },
    });

    if (user?.artistId) {
      const artist = await prisma.artist.findUnique({
        where: { id: user.artistId },
        select: { slug: true },
      });

      if (artist?.slug) {
        redirect(`/admin/manager-dashboard`);
      }
    }
    // إذا لم يكن لديه فنان معين، ابقه في /admin
  }

  // Super Admin / Admin → يبقى في الصفحة الأصلية
  // (ضع هنا الكود الأصلي لصفحة /admin الخاصة بالسوبر أدمن)
  return null;
}
