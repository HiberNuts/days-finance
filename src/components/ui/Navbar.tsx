import Link from "next/link";

import { HandMetal } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "./button";
import UserAccountnav from "./UserAccountnav";

const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className=" bg-zinc-100 py-6 border-b border-s-zinc-200 fixed w-full z-10 top-0">
      <div className="container flex items-center justify-between">
        <Link className="flex gap-2" href="/">
          <HandMetal /> Days Finance
        </Link>
        {session?.user ? (
          <UserAccountnav />
        ) : (
          <Link type="btn" href="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
