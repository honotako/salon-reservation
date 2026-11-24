"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Home" },
  { href: "/admin/reservations", label: "予約一覧" },
  { href: "/admin/reservations/new", label: "予約登録" },
  { href: "/admin/settings", label: "設定" },
];

export default function AdminNav() {
  const pathname = usePathname();

  // 今の URL に一番長く一致するリンクを「今いる画面」にする
  const activeHref = links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="flex gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            link.href === activeHref
              ? "rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900"
              : "rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}