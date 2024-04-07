import NextAuth from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface User {
        email: string,
        role: string,
        organizationId?: string
    }
    interface Session {
        user: User & {
            /** The user's postal address. */
            email: string,
            role: string,
            organizationId?: string
        }
        token: {
            email: string
            role: string,
            organizationId: string

        }
    }
}