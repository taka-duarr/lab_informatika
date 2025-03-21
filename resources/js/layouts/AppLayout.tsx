import { useState, useEffect, ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Glacio, Havoc, LogoLabInformatika, Spectro } from "@/lib/StaticImagesLib";
import Cookies from "js-cookie";
import { Link } from "@inertiajs/react";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { PageProps } from "@/types";
import { Footer } from "@/components/app-footer";

export const AppLayout = ({ auth, children }: PageProps<{
    children: ReactNode;
}>) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasVisited = Cookies.get("visited");
        if (!hasVisited) {
            setIsOpen(true)
            Cookies.set('visited', 'YORUSHIKA', { expires: 365 });
        }
    }, []);

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <header className="px-4 lg:px-6 h-14 flex items-center">
                    <Link className="p-2 flex items-center justify-center gap-1.5 font-semibold bg-none hover:bg-muted transition-colors ease-in-out duration-150 rounded-md" href="/">
                        <img src={ LogoLabInformatika } alt="logo-jarkom" width={30} className="rounded-full"/>
                        <span className="sr-only">Laboratorium Informatika ITATS</span>
                        <p className="hidden md:block">LABORATORIUM INFORMATIKA ITATS</p>
                        <p className="block md:hidden">LAB.INFORMATIKA ITATS</p>
                    </Link>
                    <nav className="ml-auto flex gap-4 sm:gap-6">
                        <ProfileDropdown auth={auth} />
                    </nav>
                </header>
                <main className="flex-1">
                    { children }
                </main>
                <Footer />
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[90%] sm:max-w-[500px] rounded">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="h-6 w-6 text-blue-600" />
                            Selamat Datang di new Labinformatika ITATS!
                        </DialogTitle>
                        <DialogDescription className="!mt-4 text-gray-900 font-medium">
                            Setelah puluhan entah ratusan kali melawan rasa malas mengoding akhirnya kelar juga😁
                            <br/>
                            Fitur yang tersedia untuk saat ini yaitu :
                        </DialogDescription>
                    </DialogHeader>
                    <ul className="pb-4 space-y-3">
                        <li className="grid grid-cols-12 gap-1 text-sm text-gray-800">
                            <img
                                src={ Spectro }
                                width={ 25 }
                                alt="spectro"
                                className="col-span-1"
                            />
                            <p className="col-span-11">
                                <strong> Halaman Admin</strong>, fitur yang bisa digunakan yaitu Manajemen Praktikum yang mencakup data Praktikum, Jenis Praktikum, Periode Praktikum, kemudian Manajemen Praktikan yang mencakup Data Praktikan dan Registrasi Praktikan ke Praktikum, dan terakhir, Manajemen Kuis yang mencakup Soal dan Label Soal.
                            </p>
                        </li>
                        <li className="grid grid-cols-12 gap-1 text-sm text-gray-800">
                            <img
                                src={ Havoc }
                                width={ 25 }
                                alt="spectro"
                                className="col-span-1"
                            />
                            <p className="col-span-11">
                                <strong>Halaman Praktikan</strong>, memerlukan autentikasi (login) untuk menggunakan beberapa fitur seperti pengerjaan Kuis, Profil, dan Registrasi Praktikum yang tentu saja mendukung sepenuhnya pendaftaran paperless.
                            </p>
                        </li>
                        <li className="grid grid-cols-12 gap-1 text-sm text-gray-800">
                            <img
                                src={ Glacio }
                                width={ 25 }
                                alt="spectro"
                                className="col-span-1"
                            />
                            <p className="col-span-11">
                                <strong>Halaman Aslab & Dosen,</strong>, OnGoing...
                            </p>
                        </li>
                    </ul>
                    <DialogDescription className="-mt-4 text-gray-900 font-medium">
                        Special Thanks to :
                        <ul className="list-inside list-disc">
                            <li>Bapak Danang Haryo Sulaksono, S.ST., M.T.</li>
                            <li>Bapak Muchamad Kurniawan, S.Kom.,M.Kom.</li>
                            <li>Bapak Septyawan Rosetya Wardhana S.Kom.,M.Kom.</li>
                            <li>Our beloved condolences, PSI Niqqas</li>
                        </ul>
                    </DialogDescription>
                    <DialogFooter>
                        <Button onClick={ () => setIsOpen(false) } className="w-full">
                            Oke mint
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
};
