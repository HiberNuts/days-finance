import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Session } from "@/types/interface";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";
import { z } from "zod";

const OrgUpdateSchema = z
    .object({
        id: z.string().optional(),
        companyName: z.string().min(1, 'Company Name is required').optional(),
        address: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipcode: z.string().optional()
    })

type DataToUpdate = {
    companyName?: string;
    address?: string;
    country?: string;
    city?: string;
    state?: string;
    zipcode?: string;
};




export async function GET(req: Request) {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const id = searchParams.get("id") || ""

    const session: Session | null = await getServerSession(authOptions);

    try {
        const org = await prisma.organisation.findUnique({
            where: { id: id },

            select: {
                companyName: true,
                address: true,
                country: true,
                city: true,
                state: true,
                zipcode: true,
                users: {
                    select: {
                        email: true,
                        organizationId: true,
                        id: true,
                        role: true,
                        resetToken: true
                    }
                }
            }

        });
        if (!org) {
            return NextResponse.json({ organisation: null, message: "Organization not found" }, { status: 404 });
        }

        // Check if user is org admin
        if (session?.user?.organizationId === id) {
            return NextResponse.json({ organization: org, message: "Organization data retrieved successfully" }, { status: 200 });
        } else {
            return NextResponse.json({ organization: null, message: "Unauthorized to access organization data" }, { status: 403 });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ organization: null, message: "Failed to retrieve organization data", error }, { status: 400 });
    }
}

export async function POST(req: Request) {
    const body = await req.json();
    const { id, companyName, address, country, city, state, zipcode } = OrgUpdateSchema.parse(body);

    try {
        const dataToUpdate: DataToUpdate = {};
        if (companyName) dataToUpdate.companyName = companyName;
        if (address) dataToUpdate.address = address;
        if (country) dataToUpdate.country = country;
        if (city) dataToUpdate.city = city;
        if (state) dataToUpdate.state = state;
        if (zipcode) dataToUpdate.zipcode = zipcode;

        const updatedOrg = await prisma.organisation.update({
            where: { id },
            data: dataToUpdate
        });

        return NextResponse.json({ organisation: updatedOrg, message: "Organization updated successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ organisation: null, message: "Failed to update organization", error }, { status: 400 });
    }
}
