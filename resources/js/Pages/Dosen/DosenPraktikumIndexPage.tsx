import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table"
import {
    ArrowUpDown,
    CheckCircle2,
    CircleX,
    FileSearch,
} from "lucide-react"
import { romanToNumber } from "@/lib/utils";
import { Head, router } from "@inertiajs/react";
import { PageProps, PaginationData } from "@/types";
import DataTable from "@/components/data-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as React from "react";
import { DosenLayout } from "@/layouts/DosenLayout";

type Praktikum = {
    id: string;
    nama: string;
    tahun: string;
    status: boolean;
    periode: {
        id: string;
        nama: string;
    } | null;
    praktikan_count: number;
};

export default function DosenPraktikumIndexPage({ auth, pagination }: PageProps<{
    pagination: PaginationData<Praktikum[]>;
}>) {
    console.log(pagination);
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
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-full min-w-20 justify-start"
                    >
                        Status
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <div className="flex items-center gap-1 min-w-20 text-xs ml-3 font-medium">
                        { status
                            ? (
                                <>
                                    <CheckCircle2 className="text-green-600" strokeWidth={2.5} width={22} />
                                    <p className="text-start ">Aktif</p>
                                </>
                            ) : (
                                <>
                                    <CircleX className="text-red-600" strokeWidth={2.5} width={22} />
                                    <p className="text-start ">Nonaktif</p>
                                </>
                            )
                        }
                    </div>
                )
            },
        },
        {
            accessorKey: "praktikan_count",
            header: () => {
                return (
                    <div className="min-w-28 justify-start">
                        Jumlah Praktikan
                    </div>
                );
            },
            cell: ({ row }) => (
                <div className="min-w-28 indent-4">
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
                    <TooltipProvider>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="mr-3 w-8 h-8 bg-blue-600 text-white hover:bg-blue-600/90 hover:text-white"
                                    onClick={() => router.visit(route('dosen.praktikum.details', { id: originalRow.id }))}
                                >
                                    <FileSearch width={20} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">
                                    Detail Praktikum
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
    ];

    return (
        <DosenLayout auth={auth}>
            <Head title="Dosen - Manajemen Praktikum" />
            <CardTitle>
                Manajemen Praktikum
            </CardTitle>
            <CardDescription className="!mb-8">
                Data Praktikum yang terdaftar
            </CardDescription>
            <DataTable<Praktikum>
                columns={columns}
                data={pagination.data}
                pagination={pagination}
                withNumber={true}
            />
        </DosenLayout>
    );
}
