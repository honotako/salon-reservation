"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateReservationStatus } from "@/app/admin/(protected)/reservations/[id]/actions"

export default function StatusButtons({
    reservationId,
    status,
}: {
    reservationId: number;
    status: string;
}) {
    const [errorMessage, setErrorMessage] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    // 予約済みでなければ、ボタンを出さない
    if (status !== "reserved") {
        return null;
    }

    //ボタンを押した時の処理
    const handleChange = async (newStatus: "visited" | "canceled" | "no_show") => {
        // 1. 前のエラーを消す
        setErrorMessage("");
    
        // 2. 変更中にする
        setIsUpdating(true);
    
        // 3. サーバーの処理を呼んで、結果の error を受け取る
        const { error } = await updateReservationStatus(reservationId, newStatus);
    
        // 4. error があれば、エラーメッセージに入れて、変更中を解除して、return
        if ( error ) {
            setErrorMessage(error);
            setIsUpdating(false);
            return;
        } 
    
        // 5. 成功したら、画面を最新にする
        router.refresh();
    };

    return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => handleChange("visited")} disabled={isUpdating} className="btn-primary">
              来店済みにする
            </button>
            <button type="button" onClick={() => handleChange("canceled")} disabled={isUpdating} className="btn-secondary">
              キャンセルにする
            </button>
            <button type="button" onClick={() => handleChange("no_show")} disabled={isUpdating} className="btn-secondary">
              無断キャンセルにする
            </button>
          </div>
          {/* エラーメッセージ（エラーがあるときだけ表示） */}
          {errorMessage && <p className="message-error">{errorMessage}</p>}
        </div>
    );
}   

