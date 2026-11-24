"use client";

import { useState } from "react";
import { updateWeeklyHoliday } from "@/app/admin/(protected)/settings/actions";
import { weekdayLabels} from "@/lib/settings";


export default function WeeklyHolidayForm({
    initialWeekday,
}: {
    initialWeekday: number | null;
}) {
    // 選んでいる定休日（最初は、今の設定）
    const [weekday, setWeekday] = useState<number | null>(initialWeekday);

    // メッセージと、保存中かどうか
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    //ボタンを押した時の処理を以下に書く
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        // 1. 前のメッセージを３つとも消す
        setErrorMessage("");
        setSuccessMessage("");
        setWarningMessage("");
        
        // 2. 保存中にする
        setIsSaving(true);
    
        // 3. サーバーの処理を呼んで、結果の error を受け取る
        const { error, warning } = await updateWeeklyHoliday(weekday);
    
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
    
        // 6. 成功したら、成功メッセージに「保存しました」を入れる
        setSuccessMessage("保存しました")
    };

    //画面
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="form-field max-w-xs">
            定休日
            <select
              value={weekday === null ? "none" : String(weekday)}
              onChange={(e) => setWeekday(e.target.value === "none" ? null : Number(e.target.value))}
            >
              <option value="none">定休日なし</option>
              {weekdayLabels.map((label, index) => (
                <option key={index} value={index}>{label}曜日</option>
              ))}
            </select>
          </label>
    
          {errorMessage && <p className="message-error">{errorMessage}</p>}
          {warningMessage && <p className="message-warning">{warningMessage}</p>}
          {successMessage && <p className="message-success">{successMessage}</p>}
    
          <div>
            <button type="submit" disabled={isSaving} className="btn-primary">保存</button>
          </div>
        </form>
    );
}