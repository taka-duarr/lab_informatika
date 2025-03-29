import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, BookOpenText, Building2, ExternalLink, UserRound, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DosenLayout } from "@/layouts/DosenLayout";

export default function DosenDashboardPage({ auth, aslabs, praktikums }: PageProps<{
    aslabs: {
        id: string;
        nama: string;
        username: string;
        jabatan: string;
        avatar: string | null;
        laboratorium: {
            id: string;
            nama: string;
        };
    }[];
    praktikums: {
        id: string;
        nama: string;
        laboratorium: {
            id: string;
            nama: string;
        };
        praktikans: {
            id: string;
            nama: string;
            username: string;
            avatar: string | null;
        }[];
    }[];
    praktikans: {
        id: string;
        nama: string;
        username: string;
        avatar: string | null;
    }[];
}>) {
    return (
        <>
            <Head title="Dosen - Dashboard" />
            <DosenLayout auth={auth}>
                <div className="flex flex-col lg:flex-row gap-3 text-green-600">
                    <Card className="flex flex-col w-full lg:w-2/3 lg:min-w-[26rem] h-[31rem] lg:h-[32rem] overflow-y-auto rounded">
                        <CardHeader>
                            <CardTitle>Praktikum Aktif</CardTitle>
                            <CardDescription>
                                { praktikums.length } Praktikum aktif saat ini
                            </CardDescription>
                        </CardHeader>
                        <ScrollArea>
                            <CardContent className="grid gap-4">
                                {
                                    praktikums.length > 0 ? praktikums.map((praktikum) => ((
                                        <div key={praktikum.id} className="flex flex-col sm:flex-row gap-x-2 gap-y-4 items-center justify-between rounded-md border p-4">
                                            <div className="space-y-2 *:flex *:gap-4 *:items-center *:text-sm *:line-clamp-2">
                                                <div className="font-medium">
                                                    <BookOpenText size={20} /> { praktikum.nama }
                                                </div>
                                                <div>
                                                    <Users2 size={20} /> { praktikum.praktikans.length } Praktikan
                                                </div>
                                                <div>
                                                    <Building2 size={20} /> Laboratorium { praktikum.laboratorium.nama }
                                                </div>
                                            </div>
                                            <Button size="sm" className="!py-1 text-xs w-full sm:w-min bg-blue-600 hover:bg-blue-600/90" onClick={() => router.visit(route('dosen.praktikum.details', { id: praktikum.id }))}>
                                                <p className="block sm:hidden">Detail Praktikum</p> <ExternalLink />
                                            </Button>
                                        </div>
                                    ))) : (
                                        <div className="flex items-center space-x-4 rounded-md border p-3 truncate [&_p]:truncate">
                                            <p className="text-sm font-medium text-muted-foreground/80">
                                                Tidak ada Praktikum aktif
                                            </p>
                                        </div>
                                    )
                                }
                            </CardContent>
                        </ScrollArea>
                        <CardFooter className="mt-auto">
                            <Button className="w-full" onClick={() => router.visit(route('praktikan.kuis.index'))}>
                                Manajemen Praktikum<ArrowRight/>
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card className="flex flex-col w-full lg:w-1/3 lg:min-w-[23rem] h-[27rem] lg:h-[32rem] overflow-y-auto rounded">
                        <CardHeader>
                            <CardTitle>Jumlah Praktikan saat ini</CardTitle>
                            <CardDescription>
                                { aslabs.length } Praktikan
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
                                                        alt={ `praktikan-avatar-${aslab.username}` }
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
                                                <p className="text-sm text-muted-foreground">
                                                    { aslab.jabatan }
                                                </p>
                                                <p className="text-sm font-medium">
                                                    Lab. { aslab.laboratorium.nama }
                                                </p>
                                            </div>
                                        </div>
                                    )))
                                }
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </div>
            </DosenLayout>
        </>
    );
}
