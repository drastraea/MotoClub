"use client";

import { useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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

const columns = [
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => {
      const role = info.getValue();
      return (
        <Badge variant={role === "admin" || role === "superadmin" ? "default" : "secondary"}>
          {role}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("registration_date", { header: "Joined" }),
];

export default function MembersPage() {
  const { data: members, loading, error } = useApiData(
    useCallback(() => api.getMembers(), []),
    []
  );

  const table = useReactTable({
    data: members ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Member Directory
      </h1>
      {loading && <p className="mt-2 text-muted-foreground">Loading…</p>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {members && <p className="mt-2 text-muted-foreground">{members.length} members</p>}

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
