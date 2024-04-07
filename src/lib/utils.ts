import { User } from "@/types/interface";
import { ColumnDef } from "@tanstack/react-table";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ArrowUpDown, ChevronDown, LucideTrash, MoreHorizontal, Trash2, Trash2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}

