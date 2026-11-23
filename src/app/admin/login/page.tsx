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
        <>
            <h1>ログイン</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type={showPassword ? "text" : "password"} placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
                <label>
                    <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)}/>
                    パスワードを表示
                </label>
                {errorMessage && <p>{errorMessage}</p>}
                <button type="submit" disabled={isLoggingIn}>ログイン</button>
            </form>
        </>
    );
  }
