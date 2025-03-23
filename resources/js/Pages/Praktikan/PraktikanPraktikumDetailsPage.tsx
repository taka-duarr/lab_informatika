import { PraktikanLayout } from "@/layouts/PraktikanLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getValidWangsaff, parseSesiTime } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Clock,UserRound, Users2 } from "lucide-react";
import DataTable from "@/components/data-table";

type Praktikan = {
    id: string;
    nama: string;
    username: string;
};
type Praktikum = {
    id: string;
    nama: string;
    status: boolean;
    aslab: {
        id: string;
        nama: string;
        username: string;
        no_hp: string | null;
    } | null;
    dosen: {
        id: string;
        nama: string;
        username: string;
    } | null;
    sesi: {
        id: string;
        nama: string;
        hari: string;
        waktu_mulai: string;
        waktu_selesai: string;
    } | null;
    praktikans: Praktikan[];
}
export default function PraktikanPraktikumDetailsPage({ auth, praktikum }: PageProps<{
    praktikum: Praktikum;
}>) {
    console.log(praktikum);
    const columns: ColumnDef<Praktikan>[] = [
        {
            accessorKey: "username",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-full justify-start items-start"
                    >
                        NPM
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase w-16 ml-4">{row.getValue("username")}</div>,
        },
        {
            accessorKey: "nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="w-full justify-start "
                    >
                        Nama
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return (
                    <>
                        <div className="capitalize min-w-52 ml-2 flex items-center gap-2">
                            <p className="line-clamp-2">{row.getValue("nama")}</p>
                        </div>
                    </>
                )
            },
        },
    ];

    return (
        <>
            <Head title="Praktikan - Details" />
            <PraktikanLayout auth={auth}>
                <CardTitle className="text-lg">
                    Praktikum { praktikum.nama }
                </CardTitle>
                <div className="flex flex-row flex-wrap gap-x-2 gap-y-2.5 *:flex-1 *:bg-muted">
                    <div className="py-3 px-5 grid gap-1 text-sm min-w-96 min-h-24 rounded-md">
                        <h6 className="font-medium text-base">Asisten Laboratorium</h6>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-muted-foreground/15 content-center rounded-full">
                                <UserRound width={18} strokeWidth={2.2} className="mx-auto" />
                            </div>
                            { praktikum.aslab ? (
                                <div className="grid gap-0.5">
                                    <div className="flex gap-2">
                                        { praktikum.aslab.nama }
                                        { (praktikum.aslab && praktikum.status && getValidWangsaff(praktikum.aslab.no_hp ?? '')) && (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={100}>
                                                    <TooltipTrigger
                                                        className="group"
                                                        onClick={() => {
                                                            const nomor = getValidWangsaff(praktikum.aslab?.no_hp ?? '');
                                                            if (nomor) {
                                                                window.open(`https://wa.me/${nomor}`, '_blank');
                                                            }
                                                        }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" className="text-gray-700 group-hover:text-green-600">
                                                            <path fill="currentColor" d="M8 0a8 8 0 1 1-4.075 14.886L.658 15.974a.5.5 0 0 1-.632-.632l1.089-3.266A8 8 0 0 1 8 0M5.214 4.004a.7.7 0 0 0-.526.266C4.508 4.481 4 4.995 4 6.037c0 1.044.705 2.054.804 2.196c.098.138 1.388 2.28 3.363 3.2q.55.255 1.12.446c.472.16.902.139 1.242.085c.379-.06 1.164-.513 1.329-1.01c.163-.493.163-.918.113-1.007c-.049-.088-.18-.142-.378-.25c-.196-.105-1.165-.618-1.345-.687c-.18-.073-.312-.106-.443.105c-.132.213-.507.691-.623.832c-.113.139-.23.159-.425.053c-.198-.105-.831-.33-1.584-1.054c-.585-.561-.98-1.258-1.094-1.469c-.116-.213-.013-.326.085-.433c.09-.094.198-.246.296-.371c.097-.122.132-.21.198-.353c.064-.141.031-.266-.018-.371s-.443-1.152-.607-1.577c-.16-.413-.323-.355-.443-.363c-.114-.005-.245-.005-.376-.005"></path>
                                                        </svg>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Wangsaff kan</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <p>
                                        { praktikum.aslab.username }
                                    </p>
                                </div>
                            ) : (
                                <p className="italic text-muted-foreground font-medium">Belum ada Asisten Lab.</p>
                            )}
                        </div>
                    </div>
                    <div className="py-3 px-5 grid gap-1 text-sm min-w-96 min-h-24 rounded-md">
                        <h6 className="font-medium text-base">Dosen Pembimbing</h6>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-muted-foreground/15 content-center rounded-full">
                                <UserRound width={18} strokeWidth={2.2} className="mx-auto" />
                            </div>
                            { praktikum.dosen ? (
                                <div className="grid gap-0.5">
                                    <p>
                                        { praktikum.dosen.nama }
                                    </p>
                                    <p>
                                        { praktikum.dosen.username }
                                    </p>
                                </div>
                            ) : (
                                <p className="italic text-muted-foreground font-medium">Belum ada dosen pembimbing</p>
                            )}
                        </div>
                    </div>
                    <div className="py-3 px-5 grid gap-1 text-sm min-w-96 min-h-24 rounded-md">
                        <h6 className="font-medium text-base">Sesi Praktikum</h6>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-muted-foreground/15 content-center rounded-full">
                                <Clock width={18} strokeWidth={2.2} className="mx-auto" />
                            </div>
                            { praktikum.sesi ? (
                                <div className="grid gap-0.5">
                                    <p>
                                        { praktikum.sesi.nama }
                                    </p>
                                    <p>
                                        { praktikum.sesi.hari }, Pukul {parseSesiTime(praktikum.sesi.waktu_mulai, new Date())} - {parseSesiTime(praktikum.sesi.waktu_selesai, new Date())}
                                    </p>
                                </div>
                            ) : (
                                <p className="italic text-muted-foreground font-medium">Belum terdaftar pada sesi Praktikum</p>
                            )}
                        </div>
                    </div>
                    <div className="py-3 px-5 grid gap-1 text-sm min-w-96 min-h-24 rounded-md">
                        <h6 className="font-medium text-base">Praktikan dalam Sesi yang sama</h6>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-muted-foreground/15 content-center rounded-full">
                                <Users2 width={18} strokeWidth={2.2} className="mx-auto" />
                            </div>
                            <p>{ praktikum.praktikans.length } Praktikan</p>
                        </div>
                    </div>
                </div>
                <Separator className="!my-6 bg-primary/20" />
                <CardTitle>
                    Daftar Praktikan dalam Sesi yang sama
                </CardTitle>
                <DataTable
                    columns={columns}
                    data={praktikum.praktikans}
                    withNumber={true}
                    showViewPerPage={false}
                />
            </PraktikanLayout>
        </>
    );
}
