import Link from "next/link";

export default function NotFound() {

    return (
        <>
          <p>この予約は見つかりません</p>
          <Link href="/admin/reservations">予約一覧に戻る</Link>
        </>
      );
}