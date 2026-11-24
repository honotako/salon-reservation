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

      <div className="card mb-6">
        <h2 className="section-title">予約情報</h2>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-stone-500">日付</dt>
          <dd>{formatDate(reservation.startAt)}</dd>
          <dt className="text-stone-500">時間</dt>
          <dd>{formatTime(reservation.startAt)}〜{formatTime(reservation.endAt)}</dd>
          <dt className="text-stone-500">メニュー</dt>
          <dd>{reservation.menu.name}</dd>
          <dt className="text-stone-500">料金</dt>
          <dd>{reservation.menu.price.toLocaleString()}円</dd>
          <dt className="text-stone-500">所要時間</dt>
          <dd>{reservation.menu.durationMinutes}分</dd>
          <dt className="text-stone-500">担当者</dt>
          <dd>{reservation.stylist.name}</dd>
          <dt className="text-stone-500">予約経路</dt>
          <dd>{sourceLabel[reservation.source]}</dd>
          <dt className="text-stone-500">状態</dt>
          <dd>{statusLabel[reservation.status]}</dd>
          <dt className="text-stone-500">要望</dt>
          <dd className="whitespace-pre-wrap">{reservation.note ?? "なし"}</dd>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusButtons reservationId={reservation.id} status={reservation.status} />
          <DeleteButton reservationId={reservation.id} status={reservation.status} />
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="section-title">お客様情報</h2>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-stone-500">氏名</dt>
          <dd>{reservation.customer.name}</dd>
          <dt className="text-stone-500">電話番号</dt>
          <dd>{reservation.customer.phone ?? "なし"}</dd>
          <dt className="text-stone-500">メールアドレス</dt>
          <dd>{reservation.customer.email ?? "なし"}</dd>
        </dl>
      </div>

      <Link href="/admin/reservations" className="text-sm text-amber-800 hover:underline">
        ← 予約一覧に戻る
      </Link>
    </>
  );
}