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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localdeId } from "date-fns/locale";
import { useState, useRef, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Download, Search, Filter, Trash2, Edit, Upload, FileSpreadsheet, Clock } from 'lucide-react';
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

// ─── Helper: Excel serial number / time string → "HH:MM:SS" ─────────────────
function parseExcelTime(val: any): string | null {
    if (val === null || val === undefined || val === '') return null;

    // Sudah string format H:MM:SS atau HH:MM:SS
    if (typeof val === 'string') {
        const trimmed = val.trim();
        // Match HH:MM atau HH:MM:SS
        const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (match) {
            const h = match[1].padStart(2, '0');
            const m = match[2];
            const s = match[3] ?? '00';
            return `${h}:${m}:${s}`;
        }
        return trimmed;
    }

    // Excel serial fractional (0.375 = 09:00:00)
    if (typeof val === 'number') {
        const totalSec = Math.round(val * 86400);
        const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSec % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    return null;
}

// ─── Helper: Hitung durasi dari 2 time string → "H:MM" ──────────────────────
function calcDurasi(mulai: string, selesai: string | null): string {
    if (!selesai) return '-';
    const [h1, m1] = mulai.split(':').map(Number);
    const [h2, m2] = selesai.split(':').map(Number);
    const diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMin <= 0) return '-';
    const dH = Math.floor(diffMin / 60);
    const dM = diffMin % 60;
    return dH > 0 ? `${dH} jam ${dM > 0 ? dM + ' mnt' : ''}`.trim() : `${dM} mnt`;
}

// ─── Helper: Parse tanggal M/D/YYYY atau YYYY-MM-DD ─────────────────────────
function parseDate(val: any): string | null {
    if (!val) return null;

    // Excel serial integer (e.g. 46342)
    if (typeof val === 'number') {
        const date = XLSX.SSF.parse_date_code(val);
        if (date) {
            const y = date.y;
            const m = String(date.m).padStart(2, '0');
            const d = String(date.d).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
    }

    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return null;

        // Format M/D/YYYY atau MM/DD/YYYY
        const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slashMatch) {
            const m = slashMatch[1].padStart(2, '0');
            const d = slashMatch[2].padStart(2, '0');
            const y = slashMatch[3];
            return `${y}-${m}-${d}`;
        }

        // Sudah YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    }

    return null;
}

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

    // ─── CSV / Excel Import ────────────────────────────────────────────────────
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [importPreview, setImportPreview] = useState<{ total: number; skipped: number } | null>(null);

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportPreview(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;

                // Baca dengan cellDates:false agar kita handle konversi sendiri
                const wb = XLSX.read(bstr, { type: 'binary', cellDates: false });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // sheet_to_json dengan raw:true supaya waktu & tanggal tetap angka Excel
                const rawData: any[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: null });

                if (rawData.length === 0) {
                    toast({ title: 'Error', description: 'File kosong.', variant: 'destructive' });
                    setImporting(false);
                    return;
                }

                // ── Carry-forward tanggal (baris tanpa tanggal pakai tanggal baris sebelumnya) ──
                let lastDate: string | null = null;
                const formattedData: any[] = [];
                let skipped = 0;

                for (const row of rawData) {
                    // Kolom CSV: No, Tanggal, Jam Mulai, Jam Selesai, Durasi,
                    //            Aktivitas Kegiatan, Nama, Jml, Kondisi Lab, Ket, Paraf
                    const rawTanggal = row['Tanggal'] ?? row['TANGGAL'] ?? row['tanggal'] ?? null;
                    const parsedDate = parseDate(rawTanggal);
                    if (parsedDate) lastDate = parsedDate;
                    const tanggal = lastDate;

                    if (!tanggal) { skipped++; continue; }

                    const aktivitas =
                        row['Aktivitas Kegiatan'] ??
                        row['AKTIVITAS KEGIATAN'] ??
                        row['aktivitas_kegiatan'] ??
                        row['Tujuan Aktivitas'] ??
                        row['TUJUAN AKTIVITAS'] ??
                        null;

                    if (!aktivitas) { skipped++; continue; }

                    const jamMulaiRaw = row['Jam Mulai'] ?? row['JAM MULAI'] ?? row['jam_mulai'] ?? null;
                    const jamSelesaiRaw = row['Jam Selesai'] ?? row['JAM SELESAI'] ?? row['jam_selesai'] ?? null;

                    const jam_mulai = parseExcelTime(jamMulaiRaw);
                    if (!jam_mulai) { skipped++; continue; }

                    const jam_selesai = parseExcelTime(jamSelesaiRaw);

                    // Kolom Nama (ada di logbook Januari 2026+)
                    const nama =
                        row['Nama'] ??
                        row['NAMA'] ??
                        row['nama'] ??
                        row['Nama Tamu'] ??
                        row['NAMA TAMU'] ??
                        null;

                    const jml = row['Jml'] ?? row['JML'] ?? row['Jumlah'] ?? row['JUMLAH'] ?? null;
                    const kondisi = row['Kondisi Lab'] ?? row['KONDISI LAB'] ?? row['kondisi_lab'] ?? null;

                    // Kolom Ket dan Paraf diabaikan sesuai permintaan

                    formattedData.push({
                        tanggal,
                        jam_mulai,
                        jam_selesai: jam_selesai || null,
                        tujuan_aktivitas: String(aktivitas).trim(),
                        nama_tamu: nama ? String(nama).trim() : '-',
                        jumlah_tamu: jml ? parseInt(String(jml)) || 1 : 1,
                        kondisi_lab: kondisi ? String(kondisi).trim() : '-',
                    });
                }

                if (formattedData.length === 0) {
                    toast({
                        title: 'Import Gagal',
                        description: `Tidak ada baris valid. ${skipped} baris dilewati.`,
                        variant: 'destructive'
                    });
                    setImporting(false);
                    return;
                }

                setImportPreview({ total: formattedData.length, skipped });

                router.post(route('admin.daftartamu.import'), { data: formattedData }, {
                    onSuccess: () => {
                        toast({
                            title: '✅ Import Berhasil!',
                            description: `${formattedData.length} baris diimport${skipped > 0 ? `, ${skipped} baris dilewati` : ''}.`,
                        });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        setImportPreview(null);
                    },
                    onError: (err) => {
                        toast({
                            title: 'Import Gagal',
                            description: 'Format tidak sesuai. Cek konsol untuk detail.',
                            variant: 'destructive'
                        });
                        console.error('Import errors:', err);
                    },
                    onFinish: () => setImporting(false),
                });
            } catch (err) {
                toast({ title: 'Error', description: 'Gagal memproses file.', variant: 'destructive' });
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

                {/* Import CSV Card */}
                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            Import dari CSV / Excel
                        </CardTitle>
                        <CardDescription className="space-y-1">
                            <span className="block">
                                Upload file CSV dengan format kolom:{' '}
                                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                                    No, Tanggal, Jam Mulai, Jam Selesai, Durasi, Aktivitas Kegiatan, Jml, Kondisi Lab
                                </code>
                            </span>
                            <span className="block text-xs text-amber-600 font-medium">
                                ⚠ Kolom <strong>Ket</strong> dan <strong>Paraf</strong> otomatis diabaikan.
                                Baris tanpa tanggal akan menggunakan tanggal baris sebelumnya.
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="flex items-center gap-2 border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg px-4 py-2.5 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {importing ? 'Memproses...' : 'Pilih File CSV / Excel'}
                                    </span>
                                </div>
                                <Input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={importing}
                                />
                            </label>
                            {importing && (
                                <span className="text-sm text-blue-600 animate-pulse flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" /> Memproses import...
                                </span>
                            )}
                            {importPreview && (
                                <span className="text-sm text-green-600 font-medium">
                                    ✅ {importPreview.total} baris valid
                                    {importPreview.skipped > 0 && `, ${importPreview.skipped} dilewati`}
                                </span>
                            )}
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
                                    placeholder="Aktivitas / Kondisi Lab..."
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
                                    <TableHead>TANGGAL</TableHead>
                                    <TableHead>NAMA</TableHead>
                                    <TableHead>JAM MASUK</TableHead>
                                    <TableHead>JAM SELESAI</TableHead>
                                    <TableHead>DURASI</TableHead>
                                    <TableHead>AKTIVITAS KEGIATAN</TableHead>
                                    <TableHead className="text-center">JML</TableHead>
                                    <TableHead>KONDISI LAB</TableHead>
                                    <TableHead>STATUS</TableHead>
                                    <TableHead className="text-right">AKSI</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daftarTamu.length > 0 ? (
                                    daftarTamu.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center text-muted-foreground text-sm">{index + 1}</TableCell>
                                            <TableCell className="whitespace-nowrap text-sm">
                                                {format(new Date(item.tanggal), 'dd MMM yyyy', { locale: localdeId })}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                                {item.nama_tamu && item.nama_tamu !== '-' ? item.nama_tamu : (
                                                    <span className="text-muted-foreground italic text-xs">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm font-medium text-blue-700">
                                                {item.jam_mulai.substring(0, 5)} WIB
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                {item.jam_selesai ? `${item.jam_selesai.substring(0, 5)} WIB` : (
                                                    <span className="text-amber-500 italic text-xs">Belum selesai</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                {calcDurasi(item.jam_mulai, item.jam_selesai)}
                                            </TableCell>
                                            <TableCell className="max-w-[220px]">
                                                <span className="line-clamp-2 text-sm">{item.tujuan_aktivitas}</span>
                                            </TableCell>
                                            <TableCell className="text-center text-sm">
                                                {item.jumlah_tamu > 0 ? item.jumlah_tamu : '-'}
                                            </TableCell>
                                            <TableCell className="text-sm">{item.kondisi_lab}</TableCell>
                                            <TableCell>
                                                {item.jam_selesai ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 font-semibold text-xs">
                                                        SELESAI
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                                                        onClick={() => {
                                                            router.post(route('admin.daftartamu.checkout', item.id), {}, { preserveScroll: true })
                                                        }}
                                                    >
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
                                        <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
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
                        <DialogTitle>Edit Data Logbook</DialogTitle>
                    </DialogHeader>
                    {editData && (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal</Label>
                                    <Input type="date" value={formData.tanggal} onChange={e => setFormData('tanggal', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jumlah Orang</Label>
                                    <Input type="number" min="1" value={formData.jumlah_tamu} onChange={e => setFormData('jumlah_tamu', parseInt(e.target.value))} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jam Masuk (HH:MM:SS)</Label>
                                    <Input value={formData.jam_mulai} onChange={e => setFormData('jam_mulai', e.target.value)} required placeholder="09:00:00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Jam Selesai (HH:MM:SS)</Label>
                                    <Input value={formData.jam_selesai} onChange={e => setFormData('jam_selesai', e.target.value)} placeholder="12:00:00 atau kosong" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Aktivitas Kegiatan</Label>
                                    <Input value={formData.tujuan_aktivitas} onChange={e => setFormData('tujuan_aktivitas', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kondisi Lab</Label>
                                    <Input value={formData.kondisi_lab} onChange={e => setFormData('kondisi_lab', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nama / Penginput</Label>
                                    <Input value={formData.nama_tamu} onChange={e => setFormData('nama_tamu', e.target.value)} placeholder="Opsional" />
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
