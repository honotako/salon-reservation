import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { statusLabel, sourceLabel, formatTime, formatDate } from "@/lib/format";
import StatusButtons from "@/components/admin/StatusButtons";
import DeleteButton from "@/components/admin/DeleteButton";

export const instant = false;

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // URL の [id] の部分を受け取る
  const { id } = await params;
  const reservationId = Number(id);

  // 数字でなければ「見つからない」画面へ
  if (!Number.isInteger(reservationId)) {
    notFound();
  }

  // 予約を1件取ってくる
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId , isDeleted : false },
    include: { customer: true, stylist: true, menu: true },
  });

  // 予約がなければ「見つからない」画面へ
  if (!reservation) {
    notFound();
  }

  return (
    <>
      <h1>予約詳細</h1>
      <h2>予約情報</h2>
      <p>日付：{formatDate(reservation.startAt)}</p>
      <p>時間：{formatTime(reservation.startAt)}〜{formatTime(reservation.endAt)}</p>
      <p>メニュー：{reservation.menu.name}</p>
      <p>料金：{reservation.menu.price.toLocaleString()}円</p>
      <p>所要時間；{reservation.menu.durationMinutes}分</p>
      <p>担当者：{reservation.stylist.name}</p>
      <p>予約経路：{sourceLabel[reservation.source]}</p>
      <p>状態：{statusLabel[reservation.status]}</p>
      <StatusButtons reservationId={reservation.id} status={reservation.status} />
      <DeleteButton reservationId={reservation.id} status={reservation.status} />
      <p>コメント：{reservation.note ?? "なし"}</p>
      <h2>お客様情報</h2>
      <p>氏名：{reservation.customer.name}</p>
      <p>電話番号：{reservation.customer.phone ?? "なし"}</p>
      <p>メールアドレス：{reservation.customer.email ?? "なし" }</p>
      <Link href="/admin/reservations">予約一覧に戻る</Link>
    </>
  );
}