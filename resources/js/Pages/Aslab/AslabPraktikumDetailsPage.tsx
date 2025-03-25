import { AslabLayout } from "@/layouts/AslabLayout";
import { PageProps } from "@/types";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, FileDown } from "lucide-react";
import * as React from "react";
import * as XLSX from "xlsx";
import { ColumnDef } from "@tanstack/react-table";
import { parseSesiTime } from "@/lib/utils";
import DataTable from "@/components/data-table";

type Praktikan = {
    id: string;
    nama: string;
    username: string;
    sesi_praktikum: {
        id: string;
        nama: string;
        hari: string;
        waktu_mulai: string;
        waktu_selesai: string;
    } | null;
    dosen: {
        id: string;
        nama: string;
    } | null;
};
type Praktikum = {
    id: string;
    nama: string;
    tahun: number;
    periode: {
        id: string;
        nama: string;
    } | null;
    praktikans: Praktikan[];
};
export default function AslabPraktikumDetailsPage({ auth, currentDate, praktikum }: PageProps<{
    currentDate: string;
    praktikum: Praktikum;
}>) {
    const exportPraktikan = () => {
        if (praktikum.praktikans.length < 1) return;

        const data = praktikum.praktikans.map(p => ({
            'NPM': p.username,
            'Nama': p.nama,
            'Sesi': p.sesi_praktikum?.nama ?? '-',
            'Dosen Pembimbing': p.dosen?.nama ?? '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Praktikan');

        XLSX.writeFile(workbook, `daftar-praktikan-${(auth.user?.nama ?? '' )}-praktikum-${praktikum.nama}.xlsx`);
    };
    const columns: ColumnDef<Praktikan>[] = [
        {
            accessorKey: "username",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="min-w-24 justify-start items-start"
                    >
                        NPM
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase min-w-24 ml-4">{row.getValue("username")}</div>,
        },
        {
            accessorKey: "nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-full justify-start "
                    >
                        Nama
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return (
                    <>
                        <div className="min-w-52 ml-4 flex items-center gap-2">
                            <p className="line-clamp-2">{row.getValue("nama")}</p>
                        </div>
                    </>
                )
            },
        },
        {
            accessorKey: "sesi_praktikum",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-full justify-start "
                    >
                        Sesi Praktikum
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const sesi = row.original.sesi_praktikum;
                return (
                    <div className="capitalize w-24 ml-4 flex flex-col md:flex-row flex-wrap gap-x-0.5">
                        <p>{ sesi ? `${sesi.nama} - ${sesi.hari} ` : '-'}</p>
                        <p>{ sesi ? `(${parseSesiTime(sesi.waktu_mulai, currentDate)} - ${parseSesiTime(sesi.waktu_selesai, currentDate)})` : ""}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: "dosen",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-52 justify-start"
                    >
                        Dosen Pembimbing
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const dosen = row.original.dosen;
                return (
                    <div className="capitalize w-52 ml-4 flex items-center gap-2">
                        <p className="line-clamp-2 text-ellipsis">{ dosen ? `${dosen.nama}` : '-'  }</p>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <AslabLayout auth={auth}>
                <CardTitle>
                    Detail Praktikum { praktikum.nama }
                </CardTitle>
                <CardDescription>
                    Menampilkan data Praktikum dan Praktikan
                </CardDescription>
                <div className="!my-8 flex flex-row items-center justify-between gap-2">
                    <h3 className="text-base font-medium ">
                        Data Praktikan Terdaftar
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
                            <DropdownMenuItem onClick={exportPraktikan}>
                                Data Praktikan <strong>(xlsx)</strong>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <DataTable
                    columns={columns}
                    data={praktikum.praktikans}
                    withNumber={true}
                    showViewPerPage={false}
                />
            </AslabLayout>
        </>
    );
}
