import { AdminLayout } from "@/layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { NotificationCard } from "@/components/notification-card";
import {
    AlertCircle,
    ArrowUpDown,
    Check,
    ChevronDown,
    CircleAlert,
    CircleCheckBig,
    Clock,
    Copy,
    Download, FileDown,
    FolderCheck,
    Loader2,
    MoreHorizontal,
    Trash2,
    TriangleAlert,
    UserRound,
    Users2,
} from "lucide-react";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { FormEvent, useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, parseSesiTime } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/data-table";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { exportKartuPraktikum } from "@/components/kartu-praktikum";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Praktikan = {
    id: string;
    username: string;
    avatar: string | null;
    nama: string;
    krs: string | null;
    pembayaran: string | null;
    modul: string | null;
    terverifikasi: boolean;
    aslab: {
        id: string;
        nama: string;
    } | null;
    dosen: {
        id: string;
        nama: string;
    } | null;
    sesi: {
        id: string;
        nama: string;
    } | null;
};
type Praktikum = {
    id: string;
    nama: string;
    tahun: number;
    praktikan: Praktikan[];
    periode: {
        id: string;
        nama: string;
    };
    jenis: {
        id: string;
        nama: string;
    };
    laboratorium: {
        id: string;
        nama: string;
        avatar: string | null;
    };
    pertemuan: {
        id: string;
        nama: string;
    }[];
};
export default function AdminPraktikumPraktikanIndexPage({
    auth,
    currentDate,
    praktikum,
    sesiPraktikums,
    aslabs,
    dosens,
}: PageProps<{
    currentDate: string;
    praktikum: Praktikum;
    sesiPraktikums: {
        id: string;
        nama: string;
        kuota: number | null;
        sisa_kuota: number | null;
        hari: string;
        waktu_mulai: string;
        waktu_selesai: string;
    }[];
    aslabs: {
        id: string;
        nama: string;
        avatar: string | null;
        username: string;
        kuota: number;
    }[];
    dosens: {
        id: string;
        nama: string;
        username: string;
        kuota: number;
    }[];
}>) {
    const { toast } = useToast();
    type uploadFile = {
        file: File | null;
        onLoad: boolean;
        onInvalid: boolean;
        invalidMsg: string;
    };
    type uploadContents = {
        npm: string;
        nama: string;
        aslab_id: string;
        dosen_id: string;
        sesi_praktikum_id: string;
        isRandomAslab: boolean;
        isRandomDosen: boolean;
    };
    type UploadErrors = {
        [key: number]: string[];
    };
    type DeletePraktikan = {
        id: string;
        nama: string;
        validation: string;
        onSubmit: boolean;
    };
    type VerifikasiPraktikan = {
        id: string;
        nama: string;
        username: string;
        sesi_praktikum_id: string;
        aslab_id: string;
        dosen_id: string;
        isRandomAslab: boolean;
        isRandomDosen: boolean;
        onSubmit: boolean;
    };
    const uploadFileInit: uploadFile = {
        file: null,
        onLoad: false,
        onInvalid: false,
        invalidMsg: "",
    };
    const deletePraktikanInit: DeletePraktikan = {
        id: "",
        nama: "",
        validation: "",
        onSubmit: false,
    };
    const verifikasiPraktikanInit: VerifikasiPraktikan = {
        id: "",
        nama: "",
        username: "",
        sesi_praktikum_id: "",
        aslab_id: "",
        dosen_id: "",
        isRandomAslab: false,
        isRandomDosen: false,
        onSubmit: false,
    };
    const [clipboard, setClipboard] = useState<string>("");
    const handleSetClipboard = (value: string) => {
        setClipboard(value);
        navigator.clipboard.writeText(value);
    };

    const [uploadFile, setUploadFile] = useState<uploadFile>(uploadFileInit);
    const [uploadErrors, setUploadErrors] = useState<UploadErrors[]>([]);
    const [uploadContents, setUploadContents] = useState<uploadContents[]>([]);
    const [openUploadContents, setOpenUploadContents] =
        useState<boolean>(false);
    const [onFetchIdPraktikan, setOnFetchIdPraktikan] = useState(false);
    const [onSubmitUploadContents, setOnSubmitUploadContents] =
        useState<boolean>(false);

    const [verifikasiPraktikan, setVerifikasiPraktikan] = useState<VerifikasiPraktikan>(verifikasiPraktikanInit);
    const [openVerifikasiPraktikan, setOpenVerifikasiPraktikan] = useState<boolean>(false);
    const [inValidVerifikasiPraktikan, setInvalidVerifikasiPraktikan] = useState<boolean>(false);
    const [openDeletePraktikan, setOpenDeletePraktikan] = useState(false);
    const [deletePraktikan, setDeletePraktikan] = useState<DeletePraktikan>(deletePraktikanInit);
    const handleSetUploadFile = (file: File) => {
        setUploadFile({
            file,
            onLoad: true,
            onInvalid: false,
            invalidMsg: "",
        });
    };
    const handleCancelUploadFile = () => {
        setUploadFile(uploadFileInit);
        setUploadErrors([]);
        setUploadContents([]);
        setOnFetchIdPraktikan(false);
        setOnSubmitUploadContents(false);
    };
    const handleSubmitUploadContents = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setOnFetchIdPraktikan(true);
        if (aslabs.length < 1) {
            toast({
                variant: "destructive",
                title: "Aslab tidak tersedia!",
                description: "Tidak ada data Aslab yang tersedia untuk dipilih.",
            });
            setOnFetchIdPraktikan(false);
            setOnSubmitUploadContents(false);
            return;
        } else if (dosens.length < 1) {
            toast({
                variant: "destructive",
                title: "Dosen tidak tersedia!",
                description: "Tidak ada data Dosen yang tersedia untuk dipilih.",
            });
            setOnFetchIdPraktikan(false);
            setOnSubmitUploadContents(false);
            return;
        }
        const tempAslabs = [...aslabs];
        const tempDosens = [...dosens];

        const submitData = uploadContents.map((cntnt) => {
            const { nama, npm, sesi_praktikum_id, aslab_id, isRandomAslab, dosen_id, isRandomDosen } = cntnt;

            let selectedAslabId = aslab_id;
            if (isRandomAslab) {
                tempAslabs.sort((a, b) => a.kuota - b.kuota);
                selectedAslabId = tempAslabs[0].id;
                tempAslabs[0].kuota += 1;
            }

            let selectedDosenId = dosen_id;
            if (isRandomDosen) {
                tempDosens.sort((a, b) => a.kuota - b.kuota);
                selectedDosenId = tempDosens[0].id;
                tempDosens[0].kuota += 1;
            }

            return {
                nama,
                npm,
                sesi_praktikum_id,
                aslab_id: selectedAslabId,
                isRandomAslab,
                dosen_id: selectedDosenId,
                isRandomDosen,
            };
        });

        axios
            .get<{
                message: string;
                data: {
                    id: string;
                    nama: string;
                    npm: string;
                }[];
            }>(
                route("api.praktikans", {
                    npm: submitData.map((content) => content.npm),
                })
            )
            .then((res) => {
                const praktikansData = res.data.data as {
                    id: string;
                    nama: string;
                    npm: string;
                }[];
                if (!Array.isArray(praktikansData)) {
                    handleCancelUploadFile();
                    setOpenUploadContents(false);
                    toast({
                        variant: "destructive",
                        title: "Permintaan gagal diproses!",
                        description:
                            "Data yang didapatkan dari server tidak valid! coba lagi nanti",
                    });
                    return;
                } else if (praktikansData.length < 1) {
                    handleCancelUploadFile();
                    setOpenUploadContents(false);
                    toast({
                        variant: "destructive",
                        title: "Permintaan gagal diproses!",
                        description:
                            "Tidak ada Praktikan yang terdaftar di sistem dari data yang diberikan",
                    });
                    return;
                }
                setOnFetchIdPraktikan(false);
                setOnSubmitUploadContents(true);

                axios
                    .post(route("praktikum-praktikan.create-mass"), {
                        praktikum_id: praktikum.id,
                        praktikans: submitData.map((content) => {
                            const praktikan = praktikansData.find((praktikan) => praktikan.npm === content.npm);
                            return praktikan
                                ? {
                                    id: praktikan.id,
                                    aslab_id: content.aslab_id,
                                    dosen_id: content.dosen_id,
                                    sesi_praktikum_id: content.sesi_praktikum_id,
                                }
                                : null;
                        }).filter(Boolean),
                    })
                    .then((res) => {
                        handleCancelUploadFile();
                        setOpenUploadContents(false);
                        toast({
                            variant: "default",
                            className: "bg-green-500 text-white",
                            title: "Berhasil!",
                            description: res.data.message,
                        });
                        router.reload({ only: ["praktikum", "aslabs", "dosens", "sesiPraktikums"] });
                    })
                    .catch((err: unknown) => {
                        handleCancelUploadFile();
                        setOpenUploadContents(false);
                        const errMsg: string =
                            err instanceof AxiosError &&
                            err.response?.data?.message
                                ? err.response.data.message
                                : "Error tidak diketahui terjadi!";
                        toast({
                            variant: "destructive",
                            title: "Permintaan gagal diproses!",
                            description: errMsg,
                        });
                    });
            })
            .catch((err) => {
                setOnFetchIdPraktikan(false);
                setOnSubmitUploadContents(false);
                const errMsg: string =
                    err instanceof AxiosError && err.response?.data?.message
                        ? err.response.data.message
                        : "Error tidak diketahui terjadi!";
                toast({
                    variant: "destructive",
                    title: "Permintaan gagal diproses!",
                    description: errMsg,
                });
            });

    };

    const handleOpenDeletePraktikan = (praktikan: {
        id: string;
        nama: string;
    }) => {
        setDeletePraktikan((prevState) => ({
            ...prevState,
            id: praktikan.id,
            nama: praktikan.nama,
        }));
        setOpenDeletePraktikan(true);
    };
    const handleDeletePraktikanSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDeletePraktikan((prevState) => ({ ...prevState, onSubmit: true }));
        const { id } = deletePraktikan;
        const deleteSchema = z.object({
            praktikan_id: z
                .string({ message: "Format Praktikan tidak valid! " })
                .min(1, { message: "Format Praktikan tidak valid!" }),
            praktikum_id: z
                .string({ message: "Format Praktikum tidak valid! " })
                .min(1, { message: "Format Praktikum tidak valid!" }),
        });
        const deleteParse = deleteSchema.safeParse({
            praktikan_id: id,
            praktikum_id: praktikum.id,
        });
        if (!deleteParse.success) {
            const errMsg = deleteParse.error.issues[0]?.message;
            toast({
                variant: "destructive",
                title: "Periksa kembali Input anda!",
                description: errMsg,
            });
            setDeletePraktikan((prevState) => ({
                ...prevState,
                onSubmit: false,
            }));
            return;
        }

        axios
            .post<{
                message: string;
            }>(route("praktikum-praktikan.delete"), {
                praktikan_id: id,
                praktikum_id: praktikum.id,
            })
            .then((res) => {
                setDeletePraktikan(deletePraktikanInit);
                setOpenDeletePraktikan(false);
                toast({
                    variant: "default",
                    className: "bg-green-500 text-white",
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.reload({ only: ["praktikum"] });
            })
            .catch((err: unknown) => {
                const errMsg: string =
                    err instanceof AxiosError && err.response?.data?.message
                        ? err.response.data.message
                        : "Error tidak diketahui terjadi!";
                setDeletePraktikan((prevState) => ({
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
    const handleDownload = (url: string | null) => {
        if (url) {
            window.open(`/storage/praktikum/${url}`, "_blank");
        }
        return;
    };
    const handleOpenVerifikasi = (id: string) => {
        const praktikan = praktikum.praktikan.find(
            (praktikan) => praktikan.id === id
        );
        if (!praktikan) {
            setInvalidVerifikasiPraktikan(true);
            return;
        }

        const sesiPraktikum = sesiPraktikums.find(
            (sesi) => sesi.id === praktikan.sesi?.id
        );
        const isFullSesiPraktikum = sesiPraktikum
            ? sesiPraktikum.kuota !== null &&
              (sesiPraktikum.sisa_kuota ?? 0) <= 0
            : false;
        setVerifikasiPraktikan((prevState) => ({
            ...prevState,
            id: praktikan.id,
            nama: praktikan.nama,
            username: praktikan.username,
            sesi_praktikum_id: !isFullSesiPraktikum
                ? praktikan.sesi?.id ?? ""
                : "",
            aslab_id: praktikan.aslab?.id ?? "",
            isRandomAslab: false,
        }));
        setOpenVerifikasiPraktikan(true);
    };
    const handleCancelVerifikasi = (open: boolean) => {
        if (!open) {
            setOpenVerifikasiPraktikan(false);
            setVerifikasiPraktikan(verifikasiPraktikanInit);
        }
    };
    const handleSubmitVerifikasiPraktikan = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setVerifikasiPraktikan((prevState) => ({
            ...prevState,
            onSubmit: true,
        }));

        const {
            id,
            sesi_praktikum_id,
            aslab_id,
            isRandomAslab,
            dosen_id,
            isRandomDosen,
        } = verifikasiPraktikan;

        let selectedAslabId = aslab_id;
        if (isRandomAslab) {
            if (aslabs.length > 0) {
                const minKuota = Math.min(
                    ...aslabs.map((aslab) => aslab.kuota)
                );
                const minKuotaAslabs = aslabs.filter(
                    (aslab) => aslab.kuota === minKuota
                );
                selectedAslabId =
                    minKuotaAslabs[
                        Math.floor(Math.random() * minKuotaAslabs.length)
                    ].id;
            } else {
                toast({
                    variant: "destructive",
                    title: "Aslab tidak tersedia!",
                    description:
                        "Tidak ada data aslab yang tersedia untuk dipilih.",
                });
                setVerifikasiPraktikan((prevState) => ({
                    ...prevState,
                    onSubmit: false,
                }));
                return;
            }
        }

        let selectedDosenId = dosen_id;
        if (isRandomDosen) {
            if (dosens.length > 0) {
                const minKuota = Math.min(
                    ...dosens.map((dosen) => dosen.kuota)
                );
                const minKuotaDosens = dosens.filter(
                    (dosen) => dosen.kuota === minKuota
                );
                selectedDosenId =
                    minKuotaDosens[
                        Math.floor(Math.random() * minKuotaDosens.length)
                    ].id;
            } else {
                toast({
                    variant: "destructive",
                    title: "Dosen tidak tersedia!",
                    description:
                        "Tidak ada data Dosen yang tersedia untuk dipilih.",
                });
                setVerifikasiPraktikan((prevState) => ({
                    ...prevState,
                    onSubmit: false,
                }));
                return;
            }
        }

        axios
            .post(route("praktikum-praktikan.verifikasi"), {
                praktikum_id: praktikum.id,
                praktikan_id: id,
                sesi_praktikum_id: sesi_praktikum_id,
                aslab_id: selectedAslabId,
                dosen_id: selectedDosenId,
                terverifikasi: true,
            })
            .then((res) => {
                setVerifikasiPraktikan(verifikasiPraktikanInit);
                setOpenVerifikasiPraktikan(false);
                toast({
                    variant: "default",
                    className: "bg-green-500 text-white",
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.reload({
                    only: ["praktikum", "sesiPraktikums", "aslabs", "dosens"],
                });
            })
            .catch((err: unknown) => {
                const errMsg: string =
                    err instanceof AxiosError && err.response?.data?.message
                        ? err.response.data.message
                        : "Error tidak diketahui terjadi!";
                setVerifikasiPraktikan((prevState) => ({
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
                    {row.getValue("username")}
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
                    {row.getValue("nama")}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.sesi?.nama || "-",
            id: "sesi.nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="max-w-32 justify-start"
                    >
                        Sesi
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const sesi = row.original.sesi;
                return (
                    <div className="capitalize min-w-16 max-w-20 ml-4">
                        <p>{sesi ? `${sesi.nama}` : "-"}</p>
                    </div>
                );
            },
        },
        {
            accessorFn: (row) => row.aslab?.nama || "-",
            id: "aslab.dosen",
            header: () => {
                return (
                    <div className="ml-2">
                        Aslab / Dosen
                    </div>
                );
            },
            cell: ({ row }) => {
                const aslab = row.original.aslab;
                const dosen = row.original.dosen;
                return (
                    <Popover modal={true}>
                        <PopoverTrigger asChild className="w-min mx-auto items-center">
                            <AlertCircle strokeWidth={2.2} className="cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto">
                            <div className="px-2 text-sm font-medium">
                                <p className="text-center">{row.original.nama} - {row.original.username}</p>
                                <Separator className="my-2 h-0.5 bg-primary/70" />
                                <div className="flex ">
                                    <p className="w-36">Asisten Laboratorium</p>
                                    <p>{aslab ? `: ${aslab.nama}` : ": -"}</p>
                                </div>
                                <div className="flex ">
                                    <p className="w-36">Dosen Pembimbing</p>
                                    <p>{dosen ? `: ${dosen.nama}` : ": -"}</p>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                );
            },
        },
        {
            accessorKey: "terverifikasi",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="w-32 justify-start"
                >
                    Terverifikasi
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => {
                const terverifikasi = row.original.terverifikasi;
                return (
                    <div
                        className={`w-32 flex gap-1 items-center justify-center ${
                            terverifikasi ? "text-green-600" : "text-red-500"
                        } text-sm`}
                    >
                        {row.original.terverifikasi ? (
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
            id: "downloads",
            enableHiding: false,
            cell: ({ row }) => {
                const krs = row.original.krs;
                const praktikum = row.original.pembayaran;
                const modul = row.original.modul;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-14 space-x-0">
                                <Download />
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40 *:text-sm">
                            <DropdownMenuItem
                                disabled={!krs}
                                onSelect={() => handleDownload(krs)}
                            >
                                KRS
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={!praktikum}
                                onSelect={() => handleDownload(praktikum)}
                            >
                                Kwitansi Praktikum
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={!modul}
                                onSelect={() => handleDownload(modul)}
                            >
                                Transfer Modul
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                                disabled={originalRow.terverifikasi}
                                onClick={() =>
                                    handleOpenVerifikasi(row.original.id)
                                }
                            >
                                <FolderCheck /> Verifikasi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleOpenDeletePraktikan({
                                        id: row.original.id,
                                        nama: row.original.nama,
                                    })
                                }
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

    const exportAbsensiPraktikum = (praktikum: Praktikum) => {
        if (!praktikum || !praktikum.praktikan) return;

        const wb = XLSX.utils.book_new();

        const sesiMap = new Map<string, string>();
        praktikum.praktikan.forEach((p) => {
            if (p.sesi) sesiMap.set(p.sesi.id, p.sesi.nama);
        });

        const createSheet = (praktikanList: Praktikan[], sheetName: string) => {
            const sheetData = [
                [`ABSENSI PRAKTIKUM ${praktikum.nama} - ${praktikum.tahun}`],
                [],
                [],
                ["No", "Nama", "NPM", "Tanda Tangan"],
            ];

            const filteredPraktikan = praktikanList
                .filter((p) => p.terverifikasi)
                .sort((a, b) => a.username.localeCompare(b.username));

            filteredPraktikan.forEach((p, index) => {
                const noZigzag =
                    index % 2 === 0
                        ? `${index + 1}...............`
                        : `                   ${index + 1}...............`;
                sheetData.push([
                    (index + 1).toString(),
                    p.nama,
                    p.username,
                    `${noZigzag}`,
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(sheetData);

            ws["!cols"] = [{ wch: 3 }, { wch: 30 }, { wch: 20 }, { wch: 20 }];

            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        };

        createSheet(praktikum.praktikan, "Semua");

        sesiMap.forEach((namaSesi, sesiId) => {
            const sesiPraktikan = praktikum.praktikan.filter(
                (p) => p.sesi?.id === sesiId
            );
            createSheet(sesiPraktikan, namaSesi);
        });

        XLSX.writeFile(wb, `Absensi_${praktikum.nama}_${praktikum.tahun}.xlsx`);
    };

    useEffect(() => {
        const handleFile = async () => {
            if (uploadFile.file && uploadFile.onLoad) {
                try {
                    const arrayBuffer = await uploadFile.file.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer);
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const raw_data: any[][] = XLSX.utils.sheet_to_json(
                        worksheet,
                        { header: 1 }
                    );

                    if (raw_data.length > 0) {
                        const ACCEPT_HEADERS: string[] = ["npm", "nama", "aslab_id", "dosen_id", "sesi_praktikum_id"];

                        let invalidHeaders: string[] = [];
                        const receivedHeaders: string[] = raw_data[0].map(
                            (header) => (header as string)?.toLowerCase().trim()
                        );

                        const isValidHeaders = ACCEPT_HEADERS.every(
                            (expectedHeader, index) => {
                                const receivedHeader = receivedHeaders[index];
                                if (receivedHeader !== expectedHeader) {
                                    invalidHeaders.push(
                                        `Kolom ${
                                            receivedHeader
                                                ? `"${receivedHeader}"`
                                                : `ke-${index + 1}`
                                        } tidak valid. Ekspetasi kolom "${expectedHeader}".`
                                    );
                                    return false;
                                }
                                return true;
                            }
                        );

                        if (!isValidHeaders) {
                            toast({
                                variant: "destructive",
                                title: "Header file tidak valid",
                                description: invalidHeaders.join(" "),
                            });
                            return;
                        }

                        const errors: UploadErrors[] = [];
                        const sanitizedData = raw_data
                            .slice(1)
                            .filter((row: any[], rowIndex: number) => {
                                const rowErrors: string[] = [];

                                const npm = row[0] as string | undefined;
                                if (!npm) {
                                    rowErrors.push(`NPM tidak diisi.`);
                                }

                                const nama = row[1] as string | undefined;
                                if (!nama) {
                                    rowErrors.push(`Nama tidak diisi'}`);
                                }

                                if (rowErrors.length > 0) {
                                    errors.push({
                                        [rowIndex + 1]: rowErrors,
                                    });
                                }

                                return rowErrors.length === 0;
                            });

                        setUploadErrors(errors);

                        if (sanitizedData.length === 0) {
                            toast({
                                variant: "destructive",
                                title: "Gagal memproses file",
                                description:
                                    "File tidak memiliki data yang valid atau mungkin kosong.",
                            });
                            return;
                        }

                        setUploadContents(
                            sanitizedData.map((data: string[]) => {
                                const aslabFind = aslabs.find((aslab) => aslab.id === data[2]);
                                const dosenFind = dosens.find((dosen) => dosen.id === data[3]);
                                const sesiFind = sesiPraktikums.find((sesi) => sesi.id === data[4]);
                                return {
                                    npm: data[0],
                                    nama: data[1],
                                    aslab_id: aslabFind ? data[2] : '',
                                    dosen_id: dosenFind ? data[3] : '',
                                    sesi_praktikum_id: sesiFind ? data[4] : '',
                                    isRandomAslab: !aslabFind,
                                    isRandomDosen: !dosenFind
                                }
                            })
                        );
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Gagal membaca file",
                            description:
                                "File kosong atau tidak memiliki data.",
                        });
                    }
                } catch (error: unknown) {
                    const errMsg =
                        error instanceof Error
                            ? error.message
                            : "Gagal membaca dokumen.";
                    toast({
                        variant: "destructive",
                        title: "Kesalahan saat membaca file",
                        description: errMsg,
                    });
                } finally {
                    setTimeout(() => {
                        setUploadFile((prevState) => ({
                            ...prevState,
                            onLoad: false,
                        }));
                    }, 750);
                }
            }
        };

        handleFile();
    }, [uploadFile]);

    useEffect(() => {
        if (uploadContents.length > 0 && !openUploadContents) {
            setOpenUploadContents(true);
        }
    }, [uploadContents]);

    const exportKartu = async () => {
        const praktikansVerified = praktikum.praktikan
            .filter((filt) => filt.aslab?.id)
            .sort((a, b) => {
                if ((a.sesi?.nama ?? 0) < (b.sesi?.nama ?? 0)) return -1;
                if ((a.sesi?.nama ?? 0) > (b.sesi?.nama ?? 0)) return 1;

                if ((a.aslab?.nama ?? 0) < (b.aslab?.nama ?? 0)) return -1;
                if ((a.aslab?.nama ?? 0) > (b.aslab?.nama ?? 0)) return 1;

                return 0;
            });
        if (praktikansVerified.length < 1) {
            toast({
                variant: "destructive",
                title: "Operasi dibatalkan",
                description:
                    "Belum ada Praktikan yang sudah terverifikasi !",
            });
            return;
        }
        const praktikumPraktikansData = {
            ...praktikum,
            praktikan: praktikansVerified
        };

        exportKartuPraktikum(praktikumPraktikansData)
            .then((res) => {
                toast({
                    variant: "default",
                    className: "bg-green-500 text-white",
                    title: "Berhasil!",
                    description: res.message,
                });
            })
            .catch((err: { message: string } ) => {
                const errMsg = err?.message ?? 'Error tidak diketahui terjadi..'
                toast({
                    variant: "destructive",
                    title: "Operasi dibatalkan",
                    description: errMsg
                });
            });
    };

    return (
        <>
            <AdminLayout auth={auth}>
                <Head title={`Admin - Data Praktikan ${praktikum.nama}`} />
                <CardTitle>Data Praktikan</CardTitle>
                <CardDescription>
                    Menampilkan data Praktikan terdaftar pada Praktikum{" "}
                    {praktikum.nama}
                </CardDescription>
                {uploadErrors.length > 0 && (
                    <NotificationCard className="max-w-full rounded-sm shadow-none bg-red-200 text-sm">
                        <div className="flex gap-1 items-center mb-2">
                            <TriangleAlert width={18} color="red" />
                            <p className="text-base font-medium">
                                Data yang tidak dibaca karena tidak valid
                            </p>
                        </div>
                        <ul className="list-disc ml-6">
                            {uploadErrors.map((errorObj, idx) => {
                                const baris = Object.keys(errorObj)[0];
                                const messages =
                                    errorObj[baris as unknown as number];
                                return (
                                    <li key={idx}>
                                        Data ke-{baris} : {messages.join(", ")}
                                    </li>
                                );
                            })}
                        </ul>
                    </NotificationCard>
                )}

                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="item-1"
                >
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            Upload Data Praktikan
                        </AccordionTrigger>
                        <AccordionContent>
                            {uploadFile.onLoad ? (
                                <div className="flex items-center justify-center h-60">
                                    <div className="text-center">
                                        <Loader2 className="animate-spin h-10 w-10 text-blue-500 mx-auto" />
                                        <p className="mt-2 text-gray-600">
                                            Memproses file, mohon tunggu...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <FileUploader
                                        className="mt-4"
                                        onFileUpload={(file) =>
                                            handleSetUploadFile(file)
                                        }
                                    />
                                    <div className="w-full mx-auto flex gap-1 items-center justify-center text-center text-sm font-medium">
                                        Tidak memiliki file?
                                        <a
                                            href={route(
                                                "assets",
                                                "template-upload-praktikum-praktikan.xlsx"
                                            )}
                                            className="hover:text-blue-600 flex items-center gap-0.5"
                                            target="_blank"
                                        >
                                            Unduh template
                                            <Download width={18} />
                                        </a>
                                    </div>
                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="item-1"
                >
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            Informasi Kuota Verifikasi
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2">
                            <h5 className="text-lg font-medium !my-4 ml-3.5">
                                Sesi Praktikum
                            </h5>
                            {sesiPraktikums.map((sesi) => (
                                <div
                                    key={sesi.id}
                                    className="w-full flex flex-row gap-1"
                                >
                                    <div className="capitalize w-72 ml-2 flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7"
                                                        onClick={() =>
                                                            handleSetClipboard(
                                                                sesi.id
                                                            )
                                                        }
                                                    >
                                                        {clipboard ===
                                                        sesi.id ? (
                                                            <Check width={15} />
                                                        ) : (
                                                            <Copy width={15} />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">
                                                        {clipboard === sesi.id
                                                            ? "Berhasil disalin"
                                                            : "Salin ID Sesi"}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Clock className="ml-2" />
                                        <p className="line-clamp-2 text-ellipsis font-medium -mr-1">
                                            {sesi.nama}
                                        </p>
                                        <Badge variant="secondary">
                                            Kuota{" "}
                                            {sesi.kuota
                                                ? `${sesi.kuota} Praktikan`
                                                : "Tidak terbatas"}{" "}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm hidden sm:block">
                                            Sisa Kuota saat ini:{" "}
                                        </span>
                                        <Badge variant="secondary">
                                            {sesi.sisa_kuota ??
                                                "Tidak terbatas"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            <Separator className="!my-4" />
                            <h5 className="text-lg font-medium !my-4 ml-3.5">
                                Asisten Laboratorium
                            </h5>
                            {aslabs.map((aslab) => (
                                <div
                                    key={aslab.id}
                                    className="w-full flex flex-row gap-1"
                                >
                                    <div className="capitalize w-80 ml-2 flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7"
                                                        onClick={() =>
                                                            handleSetClipboard(
                                                                aslab.id
                                                            )
                                                        }
                                                    >
                                                        {clipboard ===
                                                        aslab.id ? (
                                                            <Check width={15} />
                                                        ) : (
                                                            <Copy width={15} />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">
                                                        {clipboard === aslab.id
                                                            ? "Berhasil disalin"
                                                            : "Salin ID Aslab"}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <div
                                            className={`justify-between min-w-11 w-11 h-11 rounded-full overflow-hidden content-center ${
                                                !aslab.avatar
                                                    ? "bg-gray-100 shadow"
                                                    : ""
                                            }`}
                                        >
                                            {aslab.avatar ? (
                                                <img
                                                    src={`/storage/aslab/${aslab.avatar}`}
                                                    alt={`${aslab.username}-aslab-avatar`}
                                                />
                                            ) : (
                                                <UserRound className="mx-auto" />
                                            )}
                                        </div>
                                        <p className="line-clamp-2 text-ellipsis">
                                            {aslab.nama}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm hidden sm:block">
                                            Jumlah Praktikan saat ini:{" "}
                                        </span>
                                        <Badge variant="secondary">
                                            {aslab.kuota}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            <Separator className="!my-4" />
                            <h5 className="text-lg font-medium !my-4 ml-3.5">
                                Dosen Laboratorium
                            </h5>
                            {dosens.map((dosen) => (
                                <div
                                    key={dosen.id}
                                    className="w-full flex flex-row gap-1"
                                >
                                    <div className="capitalize w-80 ml-2 flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7"
                                                        onClick={() =>
                                                            handleSetClipboard(
                                                                dosen.id
                                                            )
                                                        }
                                                    >
                                                        {clipboard ===
                                                        dosen.id ? (
                                                            <Check width={15} />
                                                        ) : (
                                                            <Copy width={15} />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">
                                                        {clipboard === dosen.id
                                                            ? "Berhasil disalin"
                                                            : "Salin ID Dosen"}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <div className="justify-between min-w-11 w-11 h-11 rounded-full overflow-hidden content-center bg-gray-100 shadow">
                                            <UserRound className="mx-auto" />
                                        </div>
                                        <p className="line-clamp-2 text-ellipsis">
                                            {dosen.nama}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm hidden sm:block">
                                            Jumlah Praktikan saat ini:{" "}
                                        </span>
                                        <Badge variant="secondary">
                                            {dosen.kuota}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex flex-row items-center justify-between gap-2">
                    <h3 className="text-base font-medium sm:!mt-5">
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
                            <DropdownMenuItem
                                onClick={() =>
                                    exportAbsensiPraktikum(praktikum)
                                }
                            >
                                Absensi Praktikum <strong>(xlsx)</strong>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={async () => await exportKartu()}
                            >
                                Kartu Praktikum <strong>(pdf)</strong>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <DataTable<Praktikan>
                    columns={columns}
                    data={praktikum.praktikan}
                    showViewPerPage={false}
                />
            </AdminLayout>

            <AlertDialog
                open={openUploadContents}
                onOpenChange={(open) => {
                    setOpenUploadContents(open);
                    if (!open) {
                        setUploadContents([]);
                    }
                }}
            >
                <AlertDialogContent
                    className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Konfirmasi Data Praktikan
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Berhasil membaca {uploadContents.length} data
                            Praktikan yang diupload
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        className={cn(
                            "grid items-start gap-4 h-96 xl:h-[65vh]"
                        )}
                        onSubmit={handleSubmitUploadContents}
                    >
                        <div className="h-80 xl:h-full overflow-y-auto pr-2.5">
                            {uploadContents.map((content, index) => (
                                <div key={index} className="!mt-2 !mb-5 flex gap-0 justify-between rounded-sm overflow-hidden border-[1.5px] border-muted-foreground/30">
                                    <h6 className={ `w-11 text-center content-center p-3 font-medium ${index % 2 ===  0 ? 'bg-primary text-white' : 'bg-muted text-primary' }` }>
                                        { index + 1}
                                    </h6>
                                    <div className="w-full px-3 py-4">
                                        <div className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`username-${index}`}
                                                >
                                                    NPM
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name={`username-${index}`}
                                                    id={`username-${index}`}
                                                    value={content.npm}
                                                    onChange={(event) => {
                                                        const updated = [
                                                            ...uploadContents,
                                                        ];
                                                        updated[index].npm =
                                                            event.target.value;
                                                        setUploadContents(updated);
                                                    }}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor={`nama-${index}`}>
                                                    Nama
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name={`nama-${index}`}
                                                    id={`nama-${index}`}
                                                    value={content.nama}
                                                    onChange={(event) => {
                                                        const updated = [
                                                            ...uploadContents,
                                                        ];
                                                        updated[index].nama =
                                                            event.target.value;
                                                        setUploadContents(updated);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="grid gap-2">
                                                    <Label>Asisten Laboratorium</Label>
                                                    <Select
                                                        disabled={content.isRandomAslab}
                                                        value={content.aslab_id}
                                                        onValueChange={(val) => {
                                                            const updated = [
                                                                ...uploadContents,
                                                            ];
                                                            updated[index].aslab_id = val;
                                                            setUploadContents(updated);
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue
                                                                placeholder={`${
                                                                    content.isRandomAslab
                                                                        ? "Asisten Laboratorium Acak"
                                                                        : "Pilih Asisten Laboratorium"
                                                                }`}
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {aslabs.length > 0 ? (
                                                                aslabs.map((aslab) => (
                                                                    <SelectItem
                                                                        key={aslab.id}
                                                                        value={aslab.id}
                                                                    >
                                                                        {aslab.nama}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem
                                                                    value={`null-${Math.random()
                                                                        .toString(36)
                                                                        .substring(2, 6)}`}
                                                                    disabled
                                                                >
                                                                    Tidak ada Aslab tersedia
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="items-center flex gap-1.5">
                                                    <Checkbox
                                                        id={ `random-aslab-${index}` }
                                                        onCheckedChange={(checked) => {
                                                            const updated = [
                                                                ...uploadContents,
                                                            ];
                                                            updated[index].isRandomAslab = !!checked;
                                                            updated[index].aslab_id = !!checked
                                                                ? ''
                                                                : content.aslab_id;
                                                            setUploadContents(updated);
                                                        }}
                                                        checked={content.isRandomAslab}
                                                    />
                                                    <Label
                                                        htmlFor={ `random-aslab-${index}` }
                                                        className="text-sm opacity-80"
                                                    >
                                                        Asisten Laboratorium Acak
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="grid gap-2">
                                                    <Label>Dosen Pembimbing</Label>
                                                    <Select
                                                        disabled={content.isRandomDosen}
                                                        value={content.dosen_id}
                                                        onValueChange={(val) => {
                                                            const updated = [
                                                                ...uploadContents,
                                                            ];
                                                            updated[index].dosen_id = val;
                                                            setUploadContents(updated);
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue
                                                                placeholder={`${
                                                                    content.isRandomDosen
                                                                        ? "Dosen Pembimbing Acak"
                                                                        : "Pilih Dosen Pembimbing"
                                                                }`}
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {dosens.length > 0 ? (
                                                                dosens.map((dosen) => (
                                                                    <SelectItem
                                                                        key={dosen.id}
                                                                        value={dosen.id}
                                                                    >
                                                                        {dosen.nama}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem
                                                                    value={`null-${Math.random()
                                                                        .toString(36)
                                                                        .substring(2, 6)}`}
                                                                    disabled
                                                                >
                                                                    Tidak ada Dosen tersedia
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="items-center flex gap-1.5">
                                                    <Checkbox
                                                        id={ `random-dosen-${index}` }
                                                        onCheckedChange={(checked) => {
                                                            const updated = [
                                                                ...uploadContents,
                                                            ];
                                                            updated[index].isRandomDosen = !!checked;
                                                            updated[index].dosen_id = !!checked
                                                                ? ''
                                                                : content.dosen_id;
                                                            setUploadContents(updated);
                                                        }}
                                                        checked={content.isRandomDosen}
                                                    />
                                                    <Label
                                                        htmlFor={ `random-dosen-${index}` }
                                                        className="text-sm opacity-80"
                                                    >
                                                        Dosen Pembimbing Acak
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Sesi Praktikum</Label>
                                                <Select
                                                    value={content.sesi_praktikum_id}
                                                    onValueChange={(val) => {
                                                        const updated = [
                                                            ...uploadContents,
                                                        ];
                                                        updated[index].sesi_praktikum_id = val;
                                                        setUploadContents(updated);
                                                    }}
                                                >
                                                    <SelectTrigger className={ `w-full ${!content.sesi_praktikum_id ? 'border-red-600 !border-2 text-red-600 font-medium' : '' }` }>
                                                        <SelectValue placeholder="Pilih Sesi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sesiPraktikums.length > 0 ? (
                                                            sesiPraktikums.map((sesi) => {
                                                                const isDisabled =
                                                                    sesi.kuota !== null &&
                                                                    (sesi.sisa_kuota ?? 0) <= 0;
                                                                return (
                                                                    <SelectItem
                                                                        key={sesi.id}
                                                                        value={sesi.id}
                                                                        disabled={isDisabled}
                                                                    >
                                                                        {`${sesi.nama} - ${
                                                                            sesi.hari
                                                                        } (${parseSesiTime(
                                                                            sesi.waktu_mulai,
                                                                            currentDate
                                                                        )} - ${parseSesiTime(
                                                                            sesi.waktu_selesai,
                                                                            currentDate
                                                                        )}) ${
                                                                            isDisabled
                                                                                ? "(Kuota Penuh)"
                                                                                : ""
                                                                        }`}
                                                                    </SelectItem>
                                                                );
                                                            })
                                                        ) : (
                                                            <SelectItem
                                                                value={`null-${Math.random()
                                                                    .toString(36)
                                                                    .substring(2, 6)}`}
                                                                disabled
                                                            >
                                                                Tidak ada sesi tersedia
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                onFetchIdPraktikan ||
                                onSubmitUploadContents ||
                                uploadContents.length < 1 ||
                                uploadFile.onLoad ||
                                uploadContents.some((content) => !content.sesi_praktikum_id)
                            }
                        >
                            {onFetchIdPraktikan || onSubmitUploadContents ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    <span>
                                        {onFetchIdPraktikan
                                            ? "Mengambil data Praktikan..."
                                            : "Mengirim data Praktikan..."}
                                    </span>
                                </div>
                            ) : (
                                "Simpan euy"
                            )}
                        </Button>
                    </form>
                    <AlertDialogCancel onClick={handleCancelUploadFile}>
                        Batal
                    </AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={openDeletePraktikan}
                onOpenChange={setOpenDeletePraktikan}
            >
                <AlertDialogContent
                    className="max-w-[90%] sm:max-w-[425px] rounded"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Hapus Praktikan dari Praktikum?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="flex flex-col gap-0.5">
                            <span className="text-red-600 font-bold">
                                Anda akan menghapus Praktikan dari Praktikum{" "}
                                {praktikum.nama}
                            </span>
                            <span className="*:text-red-600">
                                Semua data Nilai Praktikan{" "}
                                <strong>{deletePraktikan.nama}</strong> yang
                                terkait dengan <strong>{praktikum.nama}</strong>{" "}
                                akan juga dihapus
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
                        onSubmit={handleDeletePraktikanSubmit}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="validation">
                                Validasi aksi anda
                            </Label>
                            <Input
                                type="text"
                                name="validation"
                                id="validation"
                                value={deletePraktikan.validation}
                                placeholder="JARKOM JAYA"
                                onChange={(event) =>
                                    setDeletePraktikan((prevState) => ({
                                        ...prevState,
                                        validation: event.target.value,
                                    }))
                                }
                                autoComplete="off"
                            />
                            <p>
                                Ketik <strong>JARKOM JAYA</strong> untuk
                                melanjutkan
                            </p>
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                deletePraktikan.onSubmit ||
                                deletePraktikan.validation !== "JARKOM JAYA"
                            }
                        >
                            {deletePraktikan.onSubmit ? (
                                <>
                                    Memproses{" "}
                                    <Loader2 className="animate-spin" />
                                </>
                            ) : (
                                <span>Simpan</span>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="hover:bg-red-300/70"
                            onClick={() => {
                                setDeletePraktikan(deletePraktikanInit);
                                setOpenDeletePraktikan(false);
                            }}
                        >
                            Batal
                        </Button>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={inValidVerifikasiPraktikan}>
                <AlertDialogContent
                    className="my-alert-dialog-content"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogDescription className="flex flex-col gap-0.5">
                            <p className="text-red-600 font-bold">
                                Data Praktikan tidak valid!
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel className="bg-rose-600 hover:bg-rose-600/90 text-white hover:text-white">
                        Ok
                    </AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={openVerifikasiPraktikan}
                onOpenChange={handleCancelVerifikasi}
            >
                <AlertDialogContent
                    className="my-alert-dialog-content"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Verifikasi Praktikan
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-900 font-medium antialiased">
                            {verifikasiPraktikan.nama} -{" "}
                            {verifikasiPraktikan.username}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        className={cn("grid items-start gap-4")}
                        onSubmit={handleSubmitVerifikasiPraktikan}
                    >
                        <div className="space-y-1.5">
                            <div className="grid gap-2">
                                <Label>Asisten Laboratorium</Label>
                                <Select
                                    disabled={verifikasiPraktikan.isRandomAslab}
                                    value={verifikasiPraktikan.aslab_id}
                                    onValueChange={(val) =>
                                        setVerifikasiPraktikan((prevState) => ({
                                            ...prevState,
                                            aslab_id: val,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={`${
                                                verifikasiPraktikan.isRandomAslab
                                                    ? "Asisten Laboratorium Acak"
                                                    : "Pilih Asisten Laboratorium"
                                            }`}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {aslabs.length > 0 ? (
                                            aslabs.map((aslab) => (
                                                <SelectItem
                                                    key={aslab.id}
                                                    value={aslab.id}
                                                >
                                                    {aslab.nama}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem
                                                value={`null-${Math.random()
                                                    .toString(36)
                                                    .substring(2, 6)}`}
                                                disabled
                                            >
                                                Tidak ada Aslab tersedia
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="items-center flex gap-1.5">
                                <Checkbox
                                    id="random-aslab"
                                    onCheckedChange={(checked) =>
                                        setVerifikasiPraktikan((prevState) => ({
                                            ...prevState,
                                            isRandomAslab: !!checked,
                                            aslab_id: !!checked
                                                ? ""
                                                : prevState.aslab_id,
                                        }))
                                    }
                                />
                                <Label
                                    htmlFor="random-aslab"
                                    className="text-sm opacity-80"
                                >
                                    Asisten Laboratorium Acak
                                </Label>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="grid gap-2">
                                <Label>Dosen Pembimbing</Label>
                                <Select
                                    disabled={verifikasiPraktikan.isRandomDosen}
                                    value={verifikasiPraktikan.dosen_id}
                                    onValueChange={(val) =>
                                        setVerifikasiPraktikan((prevState) => ({
                                            ...prevState,
                                            dosen_id: val,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={`${
                                                verifikasiPraktikan.isRandomDosen
                                                    ? "Dosen Pembimbing Acak"
                                                    : "Pilih Dosen Pembimbing"
                                            }`}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dosens.length > 0 ? (
                                            dosens.map((dosen) => (
                                                <SelectItem
                                                    key={dosen.id}
                                                    value={dosen.id}
                                                >
                                                    {dosen.nama}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem
                                                value={`null-${Math.random()
                                                    .toString(36)
                                                    .substring(2, 6)}`}
                                                disabled
                                            >
                                                Tidak ada Dosen tersedia
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="items-center flex gap-1.5">
                                <Checkbox
                                    id="random-dosen"
                                    onCheckedChange={(checked) =>
                                        setVerifikasiPraktikan((prevState) => ({
                                            ...prevState,
                                            isRandomDosen: !!checked,
                                            dosen_id: !!checked
                                                ? ""
                                                : prevState.dosen_id,
                                        }))
                                    }
                                />
                                <Label
                                    htmlFor="random-dosen"
                                    className="text-sm opacity-80"
                                >
                                    Dosen Pembimbing Acak
                                </Label>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Sesi Praktikum</Label>
                            <Select
                                value={verifikasiPraktikan.sesi_praktikum_id}
                                onValueChange={(val) =>
                                    setVerifikasiPraktikan((prevState) => ({
                                        ...prevState,
                                        sesi_praktikum_id: val,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Sesi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sesiPraktikums.length > 0 ? (
                                        sesiPraktikums.map((sesi) => {
                                            const isDisabled =
                                                sesi.kuota !== null &&
                                                (sesi.sisa_kuota ?? 0) <= 0;
                                            return (
                                                <SelectItem
                                                    key={sesi.id}
                                                    value={sesi.id}
                                                    disabled={isDisabled}
                                                >
                                                    {`${sesi.nama} - ${
                                                        sesi.hari
                                                    } (${parseSesiTime(
                                                        sesi.waktu_mulai,
                                                        currentDate
                                                    )} - ${parseSesiTime(
                                                        sesi.waktu_selesai,
                                                        currentDate
                                                    )}) ${
                                                        isDisabled
                                                            ? "(Kuota Penuh)"
                                                            : ""
                                                    }`}
                                                </SelectItem>
                                            );
                                        })
                                    ) : (
                                        <SelectItem
                                            value={`null-${Math.random()
                                                .toString(36)
                                                .substring(2, 6)}`}
                                            disabled
                                        >
                                            Tidak ada sesi tersedia
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                !verifikasiPraktikan.sesi_praktikum_id ||
                                (verifikasiPraktikan.isRandomAslab
                                    ? false
                                    : !verifikasiPraktikan.aslab_id) ||
                                verifikasiPraktikan.onSubmit
                            }
                            className="bg-green-500 hover:bg-green-500/90 "
                        >
                            {verifikasiPraktikan.onSubmit ? (
                                <>
                                    Memproses{" "}
                                    <Loader2 className="animate-spin" />
                                </>
                            ) : (
                                <span>Simpan</span>
                            )}
                        </Button>
                    </form>
                    <AlertDialogCancel disabled={verifikasiPraktikan.onSubmit}>
                        Batal
                    </AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
