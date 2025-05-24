import { PraktikanLayout } from "@/layouts/PraktikanLayout";
import { Head, router } from "@inertiajs/react";
import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, kuisDateTime, kuisDuration, kuisIsOpen } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CalendarClock, CalendarX, Clock, Loader2, RefreshCw } from "lucide-react"
import { PageProps } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { deltaParse, RenderQuillDelta } from "@/components/delta-parse";
import { FormEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";

type Kuis = {
    id: string;
    nama: string;
    deskripsi: string;
    has_kode: boolean;
    is_overdue: boolean;
    selesai: boolean;
    waktu_mulai: string;
    waktu_selesai: string;
    soal_count: number;
    sesi_praktikum: {
        id: string;
        nama: string;
    } | null;
    kuis_praktikan_id: string | null;
};
export default function PraktikanKuisIndexPage({ auth, currentDate, kuis }: PageProps<{
    currentDate: string;
    kuis: Kuis[];
}>) {
    const { toast } = useToast();

    type StartKuisForm = {
        id: string;
        nama: string;
        has_kode: boolean;
        validation: string;
        soal_count: number;
        waktu_mulai: string;
        waktu_selesai: string;
        onSubmit: boolean;
    };
    const startKuisFormInit: StartKuisForm = {
        id: '',
        nama: '',
        has_kode: false,
        validation: '',
        soal_count: 0,
        waktu_mulai: currentDate,
        waktu_selesai: currentDate,
        onSubmit: false,
    };
    const [ openStartKuisForm, setOpenStartKuisForm ] = useState(false);
    const [ startKuisForm, setStartKuisForm ] = useState<StartKuisForm>(startKuisFormInit);
    const RenderDeskripsiSoal = ({ deskripsi }: { deskripsi: string}) => {
        const deltaDeskripsi = deltaParse(deskripsi);
        return (
            <RenderQuillDelta delta={deltaDeskripsi} />
        );
    };

    const handleStartKuisFormOpen = (open: boolean, startKuisFormProps: StartKuisForm = startKuisFormInit) => {
        setOpenStartKuisForm(open);
        setStartKuisForm(startKuisFormProps);
    };
    const handleStartKuisFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStartKuisForm((prevState) => ({
            ...prevState,
            onSubmit: true
        }));
        const { id } = startKuisForm;
        axios.post<{
            message: string;
            kuis_praktikan_id: string;
        }>(route('kuis-praktikan.create'), {
            kuis_id: id,
            praktikan_id: auth.user?.id ?? null,
            kode: startKuisForm.has_kode ? startKuisForm.validation : null
        })
            .then((res) => {
                handleStartKuisFormOpen(false);
                toast({
                    variant: 'default',
                    className: 'bg-green-500 text-white',
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.visit(route('praktikan.kuis.exam', { id: res.data.kuis_praktikan_id }));
            })
            .catch((err: unknown) => {
                const errMsg: string = err instanceof AxiosError && err.response?.data?.message
                    ? err.response.data.message
                    : 'Error tidak diketahui terjadi!';
                setStartKuisForm((prevState) => ({
                    ...prevState,
                    onSubmit: false
                }));
                toast({
                    variant: "destructive",
                    title: "Permintaan gagal diproses!",
                    description: errMsg,
                });
            })
    };
    const handleStartKuisClick = (kuis: Kuis) => {
        if (kuis.kuis_praktikan_id) {
            router.visit(route('praktikan.kuis.exam', { id: kuis.kuis_praktikan_id }));
            return;
        }
        handleStartKuisFormOpen(true, {
            ...startKuisFormInit,
            id: kuis.id,
            nama: kuis.nama,
            has_kode: kuis.has_kode,
            soal_count: kuis.soal_count,
            waktu_mulai: kuis.waktu_mulai,
            waktu_selesai: kuis.waktu_selesai
        })
    };

    return (
        <>
            <PraktikanLayout auth={auth}>
                <Head title="Praktikan - Histori Kuis" />
                <CardTitle>
                    Kuis Mendatang
                </CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kuis.map((kuis) => (
                        <Card key={kuis.id} className="h-full flex flex-col rounded-md">
                            <CardHeader>
                                <div className="flex justify-between items-start min-h-28">
                                    <CardTitle className="text-xl line-clamp-4 text-ellipsis">{kuis.nama}</CardTitle>
                                </div>
                                <ScrollArea className="mt-2 h-44 border-t-2 border-primary/40 pt-2">
                                    <CardDescription>
                                        <RenderDeskripsiSoal deskripsi={kuis.deskripsi} />
                                    </CardDescription>
                                </ScrollArea>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="flex justify-between flex-wrap gap-4 text-sm">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                        <span>{ kuisDuration(kuis.waktu_mulai, kuis.waktu_selesai) } Menit</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                                        <span>{ kuis.soal_count } Soal</span>
                                    </div>
                                    <div className="flex items-center col-span-2">
                                        <CalendarClock className="h-4 w-4 mr-2 text-gray-500"  />
                                        <span>{ kuisDateTime(kuis.waktu_mulai, kuis.waktu_selesai) }</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className={`w-full ${kuis.selesai ? 'bg-green-600 hover:bg-green-600/85' : 'bg-blue-600 hover:bg-blue-600/85'}`}
                                    disabled={kuis.selesai
                                        ? true
                                        : kuis.is_overdue && !kuis.selesai
                                            ? false
                                            : !kuisIsOpen(kuis.waktu_mulai, kuis.waktu_selesai, currentDate)
                                    }
                                    onClick={() => handleStartKuisClick(kuis)}
                                >
                                    {kuis.selesai
                                        ? 'Selesai'
                                        : kuis.is_overdue && !kuis.selesai
                                            ? 'Lanjut Mengerjakan'
                                            : !kuisIsOpen(kuis.waktu_mulai, kuis.waktu_selesai, currentDate)
                                                ? 'Belum Dibuka'
                                                : 'Kerjakan Kuis'
                                    }
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                {kuis.length < 1 && (
                    <Card className="w-full py-10 px-6 rounded shadow-none border-none">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-muted/50 p-4 rounded-full">
                                <CalendarX className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold tracking-tight">Horee🥳 Tidak ada kuis mendatang</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    Saat ini tidak ada kuis yang dijadwalkan untuk Anda. Kuis baru akan muncul di sini ketika tersedia.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Muat Ulang
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                <AlertDialog open={ openStartKuisForm } onOpenChange={ handleStartKuisFormOpen }>
                    <AlertDialogContent className="my-alert-dialog-content" onOpenAutoFocus={ (e) => e.preventDefault() }>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                { startKuisForm.nama }
                            </AlertDialogTitle>
                            <Separator className="my-0.5 bg-primary/40 h-0.5" />
                            <AlertDialogDescription asChild className="text-primary">
                                <div className="flex flex-col justify-between flex-wrap gap-4 text-sm">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                        <span>Durasi : { kuisDuration(startKuisForm.waktu_mulai, startKuisForm.waktu_selesai) } Menit</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                                        <span>Jumlah Soal : { startKuisForm.soal_count } Soal</span>
                                    </div>
                                    <div className="flex items-center col-span-2">
                                        <CalendarClock className="h-4 w-4 mr-2 text-gray-500"  />
                                        <span>Tenggat Waktu : { format(startKuisForm.waktu_selesai, "PPP 'Pukul' HH:mm", { locale: localeId }) }</span>
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Separator className="my-0.5 bg-primary/40 h-0.5" />
                        <form className={ cn("grid items-start gap-4") } onSubmit={ handleStartKuisFormSubmit }>
                            <div className="grid gap-2">
                                <Label htmlFor="validation">
                                    { startKuisForm.has_kode
                                        ? "Masukkan Kode Kuis"
                                        : "Validasi memulai Kuis"
                                    }
                                </Label>
                                <Input
                                    type="text"
                                    name="validation"
                                    id="validation"
                                    value={ startKuisForm.validation }
                                    placeholder={ startKuisForm.has_kode ? "Kode" : "JARKOM JAYA" }
                                    onChange={ (event) =>
                                        setStartKuisForm((prevState) => ({
                                            ...prevState,
                                            validation: event.target.value,
                                        }))
                                    }
                                    autoComplete="off"
                                />
                                { startKuisForm.has_kode
                                    ? (
                                        <p className="text-sm text-primary">Masukkan kode kuis untuk melanjutkan</p>
                                    )
                                    : (
                                        <p>Ketik <strong>JARKOM JAYA</strong> untuk melanjutkan</p>
                                    )
                                }
                            </div>
                            <Button type="submit" disabled={ startKuisForm.onSubmit || startKuisForm.has_kode ? !startKuisForm.validation : (startKuisForm.validation !== 'JARKOM JAYA')}>
                                { startKuisForm.onSubmit
                                    ? (
                                        <>Memproses <Loader2 className="animate-spin" /></>
                                    ) : (
                                        <span>Mulai Kuis</span>
                                    )
                                }
                            </Button>
                        </form>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                    </AlertDialogContent>
                </AlertDialog>
            </PraktikanLayout>
        </>
    );
}
