// 予約の刻みの選択肢（分）
export const slotOptions = [15, 30, 60];

// 営業時間の選択肢（6:00〜23:00 を30分ごと）
export const timeOptions: string[] = [];
for (let hour = 6; hour <= 23; hour++) {
  for (const minute of [0, 30]) {
    if (hour === 23 && minute === 30) break;
    timeOptions.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }
}
// → ["06:00", "06:30", "07:00", ..., "23:00"]