import { Head, router } from "@inertiajs/react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { DosenLayout } from "@/layouts/DosenLayout";
import { PageProps, PaginationData } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSearch, BookMarked } from "lucide-react";

interface Praktikum {
    id: string;
    nama: string;
    tahun: string;
    status: boolean;
    periode: { id: string; nama: string } | null;
    jenis: { id: string; nama: string } | null;
}

interface Props extends PageProps {
    pagination: PaginationData<Praktikum[]>;
    role: 'admin' | 'dosen';
}

export default function ListPraktikum({ pagination, role, auth }: Props) {
    const Layout = role === 'admin' ? AdminLayout : DosenLayout;
    const data = pagination.data;

    return (
        <Layout auth={auth}>
            <Head title="Pilih Praktikum" />
            
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Input Nilai Praktikum
                    </h1>
                    <p className="text-sm text-slate-500">
                        Pilih praktikum di bawah ini untuk melihat dan mengedit matriks nilai.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Praktikum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Praktikum</TableHead>
                                        <TableHead>Tahun</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                                                Tidak ada data praktikum.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((praktikum) => (
                                            <TableRow key={praktikum.id}>
                                                <TableCell className="font-medium">{praktikum.nama}</TableCell>
                                                <TableCell>{praktikum.tahun}</TableCell>
                                                <TableCell>{praktikum.jenis?.nama || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                                        onClick={() =>
                                                            router.visit(
                                                                route(`${role}.nilai-praktikum.details`, {
                                                                    praktikum_id: praktikum.id,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <BookMarked className="w-4 h-4 mr-2" />
                                                        Pilih
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {pagination.links && pagination.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-1 justify-end">
                                {pagination.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
