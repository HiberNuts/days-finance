import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email"
import { CredentialsProvider } from "next-auth/providers/credentials";

export const options: NextAuthOptions = {
    providers: [
        EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
            // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
        }),

    ],

}