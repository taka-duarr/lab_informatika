import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowRightIcon,
    CalendarIcon,
    ChevronRight,
    ChevronsDown,
    UserCircle2,
    UserRound,
    Crown,
    Wrench,
    Network,
    FileText,
    Wallet,
    Laptop,
} from "lucide-react";
import {
    LandingPrak,
    LandingPrak2,
    LandingPrak3,
    LandingPrak1,
    LogoJarkom,
    LogoLabInformatika,
} from "@/lib/StaticImagesLib";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { AppLayout } from "@/layouts/AppLayout";
import { PageProps } from "@/types";
import { useRef, useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { id as localdeId } from "date-fns/locale";
import Autoplay from "embla-carousel-autoplay";

export default function LandingPage({
    auth,
    laboratoriums,
    beritas,
}: PageProps<{
    laboratoriums: {
        id: string;
        nama: string;
        aslabs: {
            id: string;
            nama: string;
            username: string;
            jabatan: string;
            avatar: string | null;
        }[];
    }[];
    beritas: {
        id: string;
        judul: string;
        slug: string;
        deskripsi: string;
        updated_at: string | null;
        admin: {
            id: string;
            nama: string;
        } | null;
        laboratorium: {
            id: string;
            nama: string;
        } | null;
    }[];
}>) {
    const landingImages = [
        LandingPrak,
        LandingPrak1,
        LandingPrak2,
        LandingPrak3,
    ];
    const featuresRef = useRef<HTMLDivElement | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const jmlLandingImages = landingImages.length;
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(
                (prevIndex) => (prevIndex + 1) % jmlLandingImages
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [jmlLandingImages]);

    const PraktikumJarkom = [
        {
            title: "Sistem Operasi",
            description:
                "Praktikum semester genap yang tersedia untuk mahasiswa mulai dari semester 2",
            content:
                "Sistem operasi adalah perangkat lunak yang mengelola perangkat keras komputer dan menyediakan layanan bagi program aplikasi. Sistem operasi berfungsi sebagai perantara antara pengguna dan perangkat keras komputer, memungkinkan eksekusi program, manajemen sumber daya, pengelolaan file, serta keamanan sistem. Beberapa sistem operasi populer meliputi Windows, Linux, dan macOS. Dalam praktikum ini, mahasiswa akan belajar konsep dasar sistem operasi seperti manajemen proses, manajemen memori, sistem file, hingga keamanan sistem. Selain itu, mahasiswa juga akan melakukan simulasi penggunaan sistem operasi dalam berbagai skenario praktis.",
            // image: { LogoJarkom },
        },
        {
            title: "Jaringan Komputer",
            description:
                "Praktikum semester genap yang tersedia untuk mahasiswa mulai dari semester 4",
            content:
                "Jaringan komputer adalah kumpulan komputer yang saling terhubung untuk berbagi sumber daya, seperti file, printer, atau koneksi internet. Jaringan komputer terdiri dari berbagai topologi dan jenis jaringan, seperti LAN (Local Area Network), MAN (Metropolitan Area Network), dan WAN (Wide Area Network). Dalam praktikum ini, mahasiswa akan mempelajari dasar-dasar jaringan komputer, model OSI, TCP/IP, pengalamatan IP, subnetting, hingga konfigurasi perangkat jaringan seperti router dan switch. Mahasiswa juga akan melakukan simulasi menggunakan perangkat lunak seperti Cisco Packet Tracer untuk memahami lebih dalam konsep jaringan.",
            // image: { LogoJarkom },
        },
    ];

    return (
        <>
            <Head title="Welcome" />

            <AppLayout auth={auth}>
                <section className="relative flex items-center justify-center w-full min-h-[calc(100vh-3rem)] py-12 md:py-24 lg:py-32 xl:py-48 bg-center bg-cover overflow-hidden">
                    {landingImages.map((image, index) => (
                        <div
                            key={image}
                            className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
                            style={{
                                opacity: index === currentImageIndex ? 1 : 0,
                                zIndex: index === currentImageIndex ? -10 : -20,
                            }}
                        >
                            <img
                                src={image || "/placeholder.svg"}
                                alt={`Background ${index + 1}`}
                                className="absolute inset-0 object-cover w-full h-full"
                                loading={index === 0 ? "eager" : "lazy"}
                            />
                        </div>
                    ))}
                    <div className="absolute inset-0 bg-black/70 -z-10" />
                    <div className="relative z-10 h-full container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-zinc-100">
                                    Laboratorium Teknik Informatika ITATS
                                </h2>
                                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl font-medium">
                                    Welcome to Labinformatika ITATS, keep
                                    chilling and always Looksmaxxing
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Button
                                    className="tracking-wider"
                                    onClick={() =>
                                        featuresRef.current?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                    }
                                >
                                    LESGOO
                                    <ChevronsDown className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline">Tentang Kami</Button>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="features" className="w-full py-12 px-4 bg-muted">
                    <Card className="pt-8 pb-4" ref={featuresRef}>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
                            Praktikum
                        </h2>

                        <div className="w-full px-4 md:px-6">
                            <Carousel
                                opts={{ align: "start" }}
                                className="w-full max-w-[1320px] mx-auto"
                            >
                                <CarouselContent>
                                    {PraktikumJarkom.map((praktikum, index) => (
                                        <CarouselItem
                                            key={index}
                                            className="md:basis-full"
                                        >
                                            <div className="p-6 flex flex-col md:flex-row animate-in slide-in-from-top-5 md:slide-in-from-top-0 md:slide-in-from-left-6 fade-in-10 duration-700">
                                                <div className="content-center mx-auto lg:mx-0 w-auto md:w-80 relative order-first lg:order-none">
                                                    <img
                                                        src={LogoJarkom}
                                                        alt="logo-jarkom"
                                                        width={200}
                                                        className="rounded-lg aspect-square object-cover object-center"
                                                    />
                                                </div>
                                                <div className="w-full text-left lg:text-right">
                                                    <CardHeader className="px-0 md:px-3">
                                                        <CardTitle>
                                                            {praktikum.title}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {
                                                                praktikum.description
                                                            }
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="h-44 px-0 md:px-3">
                                                        <p className="text-left md:text-justify text-ellipsis line-clamp-6">
                                                            {praktikum.content}
                                                        </p>
                                                    </CardContent>
                                                    <CardFooter>
                                                        {/*<Button className="ml-0 md:ml-auto">*/}
                                                        {/*    Informasi*/}
                                                        {/*    Praktikum{" "}*/}
                                                        {/*    <SquareArrowOutUpRight />*/}
                                                        {/*</Button>*/}
                                                    </CardFooter>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </div>
                    </Card>
                </section>

                <section id="testimonials" className="w-full py-12 px-4">
                    <div className="w-full px-4 md:px-6">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
                            Asisten Laboratorium
                        </h2>
                        <div className="w-full mt-8">
                            {laboratoriums
                                .filter(
                                    (lab) => lab.nama === "Jaringan Komputer",
                                )
                                .map((laboratorium) => (
                                    <div
                                        key={laboratorium.id}
                                        className="mx-auto animate-in md:slide-in-from-bottom-6 fade-in-10 duration-1000 md:duration-700"
                                    >
                                        <Carousel
                                            opts={{
                                                align: "start",
                                                loop: true,
                                            }}
                                            plugins={[
                                                Autoplay({
                                                    delay: 3000,
                                                }),
                                            ]}
                                            className="w-72 md:w-full md:max-w-xl lg:max-w-4xl xl:max-w-6xl mx-auto"
                                        >
                                            <CarouselContent className="mx-auto fade-in-10 duration-50">
                                                {laboratorium.aslabs.map(
                                                    (aslab) => (
                                                        <CarouselItem
                                                            key={aslab.id}
                                                            className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 duration-200"
                                                        >
                                                            <div className="p-1">
                                                                <Card>
                                                                    <CardContent className="flex flex-col items-center p-6">
                                                                        <div className="aspect-square relative w-full mb-4 content-center">
                                                                            {aslab.avatar ? (
                                                                                <img
                                                                                    src={`/storage/aslab/${aslab.avatar}`}
                                                                                    alt={`avatar-${aslab.nama}`}
                                                                                    className="object-cover object-center rounded-md"
                                                                                />
                                                                            ) : (
                                                                                <UserCircle2
                                                                                    strokeWidth={
                                                                                        1.5
                                                                                    }
                                                                                    className="mx-auto my-auto text-primary"
                                                                                    size={
                                                                                        100
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <h3 className="h-16 font-semibold text-lg text-center mb-2 line-clamp-2 text-ellipsis">
                                                                            {
                                                                                aslab.nama
                                                                            }
                                                                        </h3>
                                                                        <p className="text-sm text-gray-600 text-center mb-4">
                                                                            {
                                                                                aslab.jabatan
                                                                            }
                                                                        </p>
                                                                        <p className="font-bold text-lg text-center">
                                                                            {
                                                                                aslab.username
                                                                            }
                                                                        </p>
                                                                        <Badge className="mt-2 font-medium text-base text-center bg-primary">
                                                                            {
                                                                                laboratorium.nama
                                                                            }
                                                                        </Badge>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        </CarouselItem>
                                                    ),
                                                )}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    </div>
                                ))}
                        </div>
                    </div>
                </section>

                <section id="struktur-organisasi" className="w-full py-20 px-4 relative overflow-hidden bg-slate-50/50">
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10"></div>
                    
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800 font-semibold mb-2">Our Team</div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600">
                                Struktur Laboratorium
                            </h2>
                            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Jajaran pengurus inti yang berdedikasi membangun dan mengembangkan ekosistem Laboratorium Informatika ITATS.
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center max-w-5xl mx-auto w-full relative">
                            {/* Kepala Laboratorium */}
                            <div className="flex flex-col items-center relative z-10 w-full group">
                                <Card className="w-full md:w-80 text-center border-blue-200/60 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-300">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-3 rounded-full shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform duration-300">
                                        <Crown size={24} />
                                    </div>
                                    <CardHeader className="pt-10 pb-2">
                                        <CardTitle className="text-sm font-semibold tracking-wider text-blue-600 uppercase">Kepala Laboratorium</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-6">
                                        <p className="font-bold text-lg text-slate-800">Danang Haryo Sulaksono, S.ST., M.T.</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Connecting Line Level 1 */}
                            <div className="h-10 w-0.5 bg-gradient-to-b from-blue-300 to-slate-300"></div>

                            {/* Laboran */}
                            <div className="flex flex-col items-center relative z-10 w-full group">
                                <Card className="w-full md:w-72 text-center border-slate-200/80 shadow-md bg-white/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300">
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-700 text-white p-2.5 rounded-full shadow-md group-hover:bg-blue-600 transition-colors duration-300">
                                        <Wrench size={20} />
                                    </div>
                                    <CardHeader className="pt-8 pb-2">
                                        <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Laboran</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <p className="font-bold text-base text-slate-800">Latiful Sirri, S.kom</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Connecting Line Level 2 */}
                            <div className="h-10 w-0.5 bg-slate-300"></div>

                            {/* Koordinator */}
                            <div className="flex flex-col items-center relative z-10 w-full group">
                                <Card className="w-full md:w-72 text-center border-slate-200/80 shadow-md bg-white/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300">
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-700 text-white p-2.5 rounded-full shadow-md group-hover:bg-blue-600 transition-colors duration-300">
                                        <Network size={20} />
                                    </div>
                                    <CardHeader className="pt-8 pb-2">
                                        <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Koordinator</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <p className="font-bold text-base text-slate-800 leading-tight">Afzal Musyaffa Lathif Ashrafil Adam</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Connecting Line Level 3 (Branching) */}
                            <div className="flex flex-col items-center w-full relative">
                                <div className="h-8 w-0.5 bg-slate-300"></div>
                                <div className="w-[calc(100%-2rem)] md:w-[600px] border-t-2 border-slate-300"></div>
                                <div className="flex justify-between w-[calc(100%-2rem)] md:w-[600px]">
                                    <div className="h-8 w-0.5 bg-slate-300"></div>
                                    <div className="h-8 w-0.5 bg-slate-300"></div>
                                    <div className="h-8 w-0.5 bg-slate-300"></div>
                                </div>
                            </div>

                            {/* Sekretaris, Bendahara, Admin Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-4xl px-4 md:px-0">
                                {/* Sekretaris */}
                                <Card className="w-full text-center border-slate-200/80 shadow-md bg-white/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 group mt-4 md:mt-0 relative">
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-600 text-white p-2.5 rounded-full shadow-sm group-hover:bg-blue-500 transition-colors duration-300">
                                        <FileText size={18} />
                                    </div>
                                    <CardHeader className="pt-8 pb-1">
                                        <CardTitle className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Sekretaris</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <p className="font-semibold text-slate-800">Firman Ardiansyah</p>
                                    </CardContent>
                                </Card>

                                {/* Bendahara */}
                                <Card className="w-full text-center border-slate-200/80 shadow-md bg-white/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 group mt-4 md:mt-0 relative">
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-600 text-white p-2.5 rounded-full shadow-sm group-hover:bg-blue-500 transition-colors duration-300">
                                        <Wallet size={18} />
                                    </div>
                                    <CardHeader className="pt-8 pb-1">
                                        <CardTitle className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Bendahara</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <p className="font-semibold text-slate-800">Madadina Adilah Pamuji</p>
                                    </CardContent>
                                </Card>

                                {/* Admin */}
                                <Card className="w-full text-center border-slate-200/80 shadow-md bg-white/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 group mt-4 md:mt-0 relative">
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-600 text-white p-2.5 rounded-full shadow-sm group-hover:bg-blue-500 transition-colors duration-300">
                                        <Laptop size={18} />
                                    </div>
                                    <CardHeader className="pt-8 pb-1">
                                        <CardTitle className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Admin</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <p className="font-semibold text-slate-800">Marikh Kasiful izzat</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="news" className="w-full py-12 px-4 bg-muted">
                    <Card className="pt-8 pb-4 px-0">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
                            Berita terbaru
                        </h2>
                        <div className="mx-auto !px-6">
                            <ScrollArea className="w-full rounded-md">
                                <div className="flex w-max space-x-4 py-4 px-2 mx-auto">
                                    {beritas.length > 0 ? (
                                        beritas.map((berita) => (
                                            <Card
                                                key={berita.id}
                                                className="w-[19.5rem] md:w-96 h-72 flex-shrink-0 rounded-sm shadow"
                                            >
                                                <CardHeader>
                                                    <CardTitle className="line-clamp-2 text-ellipsis">
                                                        {berita.judul}
                                                    </CardTitle>
                                                    <CardDescription className="space-y-0.5 *:flex *:items-center *:gap-0.5 text-sm">
                                                        <div>
                                                            <CalendarIcon
                                                                size={16}
                                                            />
                                                            {berita.updated_at
                                                                ? format(
                                                                      new Date(
                                                                          berita.updated_at,
                                                                      ),
                                                                      "PPPp",
                                                                      {
                                                                          locale: localdeId,
                                                                      },
                                                                  )
                                                                : ""}
                                                        </div>
                                                        <div>
                                                            <UserRound
                                                                size={16}
                                                            />
                                                            {berita.admin
                                                                ?.nama ?? ""}
                                                        </div>
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="min-h-24">
                                                    <p className="line-clamp-3 text-ellipsis">
                                                        {berita.deskripsi}
                                                    </p>
                                                </CardContent>
                                                <CardFooter className="px-4 items-end">
                                                    <Button
                                                        variant="ghost"
                                                        className="ml-auto w-min justify-between"
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "berita.show",
                                                                    {
                                                                        slug: berita.slug,
                                                                    },
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Baca selengkapnya{" "}
                                                        <ArrowRightIcon className="h-4 w-4" />
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))
                                    ) : (
                                        <p className="text-center mx-auto">
                                            Belum ada berita
                                        </p>
                                    )}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                        <CardFooter className="mt-3">
                            <Button
                                asChild={beritas.length > 0}
                                variant="outline"
                                disabled={beritas.length < 1}
                                className="ml-auto"
                            >
                                {beritas.length > 0 ? (
                                    <Link
                                        href={route("berita.index")}
                                        className="!ml-auto gap-1"
                                    >
                                        Lihat semua berita{" "}
                                        <ChevronRight size={16} />
                                    </Link>
                                ) : (
                                    <div className="!ml-auto flex gap-1">
                                        Lihat semua berita{" "}
                                        <ChevronRight size={16} />
                                    </div>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </section>
            </AppLayout>
        </>
    );
}
