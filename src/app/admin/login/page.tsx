"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ showPassword, setShowPassword ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ isLoggingIn, setIsLoggingIn ] = useState(false);

    const router = useRouter();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        if( !email || !password ) {
            setErrorMessage("メールアドレスとパスワードを入力してください");
            return;
        }
        setIsLoggingIn(true);
        const { error } = await authClient.signIn.email({email,password});
        if ( error ) {
            setErrorMessage("メールアドレスまたはパスワードが違います");
            setIsLoggingIn(false);
            return;
        } 
        router.push("/admin");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
            <div className="card w-full max-w-sm">
                <p className="mb-1 text-center text-lg font-bold tracking-wide text-amber-900">ローズマリー</p>
                <h1 className="text-center">ログイン</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="form-field">
                        メールアドレス
                        <input type="email" placeholder="example@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label>
                    <label className="form-field">
                        パスワード
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                        <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                        パスワードを表示
                    </label>
                    {errorMessage && <p className="message-error">{errorMessage}</p>}
                    <button type="submit" disabled={isLoggingIn} className="btn-primary">
                        ログイン
                    </button>
                </form>
            </div>
        </div>
    );
  }
