import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // ログインしているか（していなければ null）
  const session = await auth.api.getSession({ headers: await headers() });

  // 今開こうとしている URL
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  // ここに書く①：ログインしていなくて、ログイン画面以外を開いたら → /admin/login へ
  if ( !session && !isLoginPage ) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  } 

  // ここに書く②：ログインしていて、ログイン画面を開いたら → /admin へ
  if ( session && isLoginPage ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  } 

  // それ以外はそのまま表示
  return NextResponse.next();
}

// この proxy を動かす URL（/admin の下だけ）
export const config = {
  matcher: ["/admin/:path*"],
};