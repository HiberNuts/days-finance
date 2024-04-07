import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto"

const UserSchema = z
    .object({
        email: z.string().min(1, 'Email is required').email('Invalid email'),
        role: z.string()
    })

interface User {
    id: number;
    email: string;
    role: string;
    password: string;
    resetToken: string;
    createdAt: Date;
    updatedAt: Date;
}

export async function POST(req: Request) {
    let nodemailer = require('nodemailer')

    const body = await req.json()
    const session = await getServerSession(authOptions);
    const { email, role } = UserSchema.parse(body);

    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PW,
        },
        secure: true,
    })


    try {
        if (session?.user?.role !== "SUPERADMIN") {
            return NextResponse.json({ user: null, message: "Unauthorised" }, { status: 400 })
        }
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: email }
        })
        if (existingUserByEmail) {
            return NextResponse.json({ user: null, message: "User already exists" })
        }

        const resetToken = crypto.randomBytes(20).toString("hex")
        const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

        const passwordResetExpires = new Date(Date.now() + 12096e5);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: "DEFAULT",
                role: role as Role,
                resetToken: passwordResetToken,
                resetTokenExpiry: passwordResetExpires
            }
        })

        const resetUrl = `/on-board/${resetToken}`

        const mailData = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: `Register onto Days Finance`,
            html: `<div> <p>Click on below link to onboard onto Days Finance 🚀</p><p>${resetUrl}</p> </div>`
        }

        await transporter.sendMail(mailData, async function (err: any, info: any) {
            if (err) {
                return NextResponse.json({ message: "Something went wrong while sending email", err })
            } else {
                console.log("Mail sent successfully");
                return NextResponse.json({ message: "Mail send Successfully", err })
            }
        })

        return NextResponse.json({ message: "New Admin created successfully" })
    } catch (error) {
        return NextResponse.json({ user: null, message: "Something went wrong", error })
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
