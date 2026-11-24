import { prisma } from "@/lib/prisma";
import BusinessHoursForm from "@/components/admin/BusinessHoursForm";
import WeeklyHolidayForm from "@/components/admin/WeeklyHolidayForm";
import TemporaryHolidaySection from "@/components/admin/TemporaryHolidaySection";
import { formatDate } from "@/lib/format";

export const instant = false;

// DB の時刻から "10:00" の形を取り出す
const toTimeString = (date: Date) => date.toISOString().slice(11, 16);

export default async function SettingsPage() {
  const setting = await prisma.storeSetting.findFirst();
  const WeeklyHoliday = await prisma.holiday.findFirst({ where : { type : "weekly"}});
  const temporaryHolidays = await prisma.holiday.findMany({
    where: { type: "temporary" },
    orderBy: { date: "asc" },
  });

  return (
    <>
      <h1>設定</h1>

      <h2>営業時間と予約の刻み</h2>
      <BusinessHoursForm
        initialOpenTime={setting ? toTimeString(setting.openTime) : "10:00"}
        initialCloseTime={setting ? toTimeString(setting.closeTime) : "18:00"}
        initialSlotMinutes={setting?.slotMinutes ?? 30}
      />

      {/* パートB：毎週の定休日 */}
      <WeeklyHolidayForm initialWeekday={WeeklyHoliday?.weekday ?? null } />
      {/* パートC：臨時休業 */}
      <h2>臨時休業</h2>
      <TemporaryHolidaySection
        holidays={temporaryHolidays.map((h) => ({
          id: h.id,
          dateLabel: formatDate(h.date!),
          reason: h.reason ?? "",
        }))}
      />
    </>
  );
}