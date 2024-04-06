import { Delete, DeleteIcon, Trash } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface User {
  id: string;
  email: string;
  role: string;
}

const AdminTable = ({ data, deleteUserHandler }: any) => {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Admin Email
            </th>
            <th scope="col" className="px-6 py-3">
              Delete
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.user?.map((d: User) => (
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {d.email}
              </th>

              <td className="px-6 py-4 text-right">
                <Button
                  onClick={() => deleteUserHandler(d.email)}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  <Trash color="white" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
