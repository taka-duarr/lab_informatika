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
import { Head } from "@inertiajs/react";
import { DosenLayout } from "@/layouts/DosenLayout";

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
    aslab: {
        id: string;
        nama: string;
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
    pertemuan: {
        id: string;
        nama: string;
        modul: {
            id: string;
            nama: string;
        }[];
    }[];
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

        const modulMap = new Set<string>();
        praktikum.pertemuan.forEach((pertemuan) => {
            pertemuan.modul.forEach((modul) => modulMap.add(modul.nama));
        });

        const modulList = Array.from(modulMap); // <- Perbaikan di sini

        // Buat data export
        const data = praktikum.praktikans.map(p => {
            const modulValues: Record<string, string> = {};
            modulList.forEach(modul => {
                modulValues[modul] = ''; // Kosongkan nilai, nanti bisa diisi skor/nilai
            });

            return {
                'NPM': p.username,
                'Nama': p.nama,
                'Sesi': p.sesi_praktikum?.nama ?? '-',
                ...modulValues
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Tambahkan border ke semua cell
        const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellAddress]) continue;

                worksheet[cellAddress].s = {
                    border: {
                        top: { style: "thin", color: { auto: 1 } },
                        right: { style: "thin", color: { auto: 1 } },
                        bottom: { style: "thin", color: { auto: 1 } },
                        left: { style: "thin", color: { auto: 1 } },
                    },
                };
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Praktikan');

        XLSX.writeFile(workbook, `daftar-praktikan-${auth.user?.nama ?? ''}-praktikum-${praktikum.nama}.xlsx`);
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
            accessorKey: "aslab",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-52 justify-start"
                    >
                        Asisten Laboratorium
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const aslab = row.original.aslab;
                return (
                    <div className="capitalize w-52 ml-4 flex items-center gap-2">
                        <p className="line-clamp-2 text-ellipsis">{ aslab ? `${aslab.nama}` : '-'  }</p>
                    </div>
                );
            },
        },
    ];


    return (
        <>
            <DosenLayout auth={auth}>
                <Head title="Aslab - Manajemen Praktikum" />
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
                <DataTable<Praktikan>
                    columns={columns}
                    data={praktikum.praktikans}
                    withNumber={true}
                    showViewPerPage={false}
                />
            </DosenLayout>
        </>
    );
}
