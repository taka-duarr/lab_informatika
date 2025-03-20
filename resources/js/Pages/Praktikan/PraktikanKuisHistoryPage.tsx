import { PraktikanLayout } from "@/layouts/PraktikanLayout";
import { Head, router } from "@inertiajs/react";
import { kuisDateTime, kuisDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { BookOpenText, Clock, RefreshCw, Tag } from "lucide-react"
import { PageProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type Kuis = {
    id: string;
    nama: string;
    waktu_mulai: string;
    waktu_selesai: string;
    soal_count: number;
    skor: number;
    jenis_praktikum: {
        id: string;
        nama: string;
    };
    laboratorium: {
        id: string;
        nama: string
    };
    kuis_praktikan_id: string;
};
export default function PraktikanKuisIndexPage({ auth, kuis }: PageProps<{
    currentDate: string;
    kuis: Kuis[];
}>) {

    return (
        <>
            <PraktikanLayout auth={auth}>
                <Head title="Praktikan - Histori Kuis" />
                <CardTitle>Histori Kuis</CardTitle>
                <CardDescription>Menampilkan kuis yang telah kamu selesaikan</CardDescription>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            { kuis.map(kuis => ((
                                <div key={kuis.id} className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{ kuis.nama }</h3>
                                            <p className="text-sm text-muted-foreground">{ kuis.jenis_praktikum.nama } - { kuisDateTime(kuis.waktu_mulai, kuis.waktu_selesai) }</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Badge className="py-2 bg-green-500">{ kuis.skor }%</Badge>
                                            <TooltipProvider>
                                                <Tooltip delayDuration={100}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" onClick={() => router.visit(route('praktikan.kuis.result', { id: kuis.kuis_praktikan_id }))}>
                                                            <BookOpenText />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Detail hasil</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                                        <Clock className="mr-1 h-4 w-4" />
                                        <span>Durasi: { kuisDuration(kuis.waktu_mulai, kuis.waktu_selesai) } Menit</span>
                                        <span className="mx-2">•</span>
                                        <span>{ kuis.soal_count } Soal</span>
                                        <span className="mx-2">•</span>
                                        <span>Selesai</span>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                                        <Tag className="mr-1 h-4 w-4" />
                                        <span>Laboratorium { kuis.laboratorium.nama }</span>
                                    </div>
                                </div>
                            )))}
                        </div>
                        {/*<div className="flex items-center justify-center">*/}
                        {/*    <Button variant="outline" size="sm">*/}
                        {/*        Load More*/}
                        {/*    </Button>*/}
                        {/*</div>*/}
                    </div>
                </CardContent>

                {kuis.length < 1 && (
                    <Card className="w-full py-10 px-6 rounded shadow-none border-none">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-muted/50 p-4 rounded-full">
                                <p className="text-2xl">😉</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold tracking-tight">Belum ada data Kuis</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    Kamu belum menyelesaikan kuis
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
            </PraktikanLayout>
        </>
    );
}
