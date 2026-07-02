import { Head, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { format, parseISO } from "date-fns";
import { id as localdeId } from "date-fns/locale";
import { useState, useRef, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Download, Search, Filter, Trash2, Edit } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';

type DaftarTamu = {
    id: number;
    nama_tamu: string;
    jumlah_tamu: number;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string | null;
    tujuan_aktivitas: string;
    kondisi_lab: string;
};

export default function AdminDaftarTamuIndexPage({ 
    auth, 
    daftarTamu,
    filters 
}: PageProps<{ 
    daftarTamu: DaftarTamu[],
    filters: { start_date?: string, end_date?: string, q?: string }
}>) {
    const { toast } = useToast();
    const [search, setSearch] = useState(filters.q || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    
    // Edit Modal State
    const [editData, setEditData] = useState<DaftarTamu | null>(null);
    const { data: formData, setData: setFormData, post: updatePost, processing: updating } = useForm({
        nama_tamu: '',
        jumlah_tamu: 1,
        tanggal: '',
        jam_mulai: '',
        jam_selesai: '',
        tujuan_aktivitas: '',
        kondisi_lab: '',
    });

    const handleFilter = () => {
        router.get(route('admin.daftartamu.index'), {
            q: search,
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.post(route('admin.daftartamu.delete', id), {}, {
                onSuccess: () => {
                    toast({ title: 'Berhasil dihapus' });
                }
            });
        }
    };

    const openEditModal = (item: DaftarTamu) => {
        setEditData(item);
        setFormData({
            nama_tamu: item.nama_tamu,
            jumlah_tamu: item.jumlah_tamu,
            tanggal: item.tanggal,
            jam_mulai: item.jam_mulai,
            jam_selesai: item.jam_selesai || '',
            tujuan_aktivitas: item.tujuan_aktivitas,
            kondisi_lab: item.kondisi_lab,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;
        
        updatePost(route('admin.daftartamu.update', editData.id), {
            onSuccess: () => {
                setEditData(null);
                toast({ title: 'Berhasil diperbarui' });
            }
        });
    };

    // Excel Import Logic
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                if (data.length === 0) {
                    toast({ title: 'Error', description: 'File Excel kosong.', variant: 'destructive' });
                    setImporting(false);
                    return;
                }

                // Format data before sending
                const formattedData = data.map((row: any) => ({
                    tanggal: row['tanggal'] || row['TANGGAL'],
                    jam_mulai: row['jam_mulai'] || row['JAM MULAI'] || row['WAKTU MASUK'],
                    jam_selesai: row['jam_selesai'] || row['JAM SELESAI'] || row['WAKTU KELUAR'] || null,
                    tujuan_aktivitas: row['tujuan_aktivitas'] || row['TUJUAN AKTIVITAS'] || row['TUJUAN'],
                    nama_tamu: row['nama_tamu'] || row['NAMA TAMU'] || row['TAMU'] || row['NAMA'],
                    jumlah_tamu: row['jumlah_tamu'] || row['JUMLAH TAMU'] || row['JUMLAH ORANG'] || 1,
                    kondisi_lab: row['kondisi_lab'] || row['KONDISI LAB'] || row['KONDISI'] || 'Baik'
                }));

                router.post(route('admin.daftartamu.import'), { data: formattedData }, {
                    onSuccess: () => {
                        toast({ title: 'Import Berhasil', description: `${formattedData.length} baris berhasil diimpor.` });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    },
                    onError: () => {
                        toast({ title: 'Import Gagal', description: 'Format Excel tidak sesuai.', variant: 'destructive' });
                    },
                    onFinish: () => setImporting(false)
                });
            } catch (err) {
                toast({ title: 'Error', description: 'Gagal memproses file Excel.', variant: 'destructive' });
                setImporting(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Admin Logbook" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Daftar Tamu</h1>
                    <p className="text-muted-foreground">Kelola rekap logbook dan aktivitas laboratorium.</p>
                </div>

                {/* Import Excel Card */}
                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            Import Rekap Excel Manual
                        </CardTitle>
                        <CardDescription>
                            Unduh template, isi data rekap lama, lalu upload.
                            Kolom wajib: tanggal, jam_mulai, tujuan_aktivitas, nama_tamu, jumlah_tamu, kondisi_lab.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative">
                                <Input 
                                    type="file" 
                                    accept=".xlsx,.xls,.csv" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="max-w-sm cursor-pointer"
                                    disabled={importing}
                                />
                            </div>
                            {importing && <span className="text-sm text-blue-600 animate-pulse">Memproses import...</span>}
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3 space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase">Dari Tanggal</Label>
                            <Input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                            />
                        </div>
                        <div className="md:col-span-3 space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase">Sampai Tanggal</Label>
                            <Input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                            />
                        </div>
                        <div className="md:col-span-4 space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase">Cari</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Nama / Tujuan / Kondisi..." 
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <Button onClick={handleFilter} className="w-full bg-blue-900 hover:bg-blue-800">
                                <Filter className="mr-2 h-4 w-4" /> Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">NO</TableHead>
                                    <TableHead>TAMU</TableHead>
                                    <TableHead>TANGGAL</TableHead>
                                    <TableHead>WAKTU</TableHead>
                                    <TableHead>TUJUAN</TableHead>
                                    <TableHead>KONDISI</TableHead>
                                    <TableHead>STATUS</TableHead>
                                    <TableHead className="text-right">AKSI</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daftarTamu.length > 0 ? (
                                    daftarTamu.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{item.nama_tamu}</div>
                                                <div className="text-xs text-muted-foreground">{item.jumlah_tamu} ORANG</div>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(item.tanggal), 'dd MMM yyyy', { locale: localdeId })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">Masuk {item.jam_mulai.substring(0, 5)} WIB</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.jam_selesai ? `Keluar ${item.jam_selesai.substring(0, 5)} WIB` : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">{item.tujuan_aktivitas}</TableCell>
                                            <TableCell>{item.kondisi_lab}</TableCell>
                                            <TableCell>
                                                {item.jam_selesai ? (
                                                    <span className="text-sm text-green-600 font-semibold tracking-wide">SELESAI</span>
                                                ) : (
                                                    <Button variant="outline" size="sm" className="h-7 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => {
                                                        router.post(route('admin.daftartamu.checkout', item.id), {}, { preserveScroll: true })
                                                    }}>
                                                        CHECKOUT
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}>
                                                    <Edit className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Daftar Tamu</DialogTitle>
                    </DialogHeader>
                    {editData && (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Tamu</Label>
                                    <Input value={formData.nama_tamu} onChange={e => setFormData('nama_tamu', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jumlah Tamu</Label>
                                    <Input type="number" min="1" value={formData.jumlah_tamu} onChange={e => setFormData('jumlah_tamu', parseInt(e.target.value))} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal</Label>
                                    <Input type="date" value={formData.tanggal} onChange={e => setFormData('tanggal', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tujuan</Label>
                                    <Input value={formData.tujuan_aktivitas} onChange={e => setFormData('tujuan_aktivitas', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jam Masuk (H:i:s)</Label>
                                    <Input value={formData.jam_mulai} onChange={e => setFormData('jam_mulai', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jam Keluar (H:i:s)</Label>
                                    <Input value={formData.jam_selesai} onChange={e => setFormData('jam_selesai', e.target.value)} placeholder="00:00:00 atau kosong" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Kondisi Lab</Label>
                                    <Input value={formData.kondisi_lab} onChange={e => setFormData('kondisi_lab', e.target.value)} required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditData(null)}>Batal</Button>
                                <Button type="submit" disabled={updating}>Simpan Perubahan</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
