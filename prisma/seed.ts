import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {

    await prisma.reservation.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.stylist.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.holiday.deleteMany();
    await prisma.storeSetting.deleteMany();
    

    // 美容師（ログイン用のパスワードは開発用に全員同じ）
    const stylists = [
        { name: "田中敦子", email: "tanaka@example.com", profile: "主に女性のショートカットが得意です" },
        { name: "佐藤みか", email: "sato@example.com", profile: "男性のパーマとレザーカットが得意です" },
        { name: "安田雄太", email: "yasuda@example.com", profile: "女性のロングとパーマ、縮毛矯正が得意です" },
    ];

    for (const s of stylists) {
        // Better Auth でログイン用のユーザーを作る（パスワードは自動でハッシュ化される）
        const { user } = await auth.api.signUpEmail({
        body: { name: s.name, email: s.email, password: "password123" },
        });
        // 作ったユーザーと紐づけて美容師を作る
        await prisma.stylist.create({
        data: { userId: user.id, name: s.name, profile: s.profile },
        });
    }

    // メニュー
    await prisma.menu.createMany({
        data: [
        { name: "カット", price: 4000, durationMinutes: 60 },
        { name: "カラー", price: 10000, durationMinutes: 90 },
        { name: "眉カット", price: 2000, durationMinutes: 30 },
        { name: "カット＋カラー", price: 13000, durationMinutes: 120 },
        { name: "ストレート矯正", price: 16000, durationMinutes: 90 },
        { name: "パーマ", price: 16000, durationMinutes: 90 },
        ],
    });

    // 営業時間と予約の刻み
    await prisma.storeSetting.create({
        data: {
        openTime: new Date("1970-01-01T10:00:00Z"),
        closeTime: new Date("1970-01-01T18:00:00Z"),
        slotMinutes: 30,
        },
    });

    // 休業日（weekday は 0=日曜〜6=土曜 なので、水曜日は 3）
    await prisma.holiday.createMany({
        data: [
        { type: "weekly", weekday: 3, reason: "定休日" },
        { type: "temporary", date: new Date("2026-12-30"), reason: "年末年始" },
        { type: "temporary", date: new Date("2026-12-31"), reason: "年末年始" },
        { type: "temporary", date: new Date("2027-01-01"), reason: "年末年始" },
        ],
    });

    // 今日の予約（seed を実行した日を「今日」とする）
    const menuByName = Object.fromEntries(
        (await prisma.menu.findMany()).map((m) => [m.name, m])
    );
    const stylistByName = Object.fromEntries(
        (await prisma.stylist.findMany()).map((s) => [s.name, s])
    );

    // "10:00" のような時刻から、今日のその時刻の日時を作る
    const todayAt = (time: string) => {
        const [hour, minute] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        return date;
    };

    const reservations = [
        { customer: { name: "山田花子", email: "yamada@example.com" }, stylist: "田中敦子", menu: "カット", start: "10:00", status: "visited", source: "web", note: "髪をすいて欲しいです"  },
        { customer: { name: "佐々木美咲", phone: "090-1111-2222" }, stylist: "田中敦子", menu: "カット＋カラー", start: "13:00", status: "reserved", source: "line", note: "前回より明るめのカラーにしたい" },
        { customer: { name: "小林愛", phone: "090-3333-4444" }, stylist: "田中敦子", menu: "眉カット", start: "15:30", status: "canceled", source: "phone" },
        { customer: { name: "鈴木健太", phone: "080-5555-6666" }, stylist: "佐藤みか", menu: "パーマ", start: "11:00", status: "reserved", source: "phone" },
        { customer: { name: "高橋翔", phone: "070-7777-8888" }, stylist: "佐藤みか", menu: "カット", start: "14:00", status: "no_show", source: "instagram" },
        { customer: { name: "伊藤由美", email: "ito@example.com" }, stylist: "安田雄太", menu: "ストレート矯正", start: "10:30", status: "visited", source: "web", note: "今回初めてなので色々教えてください"  },
        { customer: { name: "渡辺さくら", email: "watanabe@example.com" }, stylist: "安田雄太", menu: "カラー", start: "16:00", status: "reserved", source: "web", note: "ブリーチの部分があるので相談させてください"  },
    ] as const;

    for (const r of reservations) {
        const customer = await prisma.customer.create({ data: r.customer });
        const menu = menuByName[r.menu];
        const startAt = todayAt(r.start);
        // 終了時間 = 開始時間 + メニューの所要時間
        const endAt = new Date(startAt.getTime() + menu.durationMinutes * 60 * 1000);

        await prisma.reservation.create({
        data: {
            customerId: customer.id,
            stylistId: stylistByName[r.stylist].id,
            menuId: menu.id,
            startAt,
            endAt,
            status: r.status,
            source: r.source,
            note: "note" in r ? r.note : null,
        },
        });
    }

    console.log("テストデータを入れました");
}

main()
.catch((e) => {
    console.error(e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});