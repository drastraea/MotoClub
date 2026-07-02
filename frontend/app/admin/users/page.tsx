"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type Role = "MEMBER" | "ADMIN";
type User = { id: string; name: string; email: string; role: Role; joinedAt: string };

// TODO: Replace with GET /members (see api_contract.json)
const initialUsers: User[] = [
  { id: "1", name: "Alex Rider", email: "alex.rider@example.com", role: "ADMIN", joinedAt: "2023-01-15" },
  { id: "2", name: "Jordan Blake", email: "jordan.blake@example.com", role: "MEMBER", joinedAt: "2023-06-02" },
  { id: "3", name: "Sam Carter", email: "sam.carter@example.com", role: "MEMBER", joinedAt: "2024-02-20" },
  { id: "4", name: "Riley Storm", email: "riley.storm@example.com", role: "MEMBER", joinedAt: "2024-05-11" },
  { id: "5", name: "Casey Vance", email: "casey.vance@example.com", role: "MEMBER", joinedAt: "2025-01-30" },
];

const columnHelper = createColumnHelper<User>();

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);

  // TODO: Replace with POST /members/:id { role } (see
  // backend/internal/handler/member_handler.go - note this is
  // superadmin-only there, not just admin, and role values are
  // "ADMIN"/"MEMBER" uppercase, unlike api_contract.json's stale example)
  const updateRole = (id: string, role: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Role updated");
  };

  const columns = [
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("joinedAt", { header: "Joined" }),
    columnHelper.display({
      id: "role",
      header: "Role",
      cell: ({ row }) => (
        <Select
          defaultValue={row.original.role}
          onValueChange={(value) => updateRole(row.original.id, value as Role)}
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEMBER">Member</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      ),
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        User Management
      </h1>
      <p className="mt-2 text-muted-foreground">{users.length} members</p>

      <div className="shape-corner mt-8 overflow-hidden border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
