import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

export const instant = false;

// 状態を日本語にする
const statusLabel = {
    reserved: "予約済み",
    visited: "来店済み",
    canceled: "キャンセル",
    no_show: "無断キャンセル",
};
  
// 日時から「10:00」のような時刻だけを取り出す
const formatTime = (date: Date) =>
    date.toLocaleTimeString("ja-JP", {
     hour: "2-digit",
     minute: "2-digit",
     timeZone: "Asia/Tokyo",
    });

export default async function AdminHomePage() {
    // アクセスのたびに作る画面だと Next.js に伝える
    await connection();
    // 今日の 0:00 と、明日の 0:00
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    //DBから今日の予約取得する
    const reservations = await prisma.reservation.findMany({
        where : {
            startAt : { gte : startOfToday, lt : startOfTomorrow },
        },
        include : {
            customer : true,
            stylist : true,
            menu : true,
        },
        orderBy : [{ stylistId: "asc"}, { startAt: "asc"}],
    });

    //今日の予約件数を取得
    const count = reservations.filter((r) => r.status === "reserved" || r.status === "visited" ).length;

    return (
        <>
            <h1>本日の予約</h1>
            <p>予約件数:{count}件</p>
            {reservations.length === 0 ? (
                <p>本日の予約はありません</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>時間</th>
                            <th>お客さん</th>
                            <th>美容師</th>
                            <th>メニュー</th>
                            <th>状態</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map((r) => (
                            <tr key={r.id} className={r.status === "canceled" || r.status === "no_show" ? "text-gray-400" : ""}>
                                <td>{formatTime(r.startAt)}〜{formatTime(r.endAt)}</td>
                                <td>{r.customer.name}</td>
                                <td>{r.stylist.name}</td>
                                <td>{r.menu.name}</td>
                                <td>{statusLabel[r.status]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}