import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageProps } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { Ban, RefreshCw } from "lucide-react";
import { useEffect } from "react";

type BlockedPageProps = {
    kuis_praktikan: {
        id: string;
        nama: string;
    };
};

export default function PraktikanKuisBlockedPage({
    kuis_praktikan,
}: PageProps<BlockedPageProps>) {
    useEffect(() => {
        localStorage.removeItem(`kuis:${kuis_praktikan.id}:started`);
        localStorage.removeItem(`kuis:${kuis_praktikan.id}:away-count`);
        localStorage.removeItem(`kuis:${kuis_praktikan.id}:away-last`);
    }, [kuis_praktikan.id]);

    return (
        <>
            <Head title={`Praktikan - Kuis ${kuis_praktikan.nama} Diblokir`} />
            <div className="container max-w-2xl mx-auto py-12 px-4">
                <Card>
                    <CardHeader className="text-center">
                        <Ban className="mx-auto h-14 w-14 text-red-500" />
                        <CardTitle>Kuis Diblokir Sementara</CardTitle>
                        <CardDescription>
                            Aktivitas keluar dari halaman kuis melebihi batas toleransi.
                            Hubungi admin/aslab untuk membuka blokir agar pengerjaan bisa dilanjutkan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-muted-foreground">
                        Progress jawaban yang sudah tersimpan tidak dihapus. Setelah admin membuka
                        blokir, kamu bisa melanjutkan kuis dari data terakhir.
                    </CardContent>
                    <CardFooter className="flex gap-2 justify-center">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit(route("praktikan.kuis.exam", { id: kuis_praktikan.id }))
                            }
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Coba Lagi
                        </Button>
                        <Button asChild>
                            <Link href={route("praktikan.kuis.index")}>Kembali ke Daftar Kuis</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
