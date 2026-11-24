"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableStartTimes } from "@/lib/availability";
import { error } from "console";

const MINUTE = 60 * 1000;

// この画面で選べる予約経路（ネット予約は除く）
const allowedSources = ["phone", "line", "instagram", "other"] as const;
type Source = (typeof allowedSources)[number];

const isDateString = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isTimeString = (value: string) => /^\d{2}:\d{2}$/.test(value);

// ステップ2：画面から空き時間を聞くための処理
export async function fetchAvailableStartTimes(date: string, stylistId: number, menuId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isDateString(date)) {
    return [];
  }
  return getAvailableStartTimes(date, stylistId, menuId);
}

// 登録するときに画面から受け取るもの
type CreateReservationInput = {
  customerId: number | null; // 前に来たお客さんを選んだときは、その id。新しいお客さんなら null
  newCustomer: { name: string; phone: string; email: string }; // 新しいお客さんのときに使う
  stylistId: number;
  menuId: number;
  date: string; // "2026-12-01"
  startTime: string; // "10:00"
  source: Source;
  note: string;
};

// ステップ3：予約を登録する処理
export async function createReservation(input: CreateReservationInput) {
  // ① ログインしているか
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "ログインしてください" };
  }

  // ② 形のチェック
  if (!isDateString(input.date) || !isTimeString(input.startTime)) {
    return { error: "日付と開始時間を選んでください" };
  }
  if (!allowedSources.includes(input.source)) {
    return { error: "予約経路を選んでください" };
  }
  const note = input.note.trim();
  if (note.length > 200) {
    return { error: "要望は200文字以内にしてください" };
  }

    // ③ お客さんのチェック（ほのさんが書く）
    // ・customerId があるとき：そのお客さんが DB にいるか確かめる。いなければエラー
    // ・customerId が null のとき：新しいお客さんの名前と連絡先をチェックする
    //     - 名前が空ならエラー
    //     - 電話番号もメールアドレスも空ならエラー
    if(input.customerId !== null) {
        const customer = await prisma.customer.findUnique({
            where : { id : input.customerId }
        });
        if (!customer) {
            return { error: "選んだお客様が見つかりません"}
        }
    } else {
        // 新しいお客さん：名前と連絡先をチェックする
        const name = input.newCustomer.name.trim();
        const phone = input.newCustomer.phone.trim();
        const email = input.newCustomer.email.trim();
        if (!name) {
            return { error: "お客様の名前を入力してください" };
        }
        if (!phone && !email) {
            return { error: "電話番号かメールアドレスのどちらかを入力してください" };
        }
    }

  // ④ 美容師とメニューがあるか
  const stylist = await prisma.stylist.findFirst({ where: { id: input.stylistId, isDeleted: false } });
  const menu = await prisma.menu.findFirst({ where: { id: input.menuId, isDeleted: false } });
  if (!stylist || !menu) {
    return { error: "美容師とメニューを選んでください" };
  }

  // ⑤ 本当に空いているか、保存の直前にもう一度計算する
  const availableTimes = await getAvailableStartTimes(input.date, input.stylistId, input.menuId);
  if (!availableTimes.includes(input.startTime)) {
    return { error: "その時間はもう埋まっています。別の時間を選んでください" };
  }

  // ⑥ 新しいお客さんなら作る
  let customerId = input.customerId;
  if (customerId === null) {
    const customer = await prisma.customer.create({
      data: {
        name: input.newCustomer.name.trim(),
        phone: input.newCustomer.phone.trim() || null,
        email: input.newCustomer.email.trim() || null,
      },
    });
    customerId = customer.id;
  }

  // ⑦ 予約を作る
  const startAt = new Date(`${input.date}T${input.startTime}:00+09:00`);
  const endAt = new Date(startAt.getTime() + menu.durationMinutes * MINUTE);
  await prisma.reservation.create({
    data: {
      customerId,
      stylistId: input.stylistId,
      menuId: input.menuId,
      startAt,
      endAt,
      source: input.source,
      note: note || null,
    },
  });

  return { error: null };
}