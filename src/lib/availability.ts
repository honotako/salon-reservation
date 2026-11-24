import { prisma } from "@/lib/prisma";

// 1分 = 60,000ミリ秒
const MINUTE = 60 * 1000;

// DB の時刻（1970-01-01 10:00）を、0:00 からの分（600）にする
const timeToMinutes = (time: Date) => time.getUTCHours() * 60 + time.getUTCMinutes();

// 0:00 からの分（600）を、"10:00" の形にする
const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * 空いている開始時間の一覧を返す
 * @param date 日付（"2026-12-01" の形）
 * @param stylistId 美容師の id
 * @param menuId メニューの id
 * @returns 空いている開始時間（["10:00", "10:30", ...]）
 */
export async function getAvailableStartTimes(
  date: string,
  stylistId: number,
  menuId: number
): Promise<string[]> {
  // ① 設定と、選んだメニューを取ってくる
  const setting = await prisma.storeSetting.findFirst();
  const menu = await prisma.menu.findFirst({ where: { id: menuId, isDeleted: false } });
  if (!setting || !menu) {
    return [];
  }

  // その日の 0:00（日本時間）
  const startOfDay = new Date(`${date}T00:00:00+09:00`);
  const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * MINUTE);

  // ② その日が休み（定休日か臨時休業）なら、空き時間は0件
  const weekday = new Date(startOfDay.getTime() + 9 * 60 * MINUTE).getUTCDay();
  const holiday = await prisma.holiday.findFirst({
    where: {
      OR: [
        { type: "weekly", weekday },
        { type: "temporary", date: new Date(`${date}T00:00:00Z`) },
      ],
    },
  });
  if (holiday) {
    return [];
  }

  // ③ 刻みごとに開始時間の候補を作る（開始 + 所要時間 ≦ 営業終了 の間だけ）
  const openMinutes = timeToMinutes(setting.openTime);
  const closeMinutes = timeToMinutes(setting.closeTime);
  const candidates: number[] = [];
  for (
    let minutes = openMinutes;
    minutes + menu.durationMinutes <= closeMinutes;
    minutes += setting.slotMinutes
  ) {
    candidates.push(minutes);
  }

  // ④ その日の、選んだ美容師の「埋まっている予約」を取ってくる
  const reservations = await prisma.reservation.findMany({
    where: {
      stylistId,
      isDeleted: false,
      status: { in: ["reserved", "visited"] },
      startAt: { gte: startOfDay, lt: startOfNextDay },
    },
    select: { startAt: true, endAt: true },
  });

  // ⑤ 候補の中から、④のどれとも重ならないものだけを残す
  const available = candidates.filter((minutes) => {
    const newStart = new Date(startOfDay.getTime() + minutes * MINUTE);
    const newEnd = new Date(newStart.getTime() + menu.durationMinutes * MINUTE);

    // どれか1つでも重なる予約があれば、この候補は使えない
    const overlaps = reservations.some(
      (r) => newStart < r.endAt && newEnd > r.startAt
    );
    return !overlaps;
  });

  return available.map(minutesToTime);
}