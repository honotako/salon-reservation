import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { statusLabel, formatTime } from "@/lib/format";

export const instant = false;

export default async function AdminHomePage() {
    // アクセスのたびに作る画面だと Next.js に伝える
    await connection();
    // 日本時間の今日の日付（例：2026-11-25）。サーバーが UTC でもずれないようにする
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
    }).format(new Date());
    // 日本時間の今日の 0:00:00 〜 23:59:59
    const startAt = new Date(`${today}T00:00:00+09:00`);
    const endAt = new Date(`${today}T23:59:59+09:00`);

    //DBから今日の予約取得する
    const reservations = await prisma.reservation.findMany({
        where : {
            startAt : { gte : startAt, lte : endAt },
            isDeleted : false,
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
            <div className="card mb-6">
                <p>予約件数:{count}件</p>
            </div>
            {reservations.length === 0 ? (
                <p>本日の予約はありません</p>
            ) : (
                <div className="card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-left text-stone-500">
                            <th className="py-2">時間</th>
                            <th className="py-2">お客さん</th>
                            <th className="py-2">美容師</th>
                            <th className="py-2">メニュー</th>
                            <th className="py-2">状態</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map((r) => (
                            <tr 
                                key={r.id} 
                                className={`border-b border-stone-100 ${r.status === "canceled" || r.status === "no_show" ? "text-gray-400" : ""}`}
                            >
                                <td className="py-2">{formatTime(r.startAt)}〜{formatTime(r.endAt)}</td>
                                <td className="py-2">{r.customer.name}</td>
                                <td className="py-2">{r.stylist.name}</td>
                                <td className="py-2">{r.menu.name}</td>
                                <td className="py-2">{statusLabel[r.status]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </>
    );
}