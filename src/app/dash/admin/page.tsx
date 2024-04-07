"use client";

import { NextPage } from "next";
import { ArrowUpDown, ChevronDown, LucideTrash, MoreHorizontal, Trash2, Trash2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/interface";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Form } from "@/components/admin/form";

interface Props {}

const Page: NextPage<Props> = ({}) => {
  const { data: session } = useSession();
  const [dataChanged, setdataChanged] = useState(false);
  const { toast } = useToast();
  const deleteUserHandler = async (email: string) => {
    try {
      const response = await axios.delete(`/api/admin/organisation`, {
        data: { email: email },
      });
      setdataChanged(!dataChanged);
      toast({ title: response?.data?.message });
    } catch (error) {
      console.log(error);
      toast({ title: "Something went wrong" });
    }
  };
  const AddAdminHandler = async ({ email, role }: { email: string; role: string }) => {
    if (email.length < 2) {
      toast({ title: "Email a valid email" });
    } else {
      try {
        const response = await axios.post(`/api/admin/inviteauser`, {
          email: email,
          organizationId: session?.user?.organizationId,
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
    <div className="">
      <Form
        columns={columns}
        setdataChanged={setdataChanged}
        dataChanged={dataChanged}
        AddAdminHandler={AddAdminHandler}
      />
    </div>
  );
};

export default Page;
