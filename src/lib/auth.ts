import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "./db";
import { compare } from "bcrypt";
import { User } from '../types/interface';


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",

    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },


    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null
                }

                const existingUser = await prisma.user.findUnique({ where: { email: credentials.email } })
                if (!existingUser) {
                    return null;
                }
                if (existingUser.password == "DEFAULT") {
                    return null
                }

                const passwordMatch = await compare(credentials.password, existingUser.password)
                if (passwordMatch) {
                    return {
                        id: existingUser.id + '',
                        email: existingUser.email,
                        role: existingUser.role,
                        organizationId: existingUser.organizationId
                    }
                }

                return null;

            }
        })
    ],
    callbacks: {
        async jwt({ token, user, }) {
            if (user) {
                token.role = user.role
                return {
                    ...token,
                    email: user.email,
                    role: user.role,
                    organizationId: user?.organizationId
                }
            }
            return token
        },
        async session({ session, token }) {

            return {
                ...session,
                user: {
                    ...session.user,
                    email: token.email,
                    role: token.role,
                    organizationId: token.organizationId
                }
            }

        }

    }
}