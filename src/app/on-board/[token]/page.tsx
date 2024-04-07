"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string(),
  password: z.string().min(1, "Password is required").min(4, "Password must have than 4 characters"),
});

const ResetDefaultPassword = ({ params }: any) => {
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const router = useRouter();
  const [error, setError] = useState("");
  const [verified, setverified] = useState(false);
  const [user, setuser] = useState(null);

  useEffect(() => {}, [params.token]);
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.user.role == "SUPERADMIN") {
        router.replace("/dash/superadmin");
      } else {
        router.replace("/dash/admin");
      }
    }
  }, [session, sessionStatus]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  type FormData = z.infer<typeof formSchema>;

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    if (email.length < 2) {
      toast({ title: "Email a valid email" });
    }

    if (password.length < 4) {
      toast({ title: "Minimum password length is 4" });
    } else {
      try {
        const response = await axios.post(`/api/superadmin/accept-invitation`, {
          email: data.email,
          password: data.password,
          token: params.token,
        });
        if (response.status == 200) {
          toast({ title: response?.data?.message });
          router.replace("/login");
        }
      } catch (error) {
        console.log(error);
        toast({ title: "Something went wrong" });
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-fll h-screen">
      <p className="text-2xl mb-2">Register into Days Finance</p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="text-white p-4 md:p-16 border-[1.5px] rounded-lg border-gray-300 flex flex-col items-center justify-center gap-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Provide Email</FormLabel>
                <FormControl>
                  <Input required className="text-black" placeholder="Provide Email" {...field} type="text" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Provide Password</FormLabel>
                <FormControl>
                  <Input required className="text-black" placeholder="Hasło" {...field} type="password" />
                </FormControl>
                <span className="text-black text-sm">Min length 4</span>
              </FormItem>
            )}
          />
          <Button type="submit" className="hover:scale-110 hover:bg-cyan-700" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Opening...." : "Open Days Finance!"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ResetDefaultPassword;
