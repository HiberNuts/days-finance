import Navbar from "@/components/ui/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <div className="flex flex-col w-full justify-evenly h-full">
      <Toaster />
      <div className="w-full flex-none ">
        <Navbar />
      </div>
      <div className="p-10">{children}</div>
    </div>
  );
}
