"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteReservation } from "@/app/admin/(protected)/reservations/[id]/actions"

export default function DeleteButton({
    reservationId,
    status,
}: {
    reservationId: number;
    status: string;
}) {
    const [errorMessage, setErrorMessage] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    //予約済みでなければ、ボタンを出さない
    if (status !== "reserved") {
        return null;
    }

    //ボタンを押した時の処理
    const handleDelete = async () => {

        if (!confirm("この予約を削除しますか？削除すると元に戻せません。")) {
            return;
        }
        // 1. 前のエラーを消す
        setErrorMessage("");
        // 2. 削除中にする
        setIsDeleting(true);
    
        // 3. サーバーの処理を呼んで、結果の error を受け取る
        const { error } = await deleteReservation(reservationId);
    
        // 4. error があれば、エラーメッセージに入れて、変更中を解除して、return
        if ( error ) {
            setErrorMessage(error);
            setIsDeleting(false);
            return;
        } 
    
        // 5. 成功したら一覧に戻る
        router.push("/admin/reservations");
    };

    return (
        <div>
          <button type="button" onClick={handleDelete} disabled={isDeleting}>
            削除する
          </button>
          {errorMessage && <p>{errorMessage}</p>}
        </div>
    );
}   

