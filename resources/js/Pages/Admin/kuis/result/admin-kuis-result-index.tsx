import { Head, router } from "@inertiajs/react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, ChevronDown, CircleAlert, CircleCheckBig, FileDown, MoreHorizontal, RotateCcw, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { FormEvent, useState } from "react";

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
    const { toast } = useToast();

    type ResetForm = {
        praktikan_id: string;
        nama: string;
        validation: string;
        onSubmit: boolean;
    };
    const resetFormInit: ResetForm = {
        praktikan_id: "",
        nama: "",
        validation: "",
        onSubmit: false,
    };
    const [openResetForm, setOpenResetForm] = useState(false);
    const [resetForm, setResetForm] = useState<ResetForm>(resetFormInit);

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
                            <DropdownMenuItem
                                onClick={() => {
                                    setOpenResetForm(true);
                                    setResetForm((prevState) => ({
                                        ...prevState,
                                        praktikan_id: originalRow.id,
                                        nama: originalRow.nama,
                                    }));
                                }}
                            >
                                <RotateCcw /> Reset Data Kuis
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    const exportHasilKuis = (kuis: Kuis) => {
        window.location.href = route("admin.kuis.export", { id: kuis.id });
    };

    const handleResetFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResetForm((prevState) => ({ ...prevState, onSubmit: true }));
        const { praktikan_id } = resetForm;
        
        axios
            .post<{
                message: string;
            }>(route("admin.kuis.reset-praktikan"), {
                kuis_id: kuis.id,
                praktikan_id: praktikan_id,
            })
            .then((res) => {
                setResetForm(resetFormInit);
                setOpenResetForm(false);
                toast({
                    variant: "default",
                    className: "bg-green-500 text-white",
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.reload({ only: ["kuis"] });
            })
            .catch((err: unknown) => {
                const errMsg: string =
                    err instanceof AxiosError && err.response?.data?.message
                        ? err.response.data.message
                        : "Error tidak diketahui terjadi!";
                setResetForm((prevState) => ({
                    ...prevState,
                    onSubmit: false,
                }));
                toast({
                    variant: "destructive",
                    title: "Permintaan gagal diproses!",
                    description: errMsg,
                });
            });
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

                <AlertDialog open={openResetForm} onOpenChange={setOpenResetForm}>
                    <AlertDialogContent
                        className="my-alert-dialog-content"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reset Data Kuis Praktikan</AlertDialogTitle>
                            <AlertDialogDescription className="flex flex-col gap-0.5">
                                <span className="text-red-600 font-bold">
                                    Anda akan mereset/menghapus data pengerjaan Kuis!
                                </span>
                                <span className="*:text-red-600">
                                    Semua data pengerjaan {kuis.nama} milik{" "}
                                    <strong>{resetForm.nama}</strong> beserta nilai
                                    kuis akan dibersihkan dan diulang dari awal.
                                </span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form
                            className={cn("grid items-start gap-4")}
                            onSubmit={handleResetFormSubmit}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="validation">
                                    Validasi aksi anda
                                </Label>
                                <Input
                                    type="text"
                                    name="validation"
                                    id="validation"
                                    value={resetForm.validation}
                                    placeholder="RESET DATA"
                                    onChange={(event) =>
                                        setResetForm((prevState) => ({
                                            ...prevState,
                                            validation: event.target.value,
                                        }))
                                    }
                                    autoComplete="off"
                                />
                                <p>
                                    Ketik <strong>RESET DATA</strong> untuk
                                    melanjutkan
                                </p>
                            </div>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={
                                    resetForm.onSubmit ||
                                    resetForm.validation !== "RESET DATA"
                                }
                            >
                                {resetForm.onSubmit ? (
                                    <>
                                        Memproses{" "}
                                        <Loader2 className="animate-spin" />
                                    </>
                                ) : (
                                    <span>Hapus Data!</span>
                                )}
                            </Button>
                        </form>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                    </AlertDialogContent>
                </AlertDialog>
            </AdminLayout>
        </>
    );
}

