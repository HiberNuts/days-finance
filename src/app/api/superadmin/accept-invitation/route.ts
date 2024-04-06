import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto"
import { hash } from "bcrypt";

const UserSchema = z
    .object({
        email: z.string().min(1, 'Email is required').email('Invalid email'),
        password: z.string().min(4, "Password must be minimum 4 characters"),
        token: z.string()
    })


export async function POST(req: Request) {
    const body = await req.json()
    const session = await getServerSession(authOptions);
    const { email, password, token } = UserSchema.parse(body);

    let date: Date = new Date()

    try {

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        const user = await prisma.user.findFirst({ where: { resetToken: hashedToken } })

        if (!user) {
            return NextResponse.json({ user: null, message: "Invalid User" })
        }

        if (user.resetTokenExpiry < date) {
            return NextResponse.json({ user: null, message: "Token is expired!" })
        }

        const hashedPassword = await hash(password, 10)

        const newUser = await prisma.user.update({
            where: { email: email },
            data: {
                password: hashedPassword,
                resetToken: "",
                resetTokenExpiry: undefined
            }
        })
        return NextResponse.json({ user: newUser, message: "You are succesfully registered!, Please login" }, { status: 200 })
    } catch (error) {
        console.log(error);

        return NextResponse.json({ user: null, message: "Something went wrong", error }, { status: 400 })
    }
}