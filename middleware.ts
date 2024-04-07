import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await getServerSession(authOptions)
    const { pathname } = request.nextUrl;
    const url = request.nextUrl.clone();
    console.log(session);



    const adminRoutes = [
        "/dash/admin",
        "/dash/admin/change-password",
    ];

    const superAdminRoutes = [
        ...adminRoutes,
        "/dash/superadmin",
        "/dash/superadmin/add-admin",
    ];

    if (session) {
        url.pathname = "/login";
        if (
            (session.user.role !== "ADMIN") &&
            (adminRoutes.includes(pathname) || superAdminRoutes.includes(pathname))
        ) {
            return NextResponse.redirect(url);
        }
        if (session.user.role === "ADMIN" && superAdminRoutes.includes(pathname)) {
            return NextResponse.redirect(url);
        }

    } else {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }
}