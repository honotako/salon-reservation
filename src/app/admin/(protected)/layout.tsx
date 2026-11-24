import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AccountMenu from "@/components/admin/AccountMenu";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

export const instant = false;

export default async function ProtectedLayout({
    children,
} : {
    children: React.ReactNode;
}) {
    // ログインしているか（していなければ null）
    const session = await auth.api.getSession({ headers: await headers() });

    // ここに書く：ログインしていなかったら /admin/login へ
    if (!session) {
        redirect("/admin/login");
    }

    // ログインしていたら、中のページをそのまま表示
    return (
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-lg font-bold tracking-wide text-amber-900">
                ローズマリー
              </Link>
              <AdminNav />
            </div>
            <AccountMenu name={session.user.name} />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    );
}