import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {

    await prisma.reservation.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.stylist.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.holiday.deleteMany();
    await prisma.storeSetting.deleteMany();

    // 美容師（ログイン用のパスワードは開発用に全員同じ）
    const passwordHash = await bcrypt.hash("password123", 10);
    await prisma.stylist.createMany({
        data: [
            {
                name: "田中敦子",
                email: "tanaka@example.com",
                passwordHash,
                profile: "主に女性のショートカットが得意です",
            },
            {
                name: "佐藤みか",
                email: "sato@example.com",
                passwordHash,
                profile: "男性のパーマとレザーカットが得意です",
            },
            {
                name: "安田雄太",
                email: "yasuda@example.com",
                passwordHash,
                profile: "女性のロングとパーマ、縮毛矯正が得意です",
            },
        ],
    });

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