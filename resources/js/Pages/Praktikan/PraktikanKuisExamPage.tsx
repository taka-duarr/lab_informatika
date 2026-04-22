import { Card } from "@/components/ui/card";
import { AnswersRender } from "@/components/answers-render";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
    ArrowBigLeft,
    ArrowBigRight,
    CircleAlert,
    CircleCheck,
    CornerDownLeft,
    LayoutGrid,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { deltaParse, RenderQuillDelta } from "@/components/delta-parse";
import axios, { AxiosError } from "axios";
import { PageProps } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { v4 as uuid } from "uuid";
import CountdownTimer from "@/components/countdown-timer";
import ErrorPage from "@/Pages/ErrorPage";
import { OverlayLoader } from "@/components/overlay-loader";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { router } from "@inertiajs/react";

type AnswerOption = {
    value: string;
    label: string;
};

type NavigationState = {
    currentIndex: number;
    answers: { [id: string]: string };
};

type JawabansProps = {
    id: string;
    soal_id: string;
    jawaban: string;
}

export default function PraktikanKuisExamPage({ auth, serverTime, soals, jawabans, kuis_praktikan }: PageProps<{
    serverTime: string;
    soals: {
        id: string;
        pertanyaan: string;
        pilihan_jawaban: string;
    }[];
    jawabans: JawabansProps[];
    kuis_praktikan: {
        id: string;
        is_overdue: boolean;
        waktu_mulai: string;
        waktu_selesai: string;
    };
}>) {
    const QUIZ_AWAY_TOLERANCE = 3;
    const awayStorageKey = (suffix: string) =>
        `kuis:${kuis_praktikan.id}:${suffix}`;

    const { toast } = useToast();
    const authUser = auth.user;
    if (!authUser) {
        return (
            <ErrorPage status={401} />
        )
    }
    const submitJawabanInit = {
        onSubmit: false,
        onError: false,
        onSuccess: false,
    };
    const submitEndInit = {
        onSubmit: kuis_praktikan.is_overdue,
        onError: false,
        onSuccess: false,
        message: '',
        subMessage: ''
    };
    const [ submitJawaban, setSubmitJawaban ] = useState<{
        onSubmit: boolean;
        onError: boolean;
        onSuccess: boolean;
    }>(submitJawabanInit);
    const [ openSubmitEnd, setOpenSubmitEnd ] = useState<boolean>(false);
    const [ showAwayAlert, setShowAwayAlert ] = useState<boolean>(false);
    const [ awayAlertCount, setAwayAlertCount ] = useState<number>(0);
    const [ submitEnd, setSubmitEnd ] = useState<{
        onSubmit: boolean;
        onError: boolean;
        onSuccess: boolean;
        message: string;
        subMessage: string;
    }>(submitEndInit);
    const submitEndRef = useRef(submitEnd);

    useEffect(() => {
        submitEndRef.current = submitEnd;
    }, [submitEnd]);

    const handleSubmitEndKuis = () => {
        if (submitEndRef.current.onSubmit) {
            return;
        }

        setSubmitEnd({
            ...submitEndInit,
            onSubmit: true,
            message: 'Menghitung Nilai Kuis',
            subMessage: 'Menunggu Respon Server...'
        });

        axios.post<{
            message: string;
            skor: number;
        }>(route('kuis-praktikan.submit-end'), {
            kuis_praktikan_id: kuis_praktikan.id,
            praktikan_id: authUser.id
        })
            .then(() => {
                localStorage.removeItem(awayStorageKey("started"));
                localStorage.removeItem(awayStorageKey("away-count"));
                localStorage.removeItem(awayStorageKey("away-last"));
                router.visit(route('praktikan.kuis.result', { id: kuis_praktikan.id }));
            })
            .catch((err: unknown) => {
                const errMsg: string = err instanceof AxiosError && err.response?.data?.message
                    ? err.response.data.message
                    : 'Error tidak diketahui terjadi!';
                setSubmitEnd({
                    ...submitEndInit,
                    onError: true,
                    message: errMsg,
                    subMessage: 'Mohon Coba lagi..',
                });
            })

    };

    const DataSoal = useMemo(() => {
        const baseUUID = auth.user?.id ?? uuid();
        const char1 = baseUUID.charCodeAt(6) % 16;
        const char2 = baseUUID.charCodeAt(10) % 16;
        const char3 = baseUUID.charCodeAt(14) % 2;

        let shuffledSoal = [...soals];

        for (let i = 0; i < char1; i++) {
            shuffledSoal.push(shuffledSoal.shift()!);
        }

        for (let i = 0; i < char2; i++) {
            shuffledSoal.unshift(shuffledSoal.pop()!);
        }

        if (char3 === 1) {
            shuffledSoal.reverse();
        }

        return shuffledSoal.map((soal) => ({
            id: soal.id,
            pertanyaan: deltaParse(soal.pertanyaan),
            pilihan_jawaban: JSON.parse(soal.pilihan_jawaban) as AnswerOption[],
        }));
    }, [soals, auth.user?.id]);

    const navigationInit = {
        currentIndex: 0,
        answers: jawabans.reduce((acc, jawaban) => {
            acc[jawaban.soal_id] = jawaban.jawaban;
            return acc;
        }, {} as Record<string, string>),
    };

    const [navigation, setNavigation] = useState<NavigationState>(navigationInit);

    const handleChangeNavigation = useCallback((direction: "forward" | "backward" | "custom", index?: number) => {
        setSubmitJawaban(submitJawabanInit);
        setNavigation((prevState) => {
            const newIndex = (() => {
                if (direction === "forward") return (prevState.currentIndex + 1) % DataSoal.length;
                if (direction === "backward") return (prevState.currentIndex - 1 + DataSoal.length) % DataSoal.length;
                if (direction === "custom" && index !== undefined) return Math.max(0, Math.min(index, DataSoal.length - 1));
                return prevState.currentIndex;
            })();

            return { ...prevState, currentIndex: newIndex };
        });
    }, [DataSoal.length]);

    const handlePilihJawaban = useCallback((id: string, value: string) => {
        const prevAnswers = navigation.answers;
        setNavigation((prevState) => {
            return {
                ...prevState,
                answers: { ...prevState.answers, [id]: value },
            };
        });

        setSubmitJawaban(() => ({
            ...submitJawabanInit,
            onSubmit: true
        }));

        axios.post<{
            message: string;
        }>(route('jawaban-kuis.upsert'), {
            soal_id: id,
            jawaban: value,
            kuis_praktikan_id: kuis_praktikan.id,
        })
            .then(() => {
                setSubmitJawaban({
                    ...submitJawabanInit,
                    onSuccess: true
                });
            })
            .catch((err: unknown) => {
                const errMsg: string = err instanceof AxiosError && err.response?.data?.message
                    ? err.response.data.message
                    : 'Error tidak diketahui terjadi!';

                setNavigation((prevState) => {
                    return { ...prevState,
                        answers: prevAnswers
                    };
                });

                setSubmitJawaban({
                    ...submitJawabanInit,
                    onError: true
                });

                toast({
                    variant: "destructive",
                    title: "Gagal menyimpan Jawaban!",
                    description: errMsg,
                });
            });
    }, []);

    const AnswerOptions = useMemo(() => {
        const currentSoal = DataSoal[navigation.currentIndex];
        const selectedAnswer = navigation.answers[currentSoal.id] || "";

        return (
            <AnswersRender
                options={currentSoal.pilihan_jawaban}
                selectedAnswer={selectedAnswer}
                onSelect={(value) => handlePilihJawaban(currentSoal.id, value)}
            />
        );
    }, [DataSoal, navigation]);

    const [ sideSoalShow, setSideSoalShow ] = useState<boolean>(false);
    const [ sideJawabanShow, setSideJawabanShow ] = useState<boolean>(false);
    const sideSoalRef = useRef<HTMLElement | null>(null);
    const sideJawabanRef = useRef<HTMLElement | null>(null);

    const handleShowSideEl = (type: 'soal' | 'jawaban') => {
        switch (type) {
            case "soal": {
                setSideSoalShow((prevState) => !prevState);
                setSideJawabanShow(false);
            } break;
            case "jawaban": {
                setSideJawabanShow((prevState) => !prevState);
                setSideSoalShow(false);
            } break;
        }
    };

    const styleBtnNomorColor = (index: number, soal_id: string): string => {
        if (Object.keys(navigation.answers).includes(soal_id)) {
            return `${navigation.currentIndex === index ? 'border-4 border-primary/70' : ''} bg-green-500 hover:bg-green-500/90 text-zinc-50 hover:text-zinc-50`
        } else if (navigation.currentIndex === index) {
            return 'bg-primary hover:bg-primary/90 text-zinc-100 hover:text-zinc-100';
        } else {
            return 'bg-none text-primary'
        }
    };
    useEffect(() => {
        const handleClick = (event: MouseEvent | TouchEvent) => {
            if (sideSoalRef.current && sideJawabanRef.current && event.target) {
                if (sideSoalShow && !sideSoalRef.current.contains(event.target as Node)) {
                    setSideSoalShow(false);
                } else if (sideJawabanShow && !sideJawabanRef.current.contains(event.target as Node)) {
                    setSideJawabanShow(false);
                }
            }
        };

        window.addEventListener('mouseup', handleClick);

        return () => window.removeEventListener('mouseup', handleClick);
    }, []);

    useEffect(() => {
        if (kuis_praktikan.is_overdue && !submitEnd.onSubmit) {
            setSubmitEnd((prev) => ({ ...prev, onSubmit: true }));
        }
    }, [kuis_praktikan.is_overdue]);

    useEffect(() => {
        const alertCount = Number(localStorage.getItem(awayStorageKey("away-count"))) || 0;
        setAwayAlertCount(alertCount);

        if (QUIZ_AWAY_TOLERANCE < 1 || kuis_praktikan.is_overdue) {
            return;
        }

        localStorage.setItem(awayStorageKey("started"), "true");

        const handleUserAway = () => {
            if (submitEndRef.current.onSubmit) {
                return;
            }

            const hasStarted = localStorage.getItem(awayStorageKey("started"));
            if (!hasStarted) {
                return;
            }

            const now = Date.now();
            const lastAway =
                Number(localStorage.getItem(awayStorageKey("away-last"))) || 0;

            if (now - lastAway < 2000) {
                return;
            }

            localStorage.setItem(awayStorageKey("away-last"), now.toString());

            const currentCount =
                Number(localStorage.getItem(awayStorageKey("away-count"))) || 0;
            const newCount = currentCount + 1;

            localStorage.setItem(awayStorageKey("away-count"), newCount.toString());
            setAwayAlertCount(newCount);

            if (newCount >= QUIZ_AWAY_TOLERANCE) {
                setShowAwayAlert(false);
                handleSubmitEndKuis();
                return;
            }

            setShowAwayAlert(true);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleUserAway();
            }
        };

        window.addEventListener("blur", handleUserAway);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("blur", handleUserAway);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [kuis_praktikan.id, kuis_praktikan.is_overdue]);

    return (
        <>
            { submitEnd.onSubmit && (
                <OverlayLoader
                    textContent={submitEnd.message}
                    subTextContent={submitEnd.subMessage}
                    withLoader={!submitEnd.onError}
                >
                    {submitEnd.onError && (
                        <Button className="mx-auto bg-blue-700 hover:bg-blue-700/85" onClick={() => router.visit(route('praktikan.kuis.index'))}>
                            Kembali ke myKuis <CornerDownLeft />
                        </Button>
                    )}
                </OverlayLoader>
            )}
            <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-screen bg-zinc-100 py-6 px-3">
                <aside data-show={ sideSoalShow } ref={ sideSoalRef } className="z-10 fixed -translate-x-full p-3 data-[show=true]:translate-x-0 lg:translate-x-0 left-0 lg:static w-2/3 sm:w-80 lg:w-72 top-0 bottom-0 flex flex-col gap-4 overflow-visible lg:overflow-hidden transition-all ease-in-out duration-200 my-card bg-white">
                    <CountdownTimer
                        startTime={serverTime}
                        endTime={kuis_praktikan.waktu_selesai}
                        onTimeUp={handleSubmitEndKuis}
                    />
                    <button
                        className={ `fixed lg:hidden top-1/2 -translate-y-1/2 p-2 flex -right-11 items-end bg-zinc-600/40 rounded *:font-semibold *:font-sans` }
                        onClick={ () => handleShowSideEl('soal') }>
                        <LayoutGrid width={ 35 }/>
                    </button>
                    <ScrollArea>
                        <Card className="h-full overflow-y-auto p-4 shadow-[5px_5px_14px_0_rgba(31,45,61,0.10)] rounded border-[1px] border-zinc-200">
                            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 items-start content-start justify-start gap-2 overflow-y-auto">
                                { DataSoal.map((soal, index) => ((
                                    <Button key={index} variant="outline" onClick={ () => handleChangeNavigation('custom', index) } className={ `w-8 sm:w-10 md:w-10 lg:w-12 h-8 sm:h-10 md:h-10 lg:h-12 ${styleBtnNomorColor(index, soal.id)} !animate-none !transition-none !duration-0` }>
                                        { index + 1 }
                                    </Button>
                                ))) }
                            </div>
                        </Card>
                    </ScrollArea>
                    <div className="w-full px-3">
                        <Button onClick={() => setOpenSubmitEnd(true)} className="w-full h-12 md:h-14 rounded text-white text-lg font-semibold tracking-wider bg-green-600 hover:bg-green-600/80">
                            SELESAI
                        </Button>
                    </div>
                </aside>
                <main className="flex-1 h-full flex flex-col my-card bg-white min-h-[26rem] lg:min-h-0">
                    <header className="my-4 mx-3 flex flex-row justify-between font-medium text-muted-foreground/70 ">
                        <h6 className="text-base indent-2">
                            Soal { navigation.currentIndex + 1 } dari { DataSoal.length }
                        </h6>
                        <div className="w-36 flex flex-row gap-1 items-center text-xs font-medium">
                            { submitJawaban.onSubmit
                                ? (
                                    <>
                                        <Loader2 width={ 18 } className="text-blue-500 animate-spin" />
                                        <p className="text-blue-500">Sedang Menyimpan...</p>
                                    </>
                                ) : submitJawaban.onSuccess
                                    ? (
                                        <>
                                            <CircleCheck width={ 18 } className="text-green-600" />
                                            <p className="text-green-600">Berhasil menyimpan</p>
                                        </>
                                    ) : submitJawaban.onError
                                        ? (
                                            <>
                                                <CircleAlert width={ 18 } className="text-red-600" />
                                                <p className="text-red-600">Gagal Menyimpan..</p>
                                            </>
                                        ) : (
                                            <></>
                                        )
                            }
                        </div>
                    </header>
                    <Separator className="my-3 bg-muted-foreground/70 h-0.5"/>
                    <div className="flex-1 py-1.5 px-3.5 overflow-y-auto">
                        <Card className="my-card !border-[1.5px] w-full sm:h-80 lg:h-[60vh] 2xl:h-[70vh] min-h-72 py-2 overflow-y-auto transition-width ease-in-out duration-200">
                            <RenderQuillDelta
                                delta={ DataSoal[navigation.currentIndex].pertanyaan }
                                className="!items-start justify-center px-5 pt-1 pb-3"
                            />
                        </Card>
                    </div>
                    <div className="p-4 flex flex-row gap-0.5 items-center justify-between">
                        <Button className="w-36 h-11 transition-width" onClick={ () => handleChangeNavigation("backward") }>
                            <ArrowBigLeft className="text-lg"/> <span>Sebelumnya</span>
                        </Button>
                        <Button className="w-36 h-11 transition-width" onClick={ () => handleChangeNavigation("forward") }>
                            <ArrowBigRight className="text-lg"/> <span>Berikutnya</span>
                        </Button>
                    </div>
                </main>
                <aside className="w-full lg:w-80 h-full transition-width">
                    <Card className="my-card w-full h-full p-4 overflow-y-auto">
                        <ScrollArea>
                            { AnswerOptions }
                        </ScrollArea>
                    </Card>
                </aside>
            </div>

            <Dialog open={openSubmitEnd} onOpenChange={setOpenSubmitEnd}>
                <DialogContent className="my-alert-dialog-content">
                    <DialogHeader>
                        <DialogTitle>Selesaikan Kuis</DialogTitle>
                        <DialogDescription>
                            Apa Kamu yakin ingin menyelesaikan Kuis?
                        </DialogDescription>
                    </DialogHeader>
                    <Separator className="bg-primary/50" />
                    <DialogFooter className="gap-x-0.5">
                        <Button
                            type="button"
                            variant="ghost"
                            className="hover:bg-red-300/85"
                            onClick={() => setOpenSubmitEnd(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            className="bg-green-500 hover:bg-green-500/85 text-zinc-100"
                            onClick={() => {
                                setOpenSubmitEnd(false);
                                handleSubmitEndKuis();
                            }}
                        >
                            Selesaikan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showAwayAlert} onOpenChange={setShowAwayAlert}>
                <DialogContent className="my-alert-dialog-content">
                    <DialogHeader>
                        <DialogTitle>Keluar dari Halaman Terdeteksi</DialogTitle>
                        <DialogDescription>
                            Sistem mendeteksi kamu berpindah dari halaman kuis. Jika ini terjadi
                            sebanyak {QUIZ_AWAY_TOLERANCE} kali, kuis akan otomatis diselesaikan.
                        </DialogDescription>
                    </DialogHeader>
                    <Separator className="bg-primary/50" />
                    <div className="text-sm text-primary">
                        Pelanggaran: {awayAlertCount}/{QUIZ_AWAY_TOLERANCE}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            className="bg-amber-500 hover:bg-amber-500/85 text-zinc-950"
                            onClick={() => setShowAwayAlert(false)}
                        >
                            Saya Mengerti
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Toaster/>
        </>
    );
}
