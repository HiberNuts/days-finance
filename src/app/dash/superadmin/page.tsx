"use client";
import AdminTable from "@/components/superadmin/table";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [dataChanged, setdataChanged] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ADMIN");

  const AddAdminHandler = async ({ email, role }: { email: string; role: string }) => {
    if (email.length < 2) {
      toast({ title: "Email a valid email" });
    } else {
      try {
        const response = await axios.post("http://localhost:3000/api/superadmin/inviteadmin", {
          email: email,
          role: role,
        });
        setdataChanged(!dataChanged);
        toast({ title: response?.data?.message });
      } catch (error) {
        console.log(error);
        toast({ title: "Something went wrong" });
      }
    }
  };

  const deleteUserHandler = async (email: string) => {
    try {
      const response = await axios.delete("http://localhost:3000/api/superadmin", {
        data: { email: email },
      });
      setdataChanged(!dataChanged);
      toast({ title: response?.data?.message });
    } catch (error) {
      console.log(error);
      toast({ title: "Something went wrong" });
    }
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/superadmin")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [dataChanged]);

  return (
    <div className="w-screen h-full flex items-center flex-col justify-center align-middle">
      <div className="items-center w-full flex flex-col justify-center align-middle">
        <p className="text-2xl">Welcome to Days Finance! </p>
        <p>Lets add some new gems to the days finance</p>
      </div>
      <div className="items-center w-full mt-10 flex flex-col justify-center align-middle">
        <div className="flex w-[500px] justify-evenly align-middle m-10">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter email of new Admins"
            className="w-[50%]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className=" p-1 border border-gray-300 rounded-md"
          >
            <option value="SUPERADMIN">SUPERADMIN</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <Button onClick={() => AddAdminHandler({ email, role })} className="text-2xl">
            +
          </Button>
        </div>
        <AdminTable data={data?.user} deleteUserHandler={deleteUserHandler} />
      </div>
    </div>
  );
};

export default Page;
