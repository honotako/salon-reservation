"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AccountMenu({ name } : { name: string }) {
    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/admin/login");
    };

    return (
        <div className="relative">
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {name}
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-md border border-stone-200 bg-white shadow-sm">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-stone-100"
                    >
                        ログアウト
                    </button>
                </div>
            )}
        </div>
    );
}