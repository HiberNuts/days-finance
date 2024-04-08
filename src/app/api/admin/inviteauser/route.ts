import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto"
import { Organization } from '../../../../types/interface';

const UserSchema = z
    .object({
        email: z.string().min(1, 'Email is required').email('Invalid email'),
        organizationId: z.string(),
        role: z.string()
    })

export async function POST(req: Request) {
    let nodemailer = require('nodemailer')

    const body = await req.json()
    const session = await getServerSession(authOptions);
    const { email, organizationId, role } = UserSchema.parse(body);

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
        if (session?.user?.role == "USER") {
            return NextResponse.json({ user: null, message: "Unauthorised" }, { status: 400 })
        }
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })
        if (existingUserByEmail) {
            return NextResponse.json({ user: null, message: "User already exists" })
        }
        const organizationInfo = await prisma.organisation.findUnique({
            where: { id: organizationId }
        });

        if (!organizationInfo) {
            return NextResponse.json({ user: null, message: "Organization not found" });
        }

        if (role == "USER") {
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: "DEFAULT",
                    role: role as Role,
                    organizationId: organizationId
                }
            })
            return NextResponse.json({ message: `${email} added successfully` })
        } else {
            const resetToken = crypto.randomBytes(20).toString("hex")
            const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

            const passwordResetExpires = new Date(Date.now() + 12096e5);

            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: "DEFAULT",
                    role: role as Role,
                    resetToken: passwordResetToken,
                    resetTokenExpiry: passwordResetExpires,
                    organizationId: organizationId
                }
            })

            const resetUrl = `/on-board/${resetToken}`

            const mailData = {
                from: process.env.NODEMAILER_EMAIL,
                to: email,
                subject: `Register onto Days Finance`,
                html: `<div> <p>Your have an invitation from ${organizationInfo.companyName}, Please click on below link to access</p><p>${resetUrl}</p> </div>`
            }

            await transporter.sendMail(mailData, async function (err: any, info: any) {
                if (err) {
                    return NextResponse.json({ message: "Something went wrong while sending email", err })
                } else {
                    console.log("Mail sent successfully");
                    return NextResponse.json({ message: "Mail send Successfully", err })
                }
            })

        }


        return NextResponse.json({ message: `${email} added successfully` })
    } catch (error) {
        console.log(error);
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
            where: { email: email.toLowerCase() }
        });
        return NextResponse.json({ user: deletedUser, message: "User deleted successfully" });
    } catch (error) {
        return NextResponse.json({ user: null, message: "Unable to delete user", error });
    }
}
