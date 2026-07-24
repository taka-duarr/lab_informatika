import { Head, router } from "@inertiajs/react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { DosenLayout } from "@/layouts/DosenLayout";
import { AslabLayout } from "@/layouts/AslabLayout";
import { PageProps } from "@/types";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Upload } from "lucide-react";
import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface Modul {
    id: string;
    nama: string;
    pertemuan_id: string;
}

interface Kuis {
    id: string;
    pertemuan_id: string;
}

interface Pertemuan {
    id: string;
    nama: string;
    modul: Modul[];
    kuis: Kuis[];
}

interface Praktikum {
    id: string;
    nama: string;
    pertemuan: Pertemuan[];
}

interface Praktikan {
    id: string;
    nama: string;
    username: string;
}

interface SesiPraktikum {
    id: string;
    nama: string;
}

interface PraktikumPraktikan {
    praktikan_id: string;
    praktikan: Praktikan;
    sesi_praktikum?: SesiPraktikum;
    nilai_ta?: number;
    nilai_total?: number;
}

interface Nilai {
    praktikan_id: string;
    modul_id: string;
    nilai_pretest?: number;
    pelanggaran_pretest?: number;
    nilai_asistensi?: number;
    nilai_asdos?: number;
}

interface KuisPraktikan {
    praktikan_id: string;
    kuis_id: string;
    skor: number;
}

interface Props extends PageProps {
    praktikum: Praktikum;
    praktikans: PraktikumPraktikan[];
    nilais: Nilai[];
    kuisPraktikans: KuisPraktikan[];
    role: 'admin' | 'dosen' | 'aslab';
}

export default function NilaiIndex({
    praktikum,
    praktikans,
    nilais,
    kuisPraktikans,
    role,
    auth,
}: Props) {
    const Layout = role === 'admin' ? AdminLayout : (role === 'aslab' ? AslabLayout : DosenLayout);
    const { toast } = useToast();
    
    // Sort modules by Pertemuan and then by their own logic, here simply flattening
    const allModuls = praktikum.pertemuan ? praktikum.pertemuan.flatMap(p => p.modul || []) : [];
    
    const [loadingCell, setLoadingCell] = useState<string | null>(null);

    const getNilai = (praktikanId: string, modulId: string) => {
        return nilais.find(n => n.praktikan_id === praktikanId && n.modul_id === modulId);
    };

    const getPretestScore = (praktikanId: string, pertemuanId: string) => {
        if (!praktikum.pertemuan) return 0;
        const pertemuan = praktikum.pertemuan.find(p => p.id === pertemuanId);
        if (!pertemuan || !pertemuan.kuis || pertemuan.kuis.length === 0) return 0;
        
        // Find all scores for quizzes in this meeting
        const scores = pertemuan.kuis.map(k => {
            const kp = kuisPraktikans.find(kp => kp.praktikan_id === praktikanId && kp.kuis_id === k.id);
            return kp ? kp.skor : 0;
        });
        
        // Return the maximum score (handles susulan/remedial quizzes automatically)
        return Math.max(...scores);
    };

    const handleCellUpdate = (praktikanId: string, modulId: string | null, field: string, value: string) => {
        const numValue = value === '' ? null : parseFloat(value);
        
        setLoadingCell(`${praktikanId}-${modulId}-${field}`);

        router.post(
            route(`${role}.nilai-praktikum.update-cell`, { praktikum_id: praktikum.id }),
            {
                praktikan_id: praktikanId,
                modul_id: modulId,
                field: field,
                value: numValue
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setLoadingCell(null),
                onError: () => {
                    toast({
                        title: "Gagal menyimpan nilai",
                        description: "Pastikan format angka valid.",
                        variant: "destructive"
                    });
                }
            }
        );
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleDownloadFormat = () => {
        window.location.href = route(`${role}.nilai-praktikum.export`, { praktikum_id: praktikum.id });
        toast({
            title: "Mengunduh Format",
            description: "File Excel sedang diunduh...",
        });
    };

    const handleDownloadAkhir = () => {
        window.location.href = route(`${role}.nilai-praktikum.export-akhir`, { praktikum_id: praktikum.id });
        toast({
            title: "Mencetak Nilai Akhir",
            description: "Rekap Nilai Akhir sedang diunduh...",
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        router.post(route(`${role}.nilai-praktikum.import`, { praktikum_id: praktikum.id }), formData, {
            onSuccess: () => {
                toast({
                    title: "Berhasil!",
                    description: "Data berhasil diimpor dari file Excel.",
                });
            },
            onError: (errors: any) => {
                toast({
                    title: "Gagal Impor",
                    description: errors.file || "Terjadi kesalahan saat membaca file.",
                    variant: "destructive"
                });
            },
            onFinish: () => {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        });
    };

    const renderEditableCell = (praktikanId: string, modulId: string | null, field: string, currentValue: number | undefined | null, isEditable: boolean) => {
        return (
            <div className="relative flex items-center justify-center w-full min-w-[70px]">
                <Input
                    type="number"
                    defaultValue={currentValue ?? ''}
                    onBlur={(e) => {
                        if (e.target.value !== (currentValue?.toString() ?? '')) {
                            handleCellUpdate(praktikanId, modulId, field, e.target.value);
                        }
                    }}
                    disabled={!isEditable || loadingCell === `${praktikanId}-${modulId}-${field}`}
                    className={`w-16 h-8 text-center px-1 text-xs ${!isEditable ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
                />
                {loadingCell === `${praktikanId}-${modulId}-${field}` && (
                    <div className="absolute right-1">
                        <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout auth={auth}>
            <Head title={`Nilai - ${praktikum.nama}`} />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-slate-800">
                            Input Nilai: {praktikum.nama}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Kelola nilai Pretest, Asistensi, Dosen, dan Nilai Total untuk praktikan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="file" 
                            accept=".xlsx,.xls,.csv" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        {(role === 'admin' || role === 'aslab') && (
                            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={handleDownloadAkhir} disabled={isUploading}>
                                <Download className="w-4 h-4 mr-2" />
                                Cetak Nilai Akhir
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleDownloadFormat} disabled={isUploading}>
                            <Download className="w-4 h-4 mr-2" />
                            Unduh Format
                        </Button>
                        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            Import Nilai
                        </Button>
                    </div>
                </div>

                <Card className="shadow-sm min-w-0 max-w-full overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">Tabel Nilai Praktikan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 relative z-0 min-w-0 max-w-full overflow-hidden">
                        <Table className="w-full text-sm whitespace-nowrap border-separate border-spacing-0">
                            <TableHeader>
                                <TableRow className="bg-slate-100 hover:bg-slate-100">
                                    <TableHead className="sticky left-0 bg-slate-100 z-30 border-r border-b w-12 min-w-[48px] text-center font-semibold">No</TableHead>
                                    <TableHead className="sticky left-[48px] bg-slate-100 z-30 border-r border-b w-36 min-w-[140px] font-semibold">NPM</TableHead>
                                    <TableHead className="sticky left-[188px] bg-slate-100 z-30 border-r border-b w-56 min-w-[220px] font-semibold shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]">Nama Lengkap</TableHead>
                                    <TableHead className="border-r border-b min-w-[80px]">Sesi</TableHead>
                                    
                                    {allModuls.map((modul, i) => (
                                        <TableHead key={modul.id} colSpan={(role === 'admin' || role === 'aslab') ? 5 : 1} className="border-r border-b text-center bg-slate-50 font-semibold">
                                            Modul {i + 1}
                                        </TableHead>
                                    ))}
                                    
                                    {(role === 'admin' || role === 'aslab') && (
                                        <>
                                            <TableHead className="text-center border-r border-b bg-slate-50 min-w-[80px] font-semibold">Rata-rata</TableHead>
                                            <TableHead className="text-center border-r border-b bg-slate-50 min-w-[80px] font-semibold">TA</TableHead>
                                            <TableHead className="text-center border-b bg-slate-50 min-w-[80px] font-semibold">Nilai Total</TableHead>
                                        </>
                                    )}
                                </TableRow>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="sticky left-0 bg-slate-50 z-30 border-r border-b w-12 min-w-[48px]"></TableHead>
                                    <TableHead className="sticky left-[48px] bg-slate-50 z-30 border-r border-b w-36 min-w-[140px]"></TableHead>
                                    <TableHead className="sticky left-[188px] bg-slate-50 z-30 border-r border-b w-56 min-w-[220px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]"></TableHead>
                                    <TableHead className="border-r border-b min-w-[80px]"></TableHead>

                                    {allModuls.map((modul) => (
                                        <React.Fragment key={`sub-${modul.id}`}>
                                            {(role === 'admin' || role === 'aslab') && <TableHead className="border-r border-b text-center font-medium text-xs">Pretest Asli</TableHead>}
                                            {(role === 'admin' || role === 'aslab') && <TableHead className="border-r border-b text-center font-medium text-xs text-red-600">Minus</TableHead>}
                                            {(role === 'admin' || role === 'aslab') && <TableHead className="border-r border-b text-center font-medium text-xs">Asistensi</TableHead>}
                                            <TableHead className="border-r border-b text-center font-medium text-xs">Dosen</TableHead>
                                            {(role === 'admin' || role === 'aslab') && <TableHead className="border-r border-b text-center font-medium text-xs">Total</TableHead>}
                                        </React.Fragment>
                                    ))}
                                    {(role === 'admin' || role === 'aslab') && <TableHead className="border-r border-b" colSpan={3}></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {praktikans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4 + (allModuls.length * ((role === 'admin' || role === 'aslab') ? 5 : 1)) + ((role === 'admin' || role === 'aslab') ? 3 : 0)} className="text-center text-slate-500 py-8">
                                            Tidak ada praktikan di praktikum ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    praktikans.map((pp, index) => {
                                        let sumTotalModul = 0;
                                        
                                        return (
                                            <TableRow key={pp.praktikan_id} className="group hover:bg-slate-50/50">
                                                <TableCell className="sticky left-0 bg-white group-hover:bg-slate-100 transition-colors z-20 border-r border-b text-center font-medium w-12 min-w-[48px]">{index + 1}</TableCell>
                                                <TableCell className="sticky left-[48px] bg-white group-hover:bg-slate-100 transition-colors z-20 border-r border-b font-medium text-slate-700 w-36 min-w-[140px]">{pp.praktikan.username}</TableCell>
                                                <TableCell className="sticky left-[188px] bg-white group-hover:bg-slate-100 transition-colors z-20 border-r border-b font-medium text-slate-700 truncate w-56 min-w-[220px] max-w-[220px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]">{pp.praktikan.nama}</TableCell>
                                                <TableCell className="border-r text-center text-xs text-slate-500">{pp.sesi_praktikum?.nama || '-'}</TableCell>
                                                
                                                {allModuls.map((modul) => {
                                                    const nilaiRec = getNilai(pp.praktikan_id, modul.id);
                                                    const rawPretest = getPretestScore(pp.praktikan_id, modul.pertemuan_id);
                                                    const minus = nilaiRec?.pelanggaran_pretest || 0;
                                                    const pretest = Math.max(0, rawPretest - minus);
                                                    const asistensi = nilaiRec?.nilai_asistensi || 0;
                                                    const asdos = nilaiRec?.nilai_asdos || 0;
                                                    
                                                    const totalModul = (pretest * 0.20) + (asistensi * 0.40) + (asdos * 0.40);
                                                    sumTotalModul += totalModul;

                                                    return (
                                                        <React.Fragment key={`${pp.praktikan_id}-${modul.id}`}>
                                                            {(role === 'admin' || role === 'aslab') && (
                                                                <TableCell className="border-r text-center p-1 bg-slate-50/30">
                                                                    <div className="flex flex-col items-center justify-center">
                                                                        <span className="text-xs font-semibold">{rawPretest}</span>
                                                                        {minus > 0 && (
                                                                            <span className="text-[10px] text-red-600 font-bold mt-0.5">Akhir: {pretest.toFixed(0)}</span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            )}
                                                            {(role === 'admin' || role === 'aslab') && (
                                                                <TableCell className="border-r p-1">
                                                                    {renderEditableCell(pp.praktikan_id, modul.id, 'pelanggaran_pretest', nilaiRec?.pelanggaran_pretest, true)}
                                                                </TableCell>
                                                            )}
                                                            {(role === 'admin' || role === 'aslab') && (
                                                                <TableCell className="border-r p-1">
                                                                    {renderEditableCell(pp.praktikan_id, modul.id, 'nilai_asistensi', nilaiRec?.nilai_asistensi, true)}
                                                                </TableCell>
                                                            )}
                                                            <TableCell className="border-r p-1">
                                                                {renderEditableCell(pp.praktikan_id, modul.id, 'nilai_asdos', nilaiRec?.nilai_asdos, role === 'dosen' || role === 'admin')}
                                                            </TableCell>
                                                            {(role === 'admin' || role === 'aslab') && (
                                                                <TableCell className="border-r text-center p-1 font-semibold text-blue-700 bg-blue-50/30">
                                                                    {totalModul.toFixed(1)}
                                                                </TableCell>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}

                                                {/* Summary Columns */}
                                                {(role === 'admin' || role === 'aslab') && (
                                                    <>
                                                        <TableCell className="border-r text-center font-bold bg-slate-50">
                                                            {(allModuls.length > 0 ? (sumTotalModul / allModuls.length) : 0).toFixed(1)}
                                                        </TableCell>
                                                        <TableCell className="border-r border-b p-1 bg-slate-50">
                                                            {renderEditableCell(pp.praktikan_id, null, 'nilai_ta', pp.nilai_ta, role === 'admin' || role === 'aslab')}
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold text-emerald-700 bg-emerald-50">
                                                            {(() => {
                                                                const rataRata = allModuls.length > 0 ? (sumTotalModul / allModuls.length) : 0;
                                                                const ta = pp.nilai_ta || 0;
                                                                const final = (rataRata * 0.80) + (ta * 0.20);
                                                                return final.toFixed(1);
                                                            })()}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
