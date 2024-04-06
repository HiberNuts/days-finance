import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { NextPage } from "next";
import { Session } from "next-auth";
import { getServerSession } from "next-auth";

interface Props {}

const Page: NextPage<Props> = async ({}) => {
  const session = await getServerSession(authOptions);

  return (
    <div className="w-full flex items-center flex-col justify-center align-middle">
      <div className="items-center w-full">
        <span>Welcome to Days Finance!</span>
      </div>
      {/* {session?.user?.role == "SUPERADMIN" && <Button>Access Super Admin Dashboard</Button>} */}
    </div>
  );
};

export default Page;
