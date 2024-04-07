"use client";
import AdminTable from "@/components/superadmin/table";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/types/interface";
import { DataTable } from "@/components/ui/gridtable";
import { ArrowUpDown, ChevronDown, LucideTrash, MoreHorizontal, Trash2, Trash2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

const Page = () => {
  const [data, setData] = useState<{ user: User[] }>({ user: [] });
  const [isLoading, setLoading] = useState(true);
  const [dataChanged, setdataChanged] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ADMIN");

  const AddAdminHandler = async ({ email, role }: { email: string; role: string }) => {
    if (email.length < 2) {
      toast({ title: "Email a valid email" });
    } else {
      try {
        const response = await axios.post(`/api/superadmin/inviteadmin`, {
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
      const response = await axios.delete(`/api/superadmin `, {
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
    fetch(`/api/superadmin`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [dataChanged]);

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "resetToken",
      header: () => <div className="text-right">Status</div>,
      cell: ({ row }) => {
        let status = row.getValue("resetToken");
        return <div className="text-right font-medium">{status === "" ? "ACCEPTED" : "PENDING"}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button onClick={() => deleteUserHandler(row.getValue("email"))} className="font-medium  ">
            <LucideTrash color="white" />
          </Button>
        );
      },
    },
  ];

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
        <DataTable isLoading={isLoading} columns={columns} data={data?.user} />

        {/* <AdminTable data={data?.user} deleteUserHandler={deleteUserHandler} /> */}
      </div>
    </div>
  );
};

export default Page;
