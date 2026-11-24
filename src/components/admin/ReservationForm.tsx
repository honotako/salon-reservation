"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createReservation, fetchAvailableStartTimes } from "@/app/admin/(protected)/reservations/new/actions";

type Option = { id: number; name: string };
type MenuOption = Option & { durationMinutes: number };
type CustomerOption = Option & { contact: string };

const sourceOptions = [
  { value: "phone", label: "電話" },
  { value: "line", label: "LINE" },
  { value: "instagram", label: "Instagram" },
  { value: "other", label: "その他" },
] as const;

export default function ReservationForm({
  stylists,
  menus,
  customers,
}: {
  stylists: Option[];
  menus: MenuOption[];
  customers: CustomerOption[];
}) {
  // お客さん
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // 予約の内容
  const [stylistId, setStylistId] = useState<number | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [source, setSource] = useState<(typeof sourceOptions)[number]["value"]>("phone");
  const [note, setNote] = useState("");

  // 空き時間、メッセージ、保存中
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // 日付、美容師、メニューがそろったら、空き時間を取ってくる
  useEffect(() => {
    setStartTime("");
    if (!date || stylistId === null || menuId === null) {
      setAvailableTimes([]);
      return;
    }
    fetchAvailableStartTimes(date, stylistId, menuId).then(setAvailableTimes);
  }, [date, stylistId, menuId]);

  // 登録ボタンを押したとき
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (stylistId === null || menuId === null || !startTime) {
      setErrorMessage("美容師、メニュー、日付、開始時間を選んでください");
      return;
    }
    if (customerMode === "existing" && customerId === null) {
      setErrorMessage("お客様を選んでください");
      return;
    }

    setIsSaving(true);
    const { error } = await createReservation({
      customerId: customerMode === "existing" ? customerId : null,
      newCustomer: { name: newName, phone: newPhone, email: newEmail },
      stylistId,
      menuId,
      date,
      startTime,
      source,
      note,
    });
    setIsSaving(false);

    if (error) {
      setErrorMessage(error);
      return;
    }
    router.push("/admin/reservations");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>お客様</h2>
      <label>
        <input type="radio" checked={customerMode === "existing"} onChange={() => setCustomerMode("existing")} />
        前に来たお客様
      </label>
      <label>
        <input type="radio" checked={customerMode === "new"} onChange={() => setCustomerMode("new")} />
        新しいお客様
      </label>

      {customerMode === "existing" ? (
        <select
          value={customerId ?? ""}
          onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">選んでください</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}（{c.contact}）
            </option>
          ))}
        </select>
      ) : (
        <>
          {/* ① 新しいお客様の 名前、電話番号、メールアドレス の入力欄（ほのさんが書く） */}
          <label>
            名前
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </label>
          <label>
            電話番号
            <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          </label>
          <label>
            メールアドレス
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </label>
        </>
      )}

      <h2>予約の内容</h2>
      {/* ② 美容師の選択肢（ほのさんが書く） */}
      <label>
       美容師
        <select
            value={stylistId ?? ""}
            onChange={(e) => setStylistId(e.target.value ? Number(e.target.value) : null)}
            >
            <option value="">選んでください</option>
            {stylists.map((s) => (
                <option key={s.id} value={s.id}>
                {s.name}
                </option>
            ))}
        </select>
      </label>
      {/* ③ メニューの選択肢（ほのさんが書く） */}
      <label>
        メニュー
        <select
            value={menuId ?? ""}
            onChange={(e) => setMenuId(e.target.value ? Number(e.target.value) : null)}
            >
            <option value="">選んでください</option>
            {menus.map((m) => (
                <option key={m.id} value={m.id}>
                {m.name} ({m.durationMinutes}分）
                </option>
            ))}
        </select>
      </label>

      <label>
        日付
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <label>
        開始時間
        <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
          <option value="">
            {date && stylistId !== null && menuId !== null
              ? availableTimes.length > 0
                ? "選んでください"
                : "空いている時間がありません"
              : "先に日付、美容師、メニューを選んでください"}
          </option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </label>

      {/* ④ 予約経路の選択肢（ほのさんが書く） */}
      <label>
        予約経路
        <select value={source} onChange={(e) => setSource(e.target.value as typeof source)}>
            {sourceOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
            ))}
        </select>
      </label>
        {/* ⑤ 要望の入力欄（ほのさんが書く） */}
        <label>
            要望（コメント）
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      {errorMessage && <p>{errorMessage}</p>}
      <button type="submit" disabled={isSaving}>登録</button>
    </form>
  );
}