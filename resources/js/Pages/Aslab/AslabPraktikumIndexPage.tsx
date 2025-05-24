import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AslabLayout } from "@/layouts/AslabLayout";
import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Users2 } from "lucide-react"
import { romanToNumber } from "@/lib/utils";
import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import DataTable from "@/components/data-table";

type Praktikum = {
    id: string;
    nama: string;
    tahun: string;
    periode: {
        id: string;
        nama: string;
    } | null;
    praktikan_count: number;
};

export default function AslabPraktikumIndexPage({ auth, praktikums }: PageProps<{
    praktikums: Praktikum[];
}>) {
    const columns: ColumnDef<Praktikum>[] = [
        {
            accessorKey: "nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-full justify-start"
                    >
                        Praktikum
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize ml-2 min-w-48 truncate px-2">
                    {row.getValue("nama")}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.periode?.nama || "-",
            id: "periode.nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-full justify-start"
                    >
                        Periode
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="capitalize min-w-20 indent-4">
                        {row.getValue<string>("periode.nama")}
                    </div>
                );
            },
            sortingFn: (rowA, rowB) => {
                const valueA = romanToNumber(rowA.getValue<string>("periode.nama"));
                const valueB = romanToNumber(rowB.getValue<string>("periode.nama"));
                return valueA - valueB;
            },
        },
        {
            accessorKey: "tahun",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-full justify-start"
                    >
                        Tahun
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize min-w-20 indent-4">
                    {row.getValue("tahun")}
                </div>
            ),
        },
        {
            accessorKey: "praktikan_count",
            header: () => {
                return (
                    <div className="w-full justify-start">
                        Jumlah Praktikan
                    </div>
                );
            },
            cell: ({ row }) => (
                <div className="min-w-20 indent-4">
                    { row.getValue("praktikan_count")} Praktikan
                </div>
            ),
        },

        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const originalRow = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={ () => router.visit(route('aslab.praktikum.details', { id: originalRow.id })) }>
                                <Users2 /> Detail Praktikum
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AslabLayout auth={auth}>
            <Head title="Aslab - Manajemen Praktikum" />
            <CardTitle>
                Manajemen Praktikum
            </CardTitle>
            <CardDescription className="!mb-8">
                Data Praktikum yang terdaftar
            </CardDescription>
            <DataTable<Praktikum>
                columns={columns}
                data={praktikums}
                withNumber={true}
                showViewPerPage={false}
            />
        </AslabLayout>
    );
}
