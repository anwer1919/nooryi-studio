import { prisma } from "./src/lib/prisma"

async function main() {
  console.log("=== Bookings ===")
  const bookings = await prisma.booking.findMany({
    select: { 
      id: true, 
      status: true,
      clientName: true,
      clientEmail: true,
      clientPhone: true,
      date: true,
      grossAmount: true,
      artist: { select: { name: true, slug: true } },
      customer: { select: { email: true, phone: true } },
      userId: true,
    },
    orderBy: { createdAt: "desc" },
  })
  console.log("Total bookings:", bookings.length)
  bookings.forEach(b => {
    console.log(`  ${b.id.slice(0,8)} | ${b.clientName} | ${b.clientEmail || b.customer?.email || "—"} | ${b.artist?.name} | ${b.status} | ${(b.grossAmount || 0).toLocaleString()}`)
  })

  console.log("\n=== Artists Status ===")
  const artists = await prisma.artist.findMany({
    select: { id: true, name: true, slug: true, status: true }
  })
  artists.forEach(a => console.log(`  ${a.name} | ${a.status}`))

  console.log("\n=== Users (role USER/CLIENT) ===")
  const users = await prisma.user.findMany({
    where: { role: { in: ["USER", "CLIENT"] } },
    select: { id: true, email: true, name: true, role: true }
  })
  users.forEach(u => console.log(`  ${u.name} | ${u.email} | ${u.role}`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())