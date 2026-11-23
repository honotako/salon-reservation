import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

//. 画面から Better Auth を呼ぶための道具
//画面側では、この authClient を使ってログインします