import { prisma } from "@/lib/prisma";
import ReservationForm from "@/components/admin/ReservationForm";

export const instant = false;

export default async function NewReservationPage() {
  const stylists = await prisma.stylist.findMany({
    where: { isDeleted: false },
    orderBy: { id: "asc" },
  });
  const menus = await prisma.menu.findMany({
    where: { isDeleted: false },
    orderBy: { id: "asc" },
  });
  const customers = await prisma.customer.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <>
      <h1>予約登録</h1>
      <ReservationForm
        stylists={stylists.map((s) => ({ id: s.id, name: s.name }))}
        menus={menus.map((m) => ({ id: m.id, name: m.name, durationMinutes: m.durationMinutes }))}
        customers={customers.map((c) => ({ id: c.id, name: c.name, contact: c.phone ?? c.email ?? "" }))}
      />
    </>
  );
}