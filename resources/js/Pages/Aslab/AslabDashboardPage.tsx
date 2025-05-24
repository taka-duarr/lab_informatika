import { Head, router } from "@inertiajs/react";
import { AslabLayout } from "@/layouts/AslabLayout";
import { PageProps } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, BookOpenText, Building2, UserRound, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AslabDashboardPage({ auth, praktikans, praktikums }: PageProps<{
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
    console.log(praktikums)
    return (
        <>
            <Head title="Aslab - Dashboard" />
            <AslabLayout auth={auth}>
                <div className="flex flex-col lg:flex-row gap-3 text-green-600">
                    <Card className="flex flex-col w-full lg:w-2/3 lg:min-w-[26rem] h-[27rem] lg:h-[32rem] overflow-y-auto rounded">
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
                                        <div key={praktikum.id} className="space-y-2 rounded-md border p-4 *:flex *:gap-4 *:items-center *:text-sm *:line-clamp-2">
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
                                { praktikans.length } Praktikan
                            </CardDescription>
                        </CardHeader>
                        <ScrollArea>
                            <CardContent className="grid gap-4">
                                {
                                    praktikans.map((praktikan, index) => ((
                                        <div key={ index } className="flex items-center space-x-4 rounded-md border p-4 truncate [&_p]:truncate">
                                            <div className={ `w-8 h-8 rounded-full overflow-hidden content-center ${!praktikan.avatar ? 'bg-gray-100 shadow' : ''}` }>
                                                { praktikan.avatar ? (
                                                    <img
                                                        src={`/storage/praktikan/${praktikan.avatar}`}
                                                        alt={ `praktikan-avatar-${praktikan.username}` }
                                                    />
                                                ) : (
                                                    <UserRound className="mx-auto" />
                                                )}
                                            </div>
                                            <div className="space-y-1 flex-1 truncate overflow-hidden">
                                                <p className="text-sm font-medium">
                                                    { praktikan.nama }
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    { praktikan.username }
                                                </p>
                                            </div>
                                        </div>
                                    )))
                                }
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </div>
            </AslabLayout>
        </>
    );
}
