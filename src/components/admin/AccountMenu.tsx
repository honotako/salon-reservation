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
        <div>
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>{name}</button>
            {isMenuOpen && <button type="button" onClick={handleLogout}>ログアウト</button>}
        </div>
    );
}