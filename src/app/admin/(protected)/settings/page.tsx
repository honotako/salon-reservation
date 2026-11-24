import { prisma } from "@/lib/prisma";
import BusinessHoursForm from "@/components/admin/BusinessHoursForm";

export const instant = false;

// DB の時刻から "10:00" の形を取り出す
const toTimeString = (date: Date) => date.toISOString().slice(11, 16);

export default async function SettingsPage() {
  const setting = await prisma.storeSetting.findFirst();

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
      {/* パートC：臨時休業 */}
    </>
  );
}