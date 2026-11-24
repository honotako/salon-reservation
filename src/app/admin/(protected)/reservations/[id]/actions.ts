"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 変更先として選べる状態
const allowedStatuses = ["visited", "canceled", "no_show"] as const;
type NewStatus = (typeof allowedStatuses)[number];

export async function updateReservationStatus(reservationId: number, newStatus: NewStatus) {
  // ① ログインしているか確かめる
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "ログインしてください" };
  }

  // ② 変更先が、決められた3つのどれかか確かめる
  if (!allowedStatuses.includes(newStatus)) {
    return { error: "その状態には変更できません" };
  }

  // ③「今の状態が予約済み」の予約だけを変更する
  const result = await prisma.reservation.updateMany({
    where: { id: reservationId, status: "reserved" , isDeleted : false},
    data: { status: newStatus },
  });

  // 1件も変更されなかった = 予約がない、またはもう予約済みではない
  if (result.count === 0) {
    return { error: "この予約はもう変更できません" };
  }

  return { error: null };
}

export async function deleteReservation(reservationId: number) {
  // ① ログインしているか確かめる
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "ログインしてください" };
  }

  //②「予約済み」で「まだ削除されていない」予約に、削除済みの印を付ける（論理削除）
  const result = await prisma.reservation.updateMany({
    where : { id : reservationId,  status: "reserved" , isDeleted : false},
    data : { isDeleted : true }
  });

  // ③ 1件も削除されなかったらエラーを返す
  if (result.count === 0) {
    return { error: "この予約はもう削除できません" };
  }

  // ④ 成功
  return { error : null};
}