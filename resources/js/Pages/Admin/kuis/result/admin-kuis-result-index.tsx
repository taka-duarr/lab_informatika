import { Head } from "@inertiajs/react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, ChevronDown, CircleAlert, CircleCheckBig, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/data-table";
import { AdminLayout } from "@/layouts/AdminLayout";
import * as React from "react";
import { PageProps } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

type Praktikan = {
    id: string;
    nama: string;
    username: string;
    skor: number;
    selesai: boolean;
    updated_at: string | null;
};
type Kuis = {
    id: string;
    nama: string; //Nama Kuis
    praktikans: Praktikan[];
};
export default function AdminKuisResult({ auth, kuis }: PageProps<{
    kuis: Kuis
}>) {

    const columns: ColumnDef<Praktikan>[] = [
        {
            accessorKey: "username",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="min-w-32 justify-start"
                >
                    NPM
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="w-32 pl-4 text-left truncate">
                    { row.original.username }
                </div>
            ),
        },
        {
            accessorKey: "nama",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="w-full justify-start"
                >
                    Nama
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="w-full ml-4 text-left truncate overflow-hidden whitespace-nowrap">
                    { row.original.nama }
                </div>
            ),
        },
        {
            accessorKey: "skor",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="w-32 text-center"
                >
                    Skor
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="w-32 text-center truncate">
                    { row.original.skor }
                </div>
            ),
        },
        {
            accessorKey: "selesai",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="w-32 justify-start"
                >
                    Selesai
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => {
                const selesai = row.original.selesai;
                return (
                    <div
                        className={`w-32 flex gap-1 items-center justify-center ${
                            selesai ? "text-green-600" : "text-red-500"
                        } text-sm`}
                    >
                        {selesai ? (
                            <>
                                <CircleCheckBig
                                    size={20}
                                    strokeWidth={2.5}
                                    color="green"
                                />
                            </>
                        ) : (
                            <>
                                <CircleAlert size={20} strokeWidth={2.5} />
                            </>
                        )}
                    </div>
                );
            },
        },
    ];
    const exportHasilKuis = (kuis: Kuis) => {
        window.location.href = route("admin.kuis.export", { id: kuis.id });
    };


    return (
        <>
            <AdminLayout auth={auth}>
                <Head title={`Admin - Hasil Kuis ${kuis.nama}`} />
                <CardTitle>Data Praktikan</CardTitle>
                <CardDescription>
                    Menampilkan data Hasil Kuis {kuis.nama}
                </CardDescription>

                <div className="flex flex-row items-center justify-between gap-2">
                    <h3 className="text-base font-medium sm:!mt-5">
                        Data Kuis Praktikan
                    </h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Unduh Berkas
                                <FileDown />
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-auto">
                            <DropdownMenuLabel>Unduh Berkas</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onSelect={() => exportHasilKuis(kuis)}
                            >
                                Hasil Kuis <strong>(xlsx)</strong>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <DataTable<Praktikan>
                    columns={columns}
                    data={kuis.praktikans}
                    showViewPerPage={false}
                    withNumber={true}
                />
            </AdminLayout>
        </>
    );
}
