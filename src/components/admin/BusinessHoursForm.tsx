"use client";

import { useState } from "react";
import { updateBusinessHours } from "@/app/admin/(protected)/settings/actions";
import { timeOptions, slotOptions } from "@/lib/settings";


export default function BusinessHoursForm({
    initialOpenTime,
    initialCloseTime,
    initialSlotMinutes,
}: {
    initialOpenTime: string;
    initialCloseTime: string;
    initialSlotMinutes: number;
}) {
    // 選んでいる値（最初は、今の設定）
    const [openTime, setOpenTime] = useState(initialOpenTime);
    const [closeTime, setCloseTime] = useState(initialCloseTime);
    const [slotMinutes, setSlotMinutes] = useState(initialSlotMinutes);

    // メッセージと、保存中かどうか
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    //ボタンを押した時の処理を以下に書く
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        // 1. 前のメッセージを2つとも消す
        setErrorMessage("");
        setSuccessMessage("");
    
        // 2. 画面でもチェック：終了が開始より後でなければ、エラーを入れて return
        //    （actions.ts の ③ と同じ条件です）
        if (openTime >= closeTime) {
            setErrorMessage("終了時間は開始時間より後にしてください");
            return;
        }
        
        // 3. 保存中にする
        setIsSaving(true);
    
        // 4. サーバーの処理を呼んで、結果の error を受け取る
        const { error } = await updateBusinessHours(openTime, closeTime, slotMinutes);
    
        // 5. 保存中を解除する
        setIsSaving(false);
    
        // 6. error があれば、エラーメッセージに入れて return
        if (error) {
            setErrorMessage(error);
            return;
        }
    
        // 7. 成功したら、成功メッセージに「保存しました」を入れる
        setSuccessMessage("保存しました")
    };

    //画面
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <label className="form-field">
            開始
            <select value={openTime} onChange={(e) => setOpenTime(e.target.value)}>
              {timeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            終了
            <select value={closeTime} onChange={(e) => setCloseTime(e.target.value)}>
              {timeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            予約の刻み
            <select value={slotMinutes} onChange={(e) => setSlotMinutes(Number(e.target.value))}>
              {slotOptions.map((minutes) => (
                <option key={minutes} value={minutes}>{minutes}分</option>
              ))}
            </select>
          </label>
        </div>
  
        {errorMessage && <p className="message-error">{errorMessage}</p>}
        {successMessage && <p className="message-success">{successMessage}</p>}
  
        <div>
          <button type="submit" disabled={isSaving} className="btn-primary">保存</button>
        </div>
      </form>
    );
}