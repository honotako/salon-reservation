"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slotOptions, timeOptions, weekdayLabels } from "@/lib/settings";

// "10:00" を、DB の時刻の形（1970-01-01 10:00）にする
const toTime = (time: string) => new Date(`1970-01-01T${time}:00Z`);

export async function updateBusinessHours(openTime: string, closeTime: string, slotMinutes: number) {
  // ① ログインしているか
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "ログインしてください" };
  }

  // ② 選択肢の中の値か
  if (!timeOptions.includes(openTime) || !timeOptions.includes(closeTime)) {
    return { error: "営業時間の値が正しくありません" };
  }
  if (!slotOptions.includes(slotMinutes)) {
    return { error: "予約の刻みの値が正しくありません" };
  }

  // ③ 終了が開始より後か
  if (openTime >= closeTime) {
    return { error: "終了時間は開始時間より後にしてください" };
  }

  // ④ 保存する（設定は1行だけなので、あれば更新、なければ作る）
  const setting = await prisma.storeSetting.findFirst();
  const data = { openTime: toTime(openTime), closeTime: toTime(closeTime), slotMinutes };
  if (setting) {
    await prisma.storeSetting.update({ where: { id: setting.id }, data });
  } else {
    await prisma.storeSetting.create({ data });
  }

  return { error: null };
}

// 日時から、日本時間での曜日（0 = 日曜日）を取り出す
const getJstWeekday = (date: Date) =>
  new Date(date.getTime() + 9 * 60 * 60 * 1000).getUTCDay();

export async function updateWeeklyHoliday(weekday: number | null) {
  // ① ログインしているか
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "ログインしてください", warning: null };
  }

  // ② 「定休日なし（null）」か、0〜6 の整数か
  if (weekday !== null && !(Number.isInteger(weekday) && weekday >= 0 && weekday <= 6)) {
    return { error: "曜日の値が正しくありません", warning: null };
  }

  // ③ 今の定休日を消して、新しい定休日を作る（2つの命令をまとめて実行する）
  await prisma.$transaction([
    prisma.holiday.deleteMany({ where: { type: "weekly" } }),
    ...(weekday !== null
      ? [prisma.holiday.create({ data: { type: "weekly", weekday, reason: "定休日" } })]
      : []),
  ]);

  // ④ 定休日なしなら、警告はない
  if (weekday === null) {
    return { error: null, warning: null };
  }

  // ⑤ これからの予約で、その曜日のものを数える
  const futureReservations = await prisma.reservation.findMany({
    where: {
      startAt: { gte: new Date() },
      status: "reserved",
      isDeleted: false,
    },
    select: { startAt: true },
  });
  const count = futureReservations.filter((r) => getJstWeekday(r.startAt) === weekday).length;

  return {
    error: null,
    warning:
      count > 0
        ? `これからの${weekdayLabels[weekday]}曜日に、予約が${count}件入っています。お客様に連絡してください。`
        : null,
  };
}

// 臨時休業を追加する
export async function addTemporaryHoliday(date: string, reason: string) {
    // ① ログインしているか
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { error: "ログインしてください", warning: null };
    }
  
    // ② 日付が「2026-12-30」の形か
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { error: "日付を選んでください", warning: null };
    }
  
    // ③ 理由は前後の空白を取って、50文字まで
    const trimmedReason = reason.trim();
    if (trimmedReason.length > 50) {
      return { error: "理由は50文字以内にしてください", warning: null };
    }
  
    // ④ 同じ日がすでに臨時休業になっていないか
    const holidayDate = new Date(`${date}T00:00:00Z`);
    const exists = await prisma.holiday.findFirst({
      where: { type: "temporary", date: holidayDate },
    });
    if (exists) {
      return { error: "その日はすでに臨時休業になっています", warning: null };
    }
  
    // ⑤ 追加する（理由が空なら null）
    await prisma.holiday.create({
      data: { type: "temporary", date: holidayDate, reason: trimmedReason || null },
    });
  
    // ⑥ その日（日本時間の 0:00〜翌日 0:00）の予約を数える
    const startOfDay = new Date(`${date}T00:00:00+09:00`);
    const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const count = await prisma.reservation.count({
      where: {
        startAt: { gte: startOfDay, lt: startOfNextDay },
        status: "reserved",
        isDeleted: false,
      },
    });
  
    return {
      error: null,
      warning: count > 0 ? `${date} に予約が${count}件入っています。お客様に連絡してください。` : null,
    };
  }
  
  // 臨時休業を削除する
  export async function deleteTemporaryHoliday(holidayId: number) {
    // ① ログインしているか
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { error: "ログインしてください" };
    }
  
    // ② 臨時休業だけを削除する（毎週の定休日は、この処理では消さない）
    const result = await prisma.holiday.deleteMany({
      where: { id: holidayId, type: "temporary" },
    });
  
    if (result.count === 0) {
      return { error: "この臨時休業は削除できません" };
    }
  
    return { error: null };
  }