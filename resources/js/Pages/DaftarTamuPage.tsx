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
import { format } from "date-fns";
import { id as localdeId } from "date-fns/locale";
import { FormEventHandler } from 'react';

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

    const handleCheckout = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menyelesaikan aktivitas ini (Checkout)?')) {
            router.post(route('daftartamu.checkout', id), {}, {
                onSuccess: () => {
                    toast({
                        title: "Checkout Berhasil",
                        description: "Waktu selesai telah dicatat.",
                    });
                }
            });
        }
    };

    return (
        <AppLayout auth={auth}>
            <Head title="Daftar Tamu Logbook" />
            
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
                                                            <Button size="sm" variant="default" onClick={() => handleCheckout(log.id)}>
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
