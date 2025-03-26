import { Head, router } from "@inertiajs/react";
import { PraktikanLayout } from "@/layouts/PraktikanLayout";
import { PageProps } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, BookOpenText, Clock, NotebookText, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { kuisDateTime } from "@/lib/utils";

export default function PraktikanDashboardPage({ auth, aslabs, kuis }: PageProps<{
    aslabs: {
        nama: string;
        username: string;
        jabatan: string;
        avatar: string | null;
    }[];
    kuis: {
        id: string;
        nama: string;
        waktu_mulai: string;
        waktu_selesai: string;
        praktikum: {
            id: string;
            nama: string;
        };
    }[];
}>) {
    return (
        <>
            <PraktikanLayout auth={auth}>
                <Head title="Praktikan - Dashboard" />
                <div className="flex flex-col lg:flex-row gap-3 text-green-600">
                    <Card className="flex flex-col w-full lg:w-2/3 lg:min-w-[26rem] h-[27rem] lg:h-[32rem] overflow-y-auto rounded">
                        <CardHeader>
                            <CardTitle>Jadwal Kuis</CardTitle>
                            <CardDescription>
                                { kuis.length } Kuis mendatang
                            </CardDescription>
                        </CardHeader>
                        <ScrollArea>
                            <CardContent className="grid gap-4">
                                {
                                    kuis.length > 0 ? kuis.map((kuis, index) => ((
                                        <div key={index} className="space-y-2 rounded-md border p-4 *:flex *:gap-4 *:items-center *:text-sm *:line-clamp-2">
                                            <div className="font-medium">
                                                <BookOpenText size={20} /> { kuis.nama }
                                            </div>
                                            <div>
                                                <NotebookText size={20} /> { kuis.praktikum.nama }
                                            </div>
                                            <div>
                                                <Clock size={20} />{ kuisDateTime(kuis.waktu_mulai, kuis.waktu_selesai) }
                                            </div>
                                        </div>
                                    ))) : (
                                        <div className="flex items-center space-x-4 rounded-md border p-3 truncate [&_p]:truncate">
                                            <p className="text-sm font-medium text-muted-foreground/80">
                                                Tidak ada kuis mendatang
                                            </p>
                                        </div>
                                    )
                                }
                            </CardContent>
                        </ScrollArea>
                        <CardFooter className="mt-auto">
                            <Button className="w-full" onClick={() => router.visit(route('praktikan.kuis.index'))}>
                                Cek Kuis mendatang <ArrowRight/>
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card className="flex flex-col w-full lg:w-1/3 lg:min-w-[23rem] h-[27rem] lg:h-[32rem] overflow-y-auto rounded">
                        <CardHeader>
                            <CardTitle>Aslab Aktif</CardTitle>
                            <CardDescription>
                                { aslabs.length } Aslab aktif saat ini
                            </CardDescription>
                        </CardHeader>
                        <ScrollArea>
                            <CardContent className="grid gap-4">
                                {
                                    aslabs.map((aslab, index) => ((
                                        <div key={ index } className="flex items-center space-x-4 rounded-md border p-4 truncate [&_p]:truncate">
                                            <div className={ `w-8 h-8 rounded-full overflow-hidden content-center ${!aslab.avatar ? 'bg-gray-100 shadow' : ''}` }>
                                                { aslab.avatar ? (
                                                    <img
                                                        src={`/storage/aslab/${aslab.avatar}`}
                                                        alt={ `aslab-avatar-${aslab.username}` }
                                                    />
                                                ) : (
                                                    <UserRound className="mx-auto" />
                                                )}
                                            </div>
                                            <div className="space-y-1 flex-1 truncate overflow-hidden">
                                                <p className="text-sm font-medium">
                                                    { aslab.nama }
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    { aslab.username }
                                                </p>
                                                <p className="!-mt-0.5 text-sm text-muted-foreground">
                                                    { aslab.jabatan }
                                                </p>
                                            </div>
                                        </div>
                                    )))
                                }
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </div>
            </PraktikanLayout>
        </>
    );
}
