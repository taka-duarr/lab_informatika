import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Link } from "@inertiajs/react"
import { ArrowBigLeft, CheckCircle, Clock, FileText, Home } from "lucide-react"
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { PageProps } from "@/types";
import { kuisDuration } from "@/lib/utils";

type KuisPraktikan = {
    id: string;
    skor: number;
    jumlah_benar: number;
    updated_at: string;
    kuis: {
        id: string;
        nama: string;
        waktu_mulai: string;
        waktu_selesai: string;
        soal_count: number;
    };
    laboratorium: {
        id: string;
        nama: string;
    };
};
export default function PraktikanKuisResultPage({ kuisPraktikan }: PageProps<{
    kuisPraktikan: KuisPraktikan;
}>) {
    const resultMessage = (() => {
        switch (true) {
            case kuisPraktikan.skor >= 95:
                return "Kedinginan di puncak...!🥶";
            case kuisPraktikan.skor >= 90:
                return "Cool bet!🥶";
            case kuisPraktikan.skor >= 80:
                return "Not the Best, but Good enough! 🤗";
            case kuisPraktikan.skor >= 70:
                return "Semangat kawan, dikit lagi.. 😶‍🌫️";
            default:
                return "Better luck next time.. 🙂";
        }
    })();


    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="flex flex-col items-center justify-center space-y-8">
                <div className="w-full max-w-md text-center">
                    <div className="mb-6">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Kuis Selesai</h1>
                    <p className="text-muted-foreground mt-2">
                        { resultMessage }
                    </p>
                </div>

                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="tracking-wide leading-2">
                            Kuis Sistem Operasi XXXVIII - Pertemuan 2
                        </CardTitle>
                        <CardDescription>Diselesaikan pada { format(kuisPraktikan.updated_at, 'PPPp', { locale: localeId })}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Skor kamu</span>
                                <span className="text-2xl font-bold">{kuisPraktikan.skor}%</span>
                            </div>
                            <Progress value={kuisPraktikan.skor} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0%</span>
                                {/*<span className="text-xs font-medium">70% untuk lulus</span>*/}
                                <span>100%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Jumlah Soal</span>
                                </div>
                                <p className="font-medium">{kuisPraktikan.kuis.soal_count} Soal</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Benar</span>
                                </div>
                                <p className="font-medium">{kuisPraktikan.jumlah_benar} Jawaban</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Waktu Pengerjaan</span>
                                </div>
                                <p className="font-medium">{kuisDuration(kuisPraktikan.kuis.waktu_mulai, kuisPraktikan.kuis.waktu_selesai)} Menit</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Status</span>
                                </div>
                                <p className="font-medium ">
                                    Selesai
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button className="w-full" asChild>
                            <Link href={route('praktikan.kuis.history')}>
                                <ArrowBigLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div className="flex w-full gap-2">
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href={route('praktikan.dashboard')}>
                                    <Home className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-xl font-semibold">Laboratorium { kuisPraktikan.laboratorium.nama }</h2>
                    <p className="text-muted-foreground">
                        { kuisPraktikan.kuis.nama }
                    </p>
                    <h2 className="text-xl font-semibold">
                        -
                    </h2>
                </div>
            </div>
        </div>
    )
}

