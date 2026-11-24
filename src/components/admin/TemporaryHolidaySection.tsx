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
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
        <label className="form-field">
          日付
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="form-field flex-1">
          理由
          <input type="text" placeholder="年末年始など" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <button type="submit" disabled={isSaving} className="btn-primary">追加</button>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {errorMessage && <p className="message-error">{errorMessage}</p>}
        {warningMessage && <p className="message-warning">{warningMessage}</p>}
        {successMessage && <p className="message-success">{successMessage}</p>}
      </div>

      {holidays.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">臨時休業はありません</p>
      ) : (
        <ul className="mt-4 divide-y divide-stone-100 text-sm">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between py-3">
              <span>
                {h.dateLabel}
                <span className="ml-3 text-stone-500">{h.reason || "（理由なし）"}</span>
              </span>
              <button type="button" onClick={() => handleDelete(h.id)} disabled={isSaving} className="btn-danger">
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}