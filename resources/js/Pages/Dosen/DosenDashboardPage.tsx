import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ArrowRight,
    BookOpenText,
    Building2,
    ExternalLink,
    UserRound,
    Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DosenLayout } from "@/layouts/DosenLayout";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

export default function DosenDashboardPage({
    auth,
    aslabs,
    praktikums,
}: PageProps<{
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
    const chartDataPraktikum = [
        {
            praktikum: "Sistem Operasi XXXVI",
            terverifikasi: 97,
            lulus: 90,
            gugur: 7,
        },
        {
            praktikum: "Jaringan Komputer XXXVI",
            terverifikasi: 85,
            lulus: 83,
            gugur: 2,
        },
        {
            praktikum: "Sistem Operasi XXXVII",
            terverifikasi: 106,
            lulus: 85,
            gugur: 21,
        },
        {
            praktikum: "Jaringan Komputer XXXVII",
            terverifikasi: 96,
            lulus: 93,
            gugur: 3,
        },
        {
            praktikum: "Sistem Operasi XXXVIII",
            terverifikasi: 88,
            lulus: 80,
            gugur: 8,
        },
        {
            praktikum: "Jaringan Komputer XXXVIII",
            terverifikasi: 0,
            lulus: 0,
            gugur: 0,
        },
    ];

    const chartConfig = {
        terverifikasi: {
            label: "Terverifikasi",
            color: "#2563eb",
        },
        lulus: {
            label: "Lulus",
            color: "#02df50",
        },
        gugur: {
            label: "Gugur",
            color: "#f87171",
        },
    } satisfies ChartConfig;
    return (
        <>
            <Head title="Dosen - Dashboard" />
            <DosenLayout auth={auth}>
                <div className="flex flex-col lg:flex-row gap-3 text-green-600">
                    <Card className="flex flex-col w-full lg:w-2/3 lg:min-w-[26rem] h-[31rem] lg:h-[32rem] overflow-y-auto rounded">
                        <CardHeader>
                            <CardTitle>Praktikum Aktif</CardTitle>
                            <CardDescription>
                                {praktikums.length} Praktikum aktif saat ini
                            </CardDescription>
                        </CardHeader>
                        <ScrollArea>
                            <CardContent className="grid gap-4">
                                {praktikums.length > 0 ? (
                                    praktikums.map((praktikum) => (
                                        <div
                                            key={praktikum.id}
                                            className="flex flex-col sm:flex-row gap-x-2 gap-y-4 items-center justify-between rounded-md border p-4"
                                        >
                                            <div className="space-y-2 *:flex *:gap-4 *:items-center *:text-sm *:line-clamp-2">
                                                <div className="font-medium">
                                                    <BookOpenText size={20} />{" "}
                                                    {praktikum.nama}
                                                </div>
                                                <div>
                                                    <Users2 size={20} />{" "}
                                                    {
                                                        praktikum.praktikans
                                                            .length
                                                    }{" "}
                                                    Praktikan
                                                </div>
                                                <div>
                                                    <Building2 size={20} />{" "}
                                                    Laboratorium{" "}
                                                    {
                                                        praktikum.laboratorium
                                                            .nama
                                                    }
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="!py-1 text-xs w-full sm:w-min bg-blue-600 hover:bg-blue-600/90"
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            "dosen.praktikum.details",
                                                            { id: praktikum.id }
                                                        )
                                                    )
                                                }
                                            >
                                                <p className="block sm:hidden">
                                                    Detail Praktikum
                                                </p>{" "}
                                                <ExternalLink />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center space-x-4 rounded-md border p-3 truncate [&_p]:truncate">
                                        <p className="text-sm font-medium text-muted-foreground/80">
                                            Tidak ada Praktikum aktif
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </ScrollArea>
                        <CardFooter className="mt-auto">
                            <Button
                                className="w-full"
                                onClick={() =>
                                    router.visit(route("dosen.praktikum.index"))
                                }
                            >
                                Manajemen Praktikum
                                <ArrowRight />
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card className="flex flex-col w-full lg:w-1/3 lg:min-w-[23rem] h-[27rem] lg:h-[32rem] overflow-y-auto rounded">
                        <CardHeader>
                            <CardTitle>Aslab Aktif Saat Ini</CardTitle>
                            <CardDescription>
                                {aslabs.length} Asisten Laboratorium
                            </CardDescription>
                        </CardHeader>
                        <ScrollArea>
                            <CardContent className="grid gap-4">
                                {aslabs.map((aslab, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-4 rounded-md border p-4 truncate [&_p]:truncate"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full overflow-hidden content-center ${
                                                !aslab.avatar
                                                    ? "bg-gray-100 shadow"
                                                    : ""
                                            }`}
                                        >
                                            {aslab.avatar ? (
                                                <img
                                                    src={`/storage/aslab/${aslab.avatar}`}
                                                    alt={`praktikan-avatar-${aslab.username}`}
                                                />
                                            ) : (
                                                <UserRound className="mx-auto" />
                                            )}
                                        </div>
                                        <div className="space-y-1 flex-1 truncate overflow-hidden">
                                            <p className="text-sm font-medium">
                                                {aslab.nama}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {aslab.username}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {aslab.jabatan}
                                            </p>
                                            <p className="text-sm font-medium">
                                                Lab. {aslab.laboratorium.nama}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </div>
                <div className="w-full flex flex-col lg:flex-row gap-3">
                    <Card className="p-3 content-center w-full lg:w-2/3 lg:min-w-[26rem] min-h-80 lg:min-h-[30rem] rounded">
                        <ScrollArea>
                            <CardHeader>
                                <CardTitle>
                                    Statistik Praktikum terbaru
                                </CardTitle>
                                <CardDescription>
                                    Data kelulusan {chartDataPraktikum.length}{" "}
                                    praktikum terbaru
                                </CardDescription>
                            </CardHeader>
                            <ChartContainer
                                config={chartConfig}
                                className="min-h-[200px] w-80 md:w-[38rem] md:min-w-96 lg:w-[38rem] mx-auto"
                            >
                                <BarChart
                                    accessibilityLayer
                                    data={chartDataPraktikum}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="praktikum"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => {
                                            const words = value.split(" ");
                                            const initials =
                                                words[0][0] + words[1][0];
                                            return `${initials}-${
                                                words.slice(-1)[0]
                                            }`;
                                        }}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Bar
                                        dataKey="terverifikasi"
                                        fill="var(--color-terverifikasi)"
                                        radius={4}
                                    />
                                    <Bar
                                        dataKey="lulus"
                                        fill="var(--color-lulus)"
                                        radius={4}
                                    />
                                    <Bar
                                        dataKey="gugur"
                                        fill="var(--color-gugur)"
                                        radius={4}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </ScrollArea>
                    </Card>
                    {/* <Card className="flex flex-col w-full lg:w-1/3 lg:min-w-[23rem] h-[30rem] overflow-y-auto rounded">
                        <ScrollArea>
                            <CardHeader>
                                <CardTitle>
                                    Aslab Aktif (SARAN KONTEN?)
                                </CardTitle>
                                <CardDescription>
                                    {aslabs.length} Aslab aktif saat ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {aslabs.map((aslab, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-4 rounded-md border p-4 truncate [&_p]:truncate"
                                    >
                                        <div className="h-7">
                                            <img
                                                src={
                                                    aslab.avatar
                                                        ? `/storage/aslab/${aslab.avatar}`
                                                        : ""
                                                }
                                                alt="profile"
                                                width={30}
                                            />
                                        </div>
                                        <div className="space-y-1 flex-1 truncate overflow-hidden">
                                            <p className="text-sm font-medium leading-none">
                                                {aslab.nama}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {aslab.username}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button className="w-full">
                                    Manajemen Aslab <ArrowRight />
                                </Button>
                            </CardFooter>
                        </ScrollArea>
                    </Card> */}
                </div>
            </DosenLayout>
        </>
    );
}
