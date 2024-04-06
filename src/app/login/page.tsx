"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signIn, useSession } from "next-auth/react";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  email: z.string(),
  password: z.string().min(1, "Password is required").min(4, "Password must have than 4 characters"),
});

export default function Login() {
  const { data: session } = useSession();

  const { toast } = useToast();
  const router = useRouter();

  if (session?.user?.email && session?.user?.role == "SUPERADMIN") {
    router.push("/dash/superadmin");
  }
  if (session?.user?.email && session?.user?.role == "ADMIN") {
    router.push("/dash/admin");
  }

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

    try {
      const response: any = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (response?.ok == false) {
        router.push("/");
        router.refresh();
      } else {
        toast({ title: "Login Successful" });
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      toast({ title: "Login Successful",  });
    } catch (error: any) {
      console.error("Login Failed:", error);
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-fll h-screen">
      <p className="text-2xl">Login Here</p>

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
                <FormLabel>Provide Email</FormLabel>
                <FormControl>
                  <Input className="text-black" placeholder="Provide Email" {...field} type="text" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provide Password</FormLabel>
                <FormControl>
                  <Input className="text-black" placeholder="Hasło" {...field} type="password" />
                </FormControl>
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
}
