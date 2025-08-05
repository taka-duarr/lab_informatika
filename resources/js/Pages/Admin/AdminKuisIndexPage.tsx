import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminLayout } from "@/layouts/AdminLayout";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import {
    ArrowUpDown,
    MoreHorizontal,
    Pencil,
    Trash2,
    Plus,
    Loader2,
    Users2,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { TableSearchForm } from "@/components/table-search-form";
import { Head, router } from "@inertiajs/react";
import { PageProps, PaginationData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { cn, kuisDateTime, parseSesiTime } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DataTable from "@/components/data-table";

type Kuis = {
    id: string;
    nama: string;
    waktu_mulai: string;
    waktu_selesai: string;
    sesi_praktikum: {
        id: string;
        nama: string;
        hari: string;
        waktu_mulai: string;
        waktu_selesai: string;
    };
    pertemuan: {
        id: string;
        nama: string;
        praktikum: {
            id: string;
            nama: string;
        };
    };
};
export default function AdminKuisIndexPage({
    auth,
    pagination,
    currentDate,
}: PageProps<{
    pagination: PaginationData<Kuis[]>;
    currentDate: string;
}>) {
    const { toast } = useToast();
    type DeleteForm = {
        id: string;
        nama: string;
        validation: string;
        onSubmit: boolean;
    };
    const deleteFormInit: DeleteForm = {
        id: "",
        nama: "",
        validation: "",
        onSubmit: false,
    };
    const [openDeleteForm, setOpenDeleteForm] = useState(false);
    const [deleteForm, setDeleteForm] = useState<DeleteForm>(deleteFormInit);

    const columns: ColumnDef<Kuis>[] = [
        {
            accessorKey: "nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="w-full justify-start "
                    >
                        Nama Kuis
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize min-w-52 px-2">
                    {row.getValue("nama")}
                </div>
            ),
        },
        {
            accessorKey: "pertemuan.praktikum.nama",
            header: () => <div className="select-none">Praktikum</div>,
            cell: ({ row }) => {
                return (
                    <div className="min-w-36">
                        {row.original.pertemuan.praktikum.nama}
                    </div>
                );
            },
        },
        {
            accessorKey: "pertemuan.nama",
            header: () => <div className="select-none">Pertemuan</div>,
            cell: ({ row }) => {
                return (
                    <div className="min-w-28">
                        {row.original.pertemuan.nama}
                    </div>
                );
            },
        },
        {
            accessorKey: "sesi_praktikum.nama",
            header: () => <div className="select-none">Sesi Praktikum</div>,
            cell: ({ row }) => {
                const sesi = row.original.sesi_praktikum;
                return (
                    <div className="capitalize min-w-28 flex flex-col md:flex-row flex-wrap gap-x-0.5">
                        <p>{sesi ? `${sesi.nama} - ${sesi.hari} ` : "-"}</p>
                        <p>
                            {sesi
                                ? `(${parseSesiTime(
                                      sesi.waktu_mulai,
                                      currentDate
                                  )} - ${parseSesiTime(
                                      sesi.waktu_selesai,
                                      currentDate
                                  )})`
                                : ""}
                        </p>
                    </div>
                );
            },
        },
        {
            id: "waktu",
            accessorKey: "waktu_mulai",
            header: () => <div className="select-none">Waktu Pelaksanaan</div>,
            cell: ({ row }) => {
                return (
                    <div className="capitalize min-w-36">
                        {kuisDateTime(
                            row.original.waktu_mulai,
                            row.original.waktu_selesai
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
                                onClick={() =>
                                    router.visit(
                                        route("admin.kuis.update", {
                                            q: originalRow.id,
                                        })
                                    )
                                }
                            >
                                <Pencil /> Ubah data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    router.visit(
                                        route("admin.kuis.result", {
                                            id: originalRow.id,
                                        })
                                    )
                                }
                            >
                                <Users2 /> Hasil Kuis
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setOpenDeleteForm(true);
                                    setDeleteForm((prevState) => ({
                                        ...prevState,
                                        id: originalRow.id,
                                        nama: originalRow.nama,
                                    }));
                                }}
                            >
                                <Trash2 /> Hapus data
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const handleDeleteFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDeleteForm((prevState) => ({ ...prevState, onSubmit: true }));
        const { id } = deleteForm;
        const deleteSchema = z.object({
            id: z
                .string({ message: "Format Kuis tidak valid! " })
                .min(1, { message: "Format Kuis tidak valid!" }),
        });
        const deleteParse = deleteSchema.safeParse({
            id: id,
        });
        if (!deleteParse.success) {
            const errMsg = deleteParse.error.issues[0]?.message;
            toast({
                variant: "destructive",
                title: "Periksa kembali Input anda!",
                description: errMsg,
            });
            setDeleteForm((prevState) => ({ ...prevState, onSubmit: false }));
            return;
        }

        axios
            .post<{
                message: string;
            }>(route("kuis.delete"), {
                id: id,
            })
            .then((res) => {
                setDeleteForm(deleteFormInit);
                setOpenDeleteForm(false);
                toast({
                    variant: "default",
                    className: "bg-green-500 text-white",
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.reload({ only: ["pagination"] });
            })
            .catch((err: unknown) => {
                const errMsg: string =
                    err instanceof AxiosError && err.response?.data?.message
                        ? err.response.data.message
                        : "Error tidak diketahui terjadi!";
                setDeleteForm((prevState) => ({
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

    // console.log(pagination);

    return (
        <AdminLayout auth={auth}>
            <Head title="Admin - Manajemen Kuis" />
            <CardTitle>Manajemen Kuis</CardTitle>
            <CardDescription>Data Kuis</CardDescription>
            <div className="flex flex-col lg:flex-row gap-2 items-start justify-between">
                <Button
                    className="mt-4"
                    onClick={() => router.visit(route("admin.kuis.create"))}
                >
                    Buat <Plus />
                </Button>
                <TableSearchForm />
            </div>
            <DataTable<Kuis>
                columns={columns}
                data={pagination.data}
                pagination={pagination}
            />

            {/*--DELETE-FORM--*/}
            <AlertDialog open={openDeleteForm} onOpenChange={setOpenDeleteForm}>
                <AlertDialogContent
                    className="my-alert-dialog-content"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kuis</AlertDialogTitle>
                        <AlertDialogDescription className="flex flex-col gap-0.5">
                            <span className="text-red-600 font-bold">
                                Anda akan menghapus Kuis!
                            </span>
                            <span className="*:text-red-600">
                                Semua data Kuis{" "}
                                <strong>{deleteForm.nama}</strong> seperti nilai
                                kuis dan sebagainya akan juga terhapus
                            </span>
                            <br />
                            <span className="text-red-600">
                                Data yang terhapus tidak akan bisa dikembalikan!
                                harap gunakan dengan hati-hati
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        className={cn("grid items-start gap-4")}
                        onSubmit={handleDeleteFormSubmit}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="validation">
                                Validasi aksi anda
                            </Label>
                            <Input
                                type="text"
                                name="validation"
                                id="validation"
                                value={deleteForm.validation}
                                placeholder="INFORMATIKA JAYA"
                                onChange={(event) =>
                                    setDeleteForm((prevState) => ({
                                        ...prevState,
                                        validation: event.target.value,
                                    }))
                                }
                                autoComplete="off"
                            />
                            <p>
                                Ketik <strong>INFORMATIKA JAYA</strong> untuk
                                melanjutkan
                            </p>
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                deleteForm.onSubmit ||
                                deleteForm.validation !== "INFORMATIKA JAYA"
                            }
                        >
                            {deleteForm.onSubmit ? (
                                <>
                                    Memproses{" "}
                                    <Loader2 className="animate-spin" />
                                </>
                            ) : (
                                <span>Simpan</span>
                            )}
                        </Button>
                    </form>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>
            {/*---DELETE-FORM---*/}
        </AdminLayout>
    );
}
