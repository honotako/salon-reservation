"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slotOptions, timeOptions } from "@/lib/settings";

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