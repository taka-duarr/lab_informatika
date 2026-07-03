import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { id as localdeId } from "date-fns/locale";
import { FormEventHandler, useState } from 'react';
import { LogOut } from 'lucide-react';

type ActiveLog = {
    id: number;
    nama_tamu: string;
    jumlah_tamu: number;
    tanggal: string;
    jam_mulai: string;
    tujuan_aktivitas: string;
    kondisi_lab: string;
};

export default function DaftarTamuPage({ auth, activeLogs }: PageProps<{ activeLogs: ActiveLog[] }>) {
    const { toast } = useToast();
    const [checkoutTarget, setCheckoutTarget] = useState<ActiveLog | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        nama_tamu: '',
        jumlah_tamu: 1,
        tujuan_aktivitas: '',
        kondisi_lab: 'Baik',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('daftartamu.create'), {
            onSuccess: () => {
                reset();
                toast({
                    title: "Berhasil!",
                    description: "Data tamu berhasil dicatat.",
                });
            },
        });
    };

    const confirmCheckout = () => {
        if (!checkoutTarget) return;
        router.post(route('daftartamu.checkout', checkoutTarget.id), {}, {
            onSuccess: () => {
                toast({
                    title: "Checkout Berhasil! 👋",
                    description: `${checkoutTarget.nama_tamu} telah berhasil checkout. Terima kasih!`,
                });
                setCheckoutTarget(null);
            },
            onError: () => {
                toast({
                    title: "Checkout Gagal",
                    description: "Terjadi kesalahan, silakan coba lagi.",
                    variant: "destructive",
                });
                setCheckoutTarget(null);
            },
        });
    };

    return (
        <AppLayout auth={auth}>
            <Head title="Daftar Tamu Logbook" />

            {/* Checkout Confirmation Modal */}
            <AlertDialog open={!!checkoutTarget} onOpenChange={(open) => !open && setCheckoutTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <AlertDialogTitle className="text-lg">Konfirmasi Checkout</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-sm text-muted-foreground space-y-2 pt-1">
                            <span>Apakah Anda yakin ingin melakukan <strong>checkout</strong> untuk:</span>
                            {checkoutTarget && (
                                <div className="mt-3 rounded-lg border bg-muted/50 p-3 space-y-1 text-left">
                                    <p className="font-semibold text-foreground">{checkoutTarget.nama_tamu}</p>
                                    <p className="text-xs text-muted-foreground">{checkoutTarget.jumlah_tamu} Orang &bull; Masuk {checkoutTarget.jam_mulai.substring(0, 5)} WIB</p>
                                    <p className="text-xs text-muted-foreground truncate">{checkoutTarget.tujuan_aktivitas}</p>
                                </div>
                            )}
                            <span className="block pt-1">Waktu selesai akan dicatat secara otomatis.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCheckout}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Ya, Checkout Sekarang
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Isi Buku Tamu</CardTitle>
                                <CardDescription>Catat aktivitas Anda di laboratorium hari ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_tamu">Nama / Perwakilan Kelompok</Label>
                                        <Input
                                            id="nama_tamu"
                                            value={data.nama_tamu}
                                            onChange={(e) => setData('nama_tamu', e.target.value)}
                                            required
                                            placeholder="Cth: Habib / Kelompok 1"
                                        />
                                        {errors.nama_tamu && <p className="text-red-500 text-sm">{errors.nama_tamu}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jumlah_tamu">Jumlah Orang</Label>
                                        <Input
                                            id="jumlah_tamu"
                                            type="number"
                                            min="1"
                                            value={data.jumlah_tamu}
                                            onChange={(e) => setData('jumlah_tamu', parseInt(e.target.value))}
                                            required
                                        />
                                        {errors.jumlah_tamu && <p className="text-red-500 text-sm">{errors.jumlah_tamu}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tujuan_aktivitas">Tujuan Aktivitas</Label>
                                        <Textarea
                                            id="tujuan_aktivitas"
                                            value={data.tujuan_aktivitas}
                                            onChange={(e) => setData('tujuan_aktivitas', e.target.value)}
                                            required
                                            placeholder="Cth: Mengerjakan tugas akhir, Rapat persiapan akreditasi"
                                        />
                                        {errors.tujuan_aktivitas && <p className="text-red-500 text-sm">{errors.tujuan_aktivitas}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="kondisi_lab">Kondisi Lab Saat Datang</Label>
                                        <Input
                                            id="kondisi_lab"
                                            value={data.kondisi_lab}
                                            onChange={(e) => setData('kondisi_lab', e.target.value)}
                                            required
                                            placeholder="Cth: Baik, AC dingin, PC 2 mati"
                                        />
                                        {errors.kondisi_lab && <p className="text-red-500 text-sm">{errors.kondisi_lab}</p>}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        Simpan Kegiatan
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Logs Table */}
                    <div className="md:col-span-8">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Kegiatan Aktif Saat Ini</CardTitle>
                                <CardDescription>Tamu yang sedang berada di dalam lab. Jangan lupa Checkout jika sudah selesai.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tamu</TableHead>
                                                <TableHead>Waktu Masuk</TableHead>
                                                <TableHead>Tujuan</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activeLogs.length > 0 ? (
                                                activeLogs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell>
                                                            <div className="font-medium">{log.nama_tamu}</div>
                                                            <div className="text-xs text-muted-foreground">{log.jumlah_tamu} Orang</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {format(new Date(log.tanggal), "dd MMM yyyy", { locale: localdeId })}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-semibold text-blue-600">
                                                                Masuk {log.jam_mulai.substring(0, 5)} WIB
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[250px] truncate">{log.tujuan_aktivitas}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-amber-400 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                                                onClick={() => setCheckoutTarget(log)}
                                                            >
                                                                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                                                                Checkout
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                        Belum ada kegiatan aktif.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
