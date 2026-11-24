import { prisma } from "@/lib/prisma";
import ReservationCalendar, { type CalendarEvent } from "@/components/admin/ReservationCalendar";

export const instant = false;

// 美容師ごとの色（青、ピンク、緑）
const stylistColors = ["#3b82f6", "#ec4899", "#10b981"];
// キャンセル、無断キャンセルの色（グレー）
const canceledColor = "#9ca3af";
// 休みの日の背景の色（薄いグレー）
const holidayColor = "#e5e7eb";

export default async function ReservationsPage() {
    // ① 予約を全部取ってくる（お客さんの名前を使うので customer を include）
    const reservations = await prisma.reservation.findMany({include : {customer : true }});

  // ② 美容師を id の順に取ってくる
  const stylists = await prisma.stylist.findMany({ orderBy: { id: "asc" } }); 

  // ③ 休業日を全部取ってくる
  const holidays = await prisma.holiday.findMany();

  // ④ 予約を CalendarEvent の形に変える
  const reservationEvents: CalendarEvent[] = reservations.map((r) => ({
    id: String(r.id),
    title: r.customer.name,
    start: r.startAt.toISOString(),
    end: r.endAt.toISOString(),
    color: r.status === "canceled" || r.status === "no_show" ? canceledColor : stylistColors[stylists.findIndex((s) => s.id === r.stylistId)],
  }));

  // ⑤ 休業日を CalendarEvent の形に変える
  const holidayEvents: CalendarEvent[] = holidays.map((h) =>
    h.type === "weekly"
      ? {
          title: h.reason ?? "定休日",
          daysOfWeek: [h.weekday!],
          display: "background",
          color: holidayColor,
        }
      : {
          title: h.reason ?? "臨時休業",
          start: h.date!.toISOString().slice(0, 10),
          allDay: true,
          display: "background",
          color: holidayColor,
        }
  );
  return (
    <>
      <h1>予約一覧</h1>
      <ReservationCalendar events={[...reservationEvents, ...holidayEvents]} />
    </>
  );
}