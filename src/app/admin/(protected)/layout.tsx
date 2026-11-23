import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AccountMenu from "@/components/admin/AccountMenu";

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
        <>
          <header>
            <AccountMenu name={session.user.name} />
          </header>
          {children}
        </>
    );
}