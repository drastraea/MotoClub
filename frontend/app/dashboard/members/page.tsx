"use client";

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

type Member = {
  name: string;
  email: string;
  role: "Member" | "Admin";
  joinedAt: string;
};

// TODO: Replace with GET /members (see api_contract.json)
const members: Member[] = [
  { name: "Alex Rider", email: "alex.rider@example.com", role: "Admin", joinedAt: "2023-01-15" },
  { name: "Jordan Blake", email: "jordan.blake@example.com", role: "Member", joinedAt: "2023-06-02" },
  { name: "Sam Carter", email: "sam.carter@example.com", role: "Member", joinedAt: "2024-02-20" },
  { name: "Riley Storm", email: "riley.storm@example.com", role: "Member", joinedAt: "2024-05-11" },
  { name: "Casey Vance", email: "casey.vance@example.com", role: "Member", joinedAt: "2025-01-30" },
];

const columnHelper = createColumnHelper<Member>();

const columns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => (
      <Badge variant={info.getValue() === "Admin" ? "default" : "secondary"}>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("joinedAt", { header: "Joined" }),
];

export default function MembersPage() {
  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Member Directory
      </h1>
      <p className="mt-2 text-muted-foreground">{members.length} members</p>

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
