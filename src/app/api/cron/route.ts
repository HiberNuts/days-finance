import prisma from "@/lib/db";
import { NextResponse } from "next/server"

export async function GET() {
    const currentDate = new Date();
    const fourteenDaysAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000); // Subtract 14 days in milliseconds
    try {
        console.log(`CRON STARTED ->>>>>>>>`);

        const organizationsToDelete = await prisma.organisation.findMany({
            where: {
                updatedAt: { lt: fourteenDaysAgo },
                companyName: ''
            }
        });
        for (const organization of organizationsToDelete) {
            await prisma.organisation.delete({
                where: {
                    id: organization.id
                }
            });
            console.log(`Deleted organization with ID ${organization.id}`);
        }
        console.log(`CRON ENDED ->>>>>>>>`);

    } catch (error) {
        console.log("Error while deleting organization", error);

    }


}