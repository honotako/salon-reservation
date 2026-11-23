import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

//[...all] は、/api/auth/ から始まる URL を全部このファイルで受け付ける、という Next.js の書き方です。ログイン、ログアウト、セッションの確認などを、Better Auth がまとめて処理してくれます。
export const { GET, POST } = toNextJsHandler(auth);

