import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const UserSchema = z
    .object({
        email: z.string().min(1, 'Email is required').email('Invalid email'),
        role: z.string()
    })

export async function GET() {

    try {
        const userArray = await prisma.user.findMany({ where: { role: "ADMIN" } })
        if (userArray) {
            return NextResponse.json({ user: userArray, message: "Users Retireved successfully" })
        }
        return NextResponse.json({ user: null, message: "Unable to retrieve users" })
    } catch (error) {
        return NextResponse.json({ user: null, message: "Something went wrong", error })
    }
}

export async function POST(req: Request) {

    const body = await req.json()
    const session = await getServerSession(authOptions);
    const { email, role } = UserSchema.parse(body);

    try {
        if (session?.user?.role !== "SUPERADMIN") {
            return NextResponse.json({ user: null, message: "Unauthorised" })
        }
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: email }
        })
 
        if (existingUserByEmail) {
            return NextResponse.json({ user: null, message: "User already exists" }, { status: 400 })
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                password: "DEFAULT",
                role: "ADMIN"
            }
        })
        return NextResponse.json({ user: newUser, message: "New Admin created successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ user: null, message: "Something went wrong", error }, { status: 400 })
    }
}

export async function DELETE(req: Request) {
    const body = await req.json()
    const { email } = body
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "SUPERADMIN") {
        return NextResponse.json({ user: null, message: "Unauthorised" });
    }
    try {
        const deletedUser = await prisma.user.delete({
            where: { email: email }
        });
        return NextResponse.json({ user: deletedUser, message: "User deleted successfully" });
    } catch (error) {
        return NextResponse.json({ user: null, message: "Unable to delete user", error });
    }
}
