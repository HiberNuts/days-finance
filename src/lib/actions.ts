"use server";

import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';

export const AddAdminHandler = async ({ email, role }: { email: string; role: string }) => {
    if (email.length < 2) {
        return
    } else {
        try {
            const response = await axios.post("http://localhost:3000/api/superadmin", {
                email: email,
                role: role,
            });
            revalidatePath("/dash/superadmin");
            redirect("/dash/superadmin");
        } catch (error) {
            console.log(error);
        }
    }
};