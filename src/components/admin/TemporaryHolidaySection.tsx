"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTemporaryHoliday, deleteTemporaryHoliday } from "@/app/admin/(protected)/settings/actions";

type HolidayItem = { id: number; dateLabel: string; reason: string };

export default function TemporaryHolidaySection({ holidays }: { holidays: HolidayItem[] }) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // 追加ボタンを押したとき（ほのさんが書く）
  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // WeeklyHolidayForm の handleSubmit とほぼ同じ
    // 1. 前のメッセージを３つとも消す
    setErrorMessage("");
    setSuccessMessage("");
    setWarningMessage("");
    
    // 2. 保存中にする
    setIsSaving(true);

    // 3. サーバーの処理を呼んで、結果の error を受け取る
    const { error, warning } = await addTemporaryHoliday(date,reason);

    // 4. 保存中を解除する
    setIsSaving(false);

    // 5. error があれば、エラーメッセージに入れて return
    if (error) {
        setErrorMessage(error);
        return;
    }
    if (warning) {
        setWarningMessage(warning);
    }

    // 6. 成功したら、入力欄を空に戻し,成功メッセージに「保存しました」を入れる
    setDate("");
    setReason("");
    setSuccessMessage("保存しました")
    router.refresh();
  };

  // 削除ボタンを押したとき（ほのさんが書く）
  const handleDelete = async (holidayId: number) => {
    // DeleteButton の handleDelete とほぼ同じ
    setErrorMessage("");
    setWarningMessage("");
    setSuccessMessage("");

    //サーバーの処理を呼んで、結果の error を受け取る
    const { error } = await deleteTemporaryHoliday(holidayId);
    
    setIsSaving(false);

    //error があれば、エラーメッセージに入れて、変更中を解除して、return
    if ( error ) {
        setErrorMessage(error);
        return;
    } 
    setSuccessMessage("削除しました");
    router.refresh();
  };

  return (
    <>
      {/* 追加のフォーム */}
      <form onSubmit={handleAdd}>
        <label>
          日付
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          理由
          <input type="text" placeholder="年末年始など" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <button type="submit" disabled={isSaving}>追加</button>
      </form>

      {/* メッセージ（エラー、警告、成功）をここに書く */}
      {errorMessage && <p>{errorMessage}</p>}
      {warningMessage && <p>{warningMessage}</p>}
      {successMessage && <p>{successMessage}</p>}

      {/* 一覧 */}
      {holidays.length === 0 ? (
        <p>臨時休業はありません</p>
      ) : (
        <ul>
          {holidays.map((h) => (
            <li key={h.id}>
              {h.dateLabel} {h.reason || "（理由なし）"}
              <button type="button" onClick={() => handleDelete(h.id)} disabled={isSaving}>
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}