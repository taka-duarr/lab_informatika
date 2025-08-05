import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
    ArrowUpDown,
    MoreHorizontal,
    Plus,
    Loader2,
    Pencil,
    Trash2,
    EyeOff,
    Eye,
    LockKeyhole,
} from "lucide-react";
import React, { FormEvent, useState } from "react";
import { TableSearchForm } from "@/components/table-search-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Head, router } from "@inertiajs/react";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { PageProps, PaginationData } from "@/types";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DataTable from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Admin = {
    id: string;
    nama: string;
    username: string;
    laboratorium: {
        id: string;
        nama: string;
    } | null;
};
export default function AdminAdminIndexPage({
    auth,
    pagination,
    laboratoriums,
    isSuper}: PageProps<{
    pagination: PaginationData<Admin[]>;
    laboratoriums: {
        id: string;
        nama: string;
    }[];
    isSuper: boolean;
}>) {
    const { toast } = useToast();
    type CreateForm = {
        nama: string;
        username: string;
        password: string;
        laboratorium: string | null;
        onSubmit: boolean;
    };
    type UpdateForm = {
        id: string;
        nama: string;
        username: string;
        laboratorium: string | null;
        onSubmit: boolean;
    };
    type UpdatePasswordForm = {
        id: string;
        nama: string;
        password: string;
        repeatPassword: string;
        onSubmit: boolean;
    };
    type DeleteForm = {
        id: string;
        nama: string;
        validation: string;
        onSubmit: boolean;
    };
    const createFormInit: CreateForm = {
        nama: "",
        username: "",
        password: "",
        laboratorium: null,
        onSubmit: false,
    };
    const updateFormInit: UpdateForm = {
        id: "",
        nama: "",
        username: "",
        laboratorium: "",
        onSubmit: false,
    };
    const updatePasswordFormInit: UpdatePasswordForm = {
        id: "",
        nama: "",
        password: "",
        repeatPassword: "",
        onSubmit: false,
    };
    const deleteFormInit: DeleteForm = {
        id: "",
        nama: "",
        validation: "",
        onSubmit: false,
    };
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [openUpdatePasswordForm, setOpenUpdatePasswordForm] = useState(false);
    const [openDeleteForm, setOpenDeleteForm] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

    const [createForm, setCreateForm] = useState<CreateForm>(createFormInit);
    const [updateForm, setUpdateForm] = useState<UpdateForm>(updateFormInit);
    const [updatePasswordForm, setUpdatePasswordForm] =
        useState<UpdatePasswordForm>(updatePasswordFormInit);
    const [deleteForm, setDeleteForm] = useState<DeleteForm>(deleteFormInit);

    const columns: ColumnDef<Admin>[] = [
        {
            accessorKey: "nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="w-full justify-start"
                    >
                        Nama Admin
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="capitalize min-w-36 ml-4">
                    {row.getValue("nama")}
                </div>
            ),
        },
        {
            accessorKey: "username",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="w-full justify-start"
                    >
                        Username
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="min-w-16 ml-4">{row.getValue("username")}</div>
            ),
        },
        {
            accessorKey: "laboratorium",
            header: () => {
                return <div className="w-full justify-start">Laboratorium</div>;
            },
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.laboratorium?.nama ? (
                        row.original.laboratorium.nama
                    ) : (
                        <p className="text-gray-500 italic font-semibold">
                            Shadow
                        </p>
                    )}
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
                            <DropdownMenuItem
                                disabled={
                                    !(
                                        isSuper ||
                                        (auth.user?.laboratorium_id === null &&
                                            originalRow.laboratorium !== null)
                                    )
                                }
                                onClick={() => {
                                    setOpenUpdateForm(true);
                                    setUpdateForm((prevState) => ({
                                        ...prevState,
                                        id: originalRow.id,
                                        nama: originalRow.nama,
                                        username: originalRow.username,
                                        laboratorium: String(
                                            originalRow?.laboratorium?.id ??
                                                null
                                        ),
                                    }));
                                }}
                            >
                                <Pencil /> Ubah data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={
                                    !(
                                        isSuper ||
                                        (auth.user?.laboratorium_id === null &&
                                            originalRow.laboratorium !== null)
                                    )
                                }
                                onClick={() => {
                                    setOpenUpdatePasswordForm(true);
                                    setUpdatePasswordForm((prevState) => ({
                                        ...prevState,
                                        id: originalRow.id,
                                        nama: originalRow.nama,
                                    }));
                                }}
                            >
                                <LockKeyhole /> Ubah Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={
                                    !(
                                        isSuper ||
                                        (auth.user?.laboratorium_id === null &&
                                            originalRow.laboratorium !== null)
                                    )
                                }
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

    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };
    const handleOpenCreateForm = (open: boolean = true) => {
        setOpenCreateForm(open);
        !open && setCreateForm(createFormInit);
    };
    const handleOpenUpdateForm = (open: boolean = true) => {
        setOpenUpdateForm(open);
        !open && setUpdateForm(updateFormInit);
        !open && setPasswordVisible(false);
    };
    const handleOpenUpdatePasswordForm = (open: boolean = true) => {
        setOpenUpdatePasswordForm(open);
        !open && setUpdatePasswordForm(updatePasswordFormInit);
        !open && setPasswordVisible(false);
    };
    const handleCreateFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCreateForm((prevState) => ({ ...prevState, onSubmit: true }));
        const { nama, username, password, laboratorium } = createForm;
        const namaSchema = z.object({
            nama: z
                .string({ message: "Format nama tidak valid! " })
                .min(1, { message: "Nama Admin wajib diisi!" }),
            username: z
                .string({ message: "Format Username tidak valid! " })
                .min(1, { message: "Username Admin wajib diisi!" }),
        });
        const createParse = namaSchema.safeParse({
            nama: nama,
            username: username,
        });
        if (!createParse.success) {
            const errMsg = createParse.error.issues[0]?.message;
            toast({
                variant: "destructive",
                title: "Periksa kembali Input anda!",
                description: errMsg,
            });
            setCreateForm((prevState) => ({ ...prevState, onSubmit: false }));
            return;
        }

        axios
            .post<{
                message: string;
            }>(route("admin.create"), {
                nama: nama,
                username: username,
                password: password,
                laboratorium_id: laboratorium === "null" ? null : laboratorium,
            })
            .then((res) => {
                setCreateForm(createFormInit);
                setOpenCreateForm(false);
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
                setCreateForm((prevState) => ({
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
    const handleUpdateFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setUpdateForm((prevState) => ({ ...prevState, onSubmit: true }));
        const { id, nama, username, laboratorium } = updateForm;
        const updateSchema = z.object({
            id: z
                .string({ message: "Format Admin tidak valid! " })
                .min(1, { message: "Format Admin tidak valid!" }),
            nama: z
                .string({ message: "Format nama tidak valid! " })
                .min(1, { message: "Nama Admin wajib diisi!" }),
            username: z
                .string({ message: "Format Username tidak valid! " })
                .min(1, { message: "Username Admin wajib diisi!" }),
        });
        const updateParse = updateSchema.safeParse({
            id: id,
            nama: nama,
            username: username,
        });
        if (!updateParse.success) {
            const errMsg = updateParse.error.issues[0]?.message;
            toast({
                variant: "destructive",
                title: "Periksa kembali Input anda!",
                description: errMsg,
            });
            setUpdateForm((prevState) => ({ ...prevState, onSubmit: false }));
            return;
        }

        axios
            .post<{
                message: string;
            }>(route("admin.update"), {
                id: id,
                nama: nama,
                username: username,
                laboratorium_id: laboratorium === "null" ? null : laboratorium,
            })
            .then((res) => {
                setUpdateForm(updateFormInit);
                setOpenUpdateForm(false);
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
                setUpdateForm((prevState) => ({
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
    const handleUpdatePasswordFormSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setUpdatePasswordForm((prevState) => ({
            ...prevState,
            onSubmit: true,
        }));
        const { id, password, repeatPassword } = updatePasswordForm;
        axios
            .post<{
                message: string;
            }>(route("admin.update-password"), {
                id: id,
                password: password,
                repeat_password: repeatPassword,
            })
            .then((res) => {
                setUpdatePasswordForm(updatePasswordFormInit);
                setOpenUpdatePasswordForm(false);
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
                setUpdatePasswordForm((prevState) => ({
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
    const handleDeleteFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDeleteForm((prevState) => ({ ...prevState, onSubmit: true }));
        const { id } = deleteForm;
        const deleteSchema = z.object({
            id: z
                .string({ message: "Format Admin tidak valid! " })
                .min(1, { message: "Format Admin tidak valid!" }),
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
            }>(route("admin.delete"), {
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

    return (
        <AdminLayout auth={auth}>
            <Head title="Admin - Manajemen Admin" />
            <CardTitle>Manajemen Admin</CardTitle>
            <CardDescription>Data Admin yang terdaftar</CardDescription>
            <div className="flex flex-col lg:flex-row gap-2 items-start justify-between">
                <AlertDialog
                    open={openCreateForm}
                    onOpenChange={handleOpenCreateForm}
                >
                    <AlertDialogTrigger asChild>
                        <Button className="mt-4">
                            Buat <Plus />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                        className="my-alert-dialog-content"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Menambahkan Admin
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Menambahkan Admin baru, Panjang{" "}
                                <strong>Password</strong> minimal adalah 6
                                karakter. Gunakan <strong>Password</strong> yang
                                aman ya gaes
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form
                            className={cn("grid items-start gap-4")}
                            onSubmit={handleCreateFormSubmit}
                        >
                            <div className="grid gap-2">
                                <Label>Laboratorium</Label>
                                <Select
                                    value={String(createForm.laboratorium)}
                                    onValueChange={(val) =>
                                        setCreateForm((prevState) => ({
                                            ...prevState,
                                            laboratorium: val,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Laboratorium" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">
                                            MASTER
                                        </SelectItem>
                                        {laboratoriums.map((lab) => (
                                            <SelectItem
                                                key={lab.id}
                                                value={lab.id}
                                            >
                                                {lab.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nama">Nama Admin</Label>
                                <Input
                                    type="text"
                                    name="nama"
                                    id="nama"
                                    value={createForm.nama}
                                    onChange={(event) =>
                                        setCreateForm((prevState) => ({
                                            ...prevState,
                                            nama: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    type="text"
                                    name="username"
                                    id="username"
                                    value={createForm.username}
                                    onChange={(event) =>
                                        setCreateForm((prevState) => ({
                                            ...prevState,
                                            username: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={
                                            passwordVisible
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="******"
                                        value={createForm.password}
                                        onChange={(event) =>
                                            setCreateForm((prevState) => ({
                                                ...prevState,
                                                password: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {passwordVisible ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={
                                    !createForm.nama ||
                                    !createForm.username ||
                                    !createForm.password ||
                                    createForm.password.length < 6 ||
                                    createForm.onSubmit
                                }
                            >
                                {createForm.onSubmit ? (
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
                <TableSearchForm />
            </div>
            <DataTable<Admin>
                columns={columns}
                data={pagination.data}
                pagination={pagination}
            />

            {/*--UPDATE-FORM--*/}
            <AlertDialog
                open={openUpdateForm}
                onOpenChange={handleOpenUpdateForm}
            >
                <AlertDialogContent
                    className="my-alert-dialog-content"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Admin</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan mengubah nama Admin
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        className={cn("grid items-start gap-4")}
                        onSubmit={handleUpdateFormSubmit}
                    >
                        <div className="grid gap-2">
                            <Label>Laboratorium</Label>
                            <Select
                                value={String(updateForm.laboratorium)}
                                onValueChange={(val) =>
                                    setUpdateForm((prevState) => ({
                                        ...prevState,
                                        laboratorium: val,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Laboratorium" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">MASTER</SelectItem>
                                    {laboratoriums.map((lab) => (
                                        <SelectItem key={lab.id} value={lab.id}>
                                            {lab.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nama">Nama Admin</Label>
                            <Input
                                type="text"
                                name="nama"
                                id="nama"
                                value={updateForm.nama}
                                onChange={(event) =>
                                    setUpdateForm((prevState) => ({
                                        ...prevState,
                                        nama: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username Admin</Label>
                            <Input
                                type="text"
                                name="username"
                                id="username"
                                value={updateForm.username}
                                onChange={(event) =>
                                    setUpdateForm((prevState) => ({
                                        ...prevState,
                                        username: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <Button type="submit" disabled={updateForm.onSubmit}>
                            {updateForm.onSubmit ? (
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
            {/*---UPDATE-FORM---*/}

            {/*--UPDATE-PASSWORD-FORM--*/}
            <AlertDialog
                open={openUpdatePasswordForm}
                onOpenChange={handleOpenUpdatePasswordForm}
            >
                <AlertDialogContent
                    className="my-alert-dialog-content"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Update Password Admin
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Mengubah Password{" "}
                            <strong>{updatePasswordForm.nama}</strong>, Panjang{" "}
                            <strong>Password</strong> minimal adalah 6 karakter.
                            Gunakan <strong>Password</strong> yang aman ya gaes
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        className={cn("grid items-start gap-4")}
                        onSubmit={handleUpdatePasswordFormSubmit}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password Baru</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder="******"
                                    value={updatePasswordForm.password}
                                    onChange={(event) =>
                                        setUpdatePasswordForm((prevState) => ({
                                            ...prevState,
                                            password: event.target.value,
                                        }))
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {passwordVisible ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="repeatPassword">
                                Konfirmasi Password Baru
                            </Label>
                            <div className="relative">
                                <Input
                                    id="repeatPassword"
                                    name="repeatPassword"
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder="******"
                                    value={updatePasswordForm.repeatPassword}
                                    onChange={(event) =>
                                        setUpdatePasswordForm((prevState) => ({
                                            ...prevState,
                                            repeatPassword: event.target.value,
                                        }))
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {passwordVisible ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                updatePasswordForm.onSubmit ||
                                updatePasswordForm.password !==
                                    updatePasswordForm.repeatPassword ||
                                updatePasswordForm.password.length < 6
                            }
                        >
                            {updatePasswordForm.onSubmit ? (
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
            {/*---UPDATE-PASSWORD-FORM---*/}

            {/*--DELETE-FORM--*/}
            <AlertDialog open={openDeleteForm} onOpenChange={setOpenDeleteForm}>
                <AlertDialogContent
                    className="my-alert-dialog-content"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Admin</AlertDialogTitle>
                        <AlertDialogDescription className="flex flex-col gap-0.5">
                            <p className="text-red-600 font-bold">
                                Anda akan menghapus Admin!
                            </p>
                            <p className="*:text-red-600">
                                <strong>{deleteForm.nama}</strong> akan tidak
                                dapat digunakan kembali.
                            </p>
                            <br />
                            <p className="text-red-600">
                                Data yang terhapus tidak akan bisa dikembalikan!
                                harap gunakan dengan hati-hati
                            </p>
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
