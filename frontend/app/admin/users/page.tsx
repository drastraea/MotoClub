"use client";

import { useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { api, type MemberRow } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

const columnHelper = createColumnHelper<MemberRow>();

export default function AdminUsersPage() {
  const { data: users, loading, error, reload } = useApiData(
    useCallback(() => api.getMembers(), []),
    []
  );

  // POST /members/:id { role } — superadmin only; admins receive 403.
  const updateRole = async (id: string, role: "ADMIN" | "MEMBER") => {
    try {
      await api.updateMemberRole(id, role);
      toast.success("Role updated");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const removeUser = async (id: string) => {
    try {
      await api.deleteMember(id);
      toast.success("Member removed");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const columns = [
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("registration_date", { header: "Joined" }),
    columnHelper.display({
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const selectable = role === "admin" ? "ADMIN" : role === "member" ? "MEMBER" : undefined;
        return (
          <Select
            defaultValue={selectable}
            onValueChange={(value) => updateRole(row.original.id, value as "ADMIN" | "MEMBER")}
          >
            <SelectTrigger size="sm" className="w-32">
              <SelectValue placeholder={role} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Remove member"
          onClick={() => removeUser(row.original.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: users ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        User Management
      </h1>
      {loading && <p className="mt-2 text-muted-foreground">Loading…</p>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {users && <p className="mt-2 text-muted-foreground">{users.length} members</p>}

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
