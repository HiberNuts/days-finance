

import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { Role } from "@prisma/client";



const UserSchema = z
    .object({
        email: z.string().min(1, 'Email is required').email('Invalid email'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(4, 'Password must have than 4 characters'),
        role: z.string()
    })


export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, role } = UserSchema.parse(body);

        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: email }
        })
        if (existingUserByEmail) {
            return NextResponse.json({ user: null, message: "User already exists" })

        }

        const hashedPassword = await hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role as Role
            }
        })

        return NextResponse.json({ user: newUser, message: "User created successfully" })
    } catch (error) {
        return NextResponse.json({ message: "Something Went Wrong" }, { status: 500 })
    }

}