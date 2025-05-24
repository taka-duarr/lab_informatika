import { PageProps } from "@/types";
import ErrorPage from "@/Pages/ErrorPage";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import React, { ChangeEvent, FormEvent, useState } from "react";
import axios, { AxiosError } from "axios";
import { Head, router } from "@inertiajs/react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { CustomSeparator } from "@/components/custom-separator";
import { DosenLayout } from "@/layouts/DosenLayout";

export default function DosenProfilePage({ auth, dosen }: PageProps<{
    dosen: {
        id: string;
        nama: string;
        username: string;
        laboratorium: {
            id: string;
            nama: string;
        }[];
    };
}>) {
    console.log(dosen)
    if (!auth.user) {
        return (
            <ErrorPage status={401} />
        );
    }
    const { toast } = useToast();
    type UpdatePasswordForm = {
        password: string;
        repeatPassword: string;
        onSubmit: boolean;
        onSuccess: boolean;
        onError: boolean;
        errMsg: string;
    };
    const updatePasswordFormInit: UpdatePasswordForm = {
        password: '',
        repeatPassword: '',
        onSubmit: false,
        onSuccess: false,
        onError: false,
        errMsg: ''
    };
    const [ updatePasswordForm, setUpdatePasswordForm ] = useState<UpdatePasswordForm>(updatePasswordFormInit);
    const [ passwordVisible, setPasswordVisible ] = useState<boolean>(false);
    const handleUpdatePasswordFormInput = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUpdatePasswordForm((prevState) => ({
            ...prevState,
            [name]: value,
            onError: false,
            errMsg: ''
        }));
    };
    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };
    const handleUpdatePasswordFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setUpdatePasswordForm((prevState) => ({ ...prevState, onSubmit: true }));
        const { password, repeatPassword } = updatePasswordForm;

        axios.post<{
            message: string;
        }>(route('dosen.update-password'), {
            password: password,
            repeat_password: repeatPassword
        })
            .then((res) => {
                toast({
                    variant: 'default',
                    className: 'bg-green-500 text-white',
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.reload({ only: ['praktikan'] });
                setUpdatePasswordForm({
                    ...updatePasswordFormInit
                })
            })
            .catch((err: unknown) => {
                const errMsg: string = err instanceof AxiosError && err.response?.data?.message
                    ? err.response.data.message
                    : 'Error tidak diketahui terjadi!';
                setUpdatePasswordForm((prevState) => ({ ...prevState, onSubmit: false }));
                toast({
                    variant: "destructive",
                    title: "Permintaan gagal diproses!",
                    description: errMsg,
                });
            });
    };
    const disabledUpdatePasswordSubmit = updatePasswordForm.onSubmit
        || !updatePasswordForm.password
        || !updatePasswordForm.repeatPassword
        || updatePasswordForm.password !== updatePasswordForm.repeatPassword
        || updatePasswordForm.password.length < 6

    return (
        <>
            <DosenLayout auth={ auth }>
                <Head title="Dosen - Profil" />
                <CardTitle>
                    Profil Dosen
                </CardTitle>
                <CardDescription>
                    Menampilkan data profil Dosen
                </CardDescription>
                <CardDescription>
                    <span className="text-red-600 font-semibold">*</span>
                    Untuk melakukan update Nama,NIP atau Laboratorium silahkan menghubungi Admin Laboratorium
                </CardDescription>
                <div className={ cn("grid items-start gap-4") }>
                    <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:items-center *:grow">
                        <div className="grid gap-2 min-w-80">
                            <Label htmlFor="nama">Nama</Label>
                            <Input
                                type="text"
                                name="nama"
                                id="nama"
                                value={ dosen.nama }
                                className="text-sm"
                                readOnly
                            />
                        </div>
                        <div className="grid gap-2 min-w-80">
                            <Label htmlFor="username">NIP Dosen</Label>
                            <Input
                                type="text"
                                name="username"
                                id="username"
                                placeholder="06.20xx.1.xxxx"
                                value={ dosen.username }
                                className="text-sm"
                                readOnly
                            />
                        </div>
                        <div className="grid gap-2 min-w-80">
                            <Label htmlFor="laboratorium">Laboratorium</Label>
                            <Input
                                type="text"
                                name="laboratorium"
                                id="laboratorium"
                                placeholder="Belum menjadi Dosen pembimbing Laboratorium"
                                value={ dosen.laboratorium.length > 0
                                    ? dosen.laboratorium.map((laboratorium) => laboratorium.nama).join(', ')
                                    : ''
                                }
                                className="text-sm font-medium placeholder:italic"
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <CustomSeparator
                    text="Ganti Password"
                    className="!my-8 !mb-0"
                    lineClassName="bg-primary/50 h-0.5 w-auto"
                    textClassName="bg-primary/10 rounded-md px-4 py-1 text-primary font-bold"
                />
                <form className="grid gap-2.5" onSubmit={handleUpdatePasswordFormSubmit}>
                    <CardDescription>
                        <span className="text-red-600 font-semibold">*</span>
                        Panjang Password minimum 6 karakter
                    </CardDescription>
                    <CardDescription className="-mt-2">
                        <span className="text-red-600 font-semibold">*</span>
                        Admin Laboratorium dapat melakukan Reset Password apabila suatu saat lupa password akun
                    </CardDescription>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password Baru</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={ passwordVisible ? "text" : "password" }
                                placeholder="******"
                                value={ updatePasswordForm.password }
                                onChange={ handleUpdatePasswordFormInput }
                                required
                            />
                            <button
                                type="button"
                                onClick={ togglePasswordVisibility }
                                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                { passwordVisible ? (
                                    <EyeOff className="w-5 h-5"/>
                                ) : (
                                    <Eye className="w-5 h-5"/>
                                ) }
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="repeatPassword">Konfirmasi Password Baru</Label>
                        <div className="relative">
                            <Input
                                id="repeatPassword"
                                name="repeatPassword"
                                type={ passwordVisible ? "text" : "password" }
                                placeholder="******"
                                value={ updatePasswordForm.repeatPassword }
                                onChange={ handleUpdatePasswordFormInput }
                                required
                            />
                            <button
                                type="button"
                                onClick={ togglePasswordVisibility }
                                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                { passwordVisible ? (
                                    <EyeOff className="w-5 h-5"/>
                                ) : (
                                    <Eye className="w-5 h-5"/>
                                ) }
                            </button>
                        </div>
                    </div>
                    <Button type="submit" disabled={ disabledUpdatePasswordSubmit } className="w-full mt-3 ml-0 sm:w-min sm:ml-auto">
                        { updatePasswordForm.onSubmit
                            ? (
                                <>Memproses <Loader2 className="animate-spin"/></>
                            ) : (
                                <span>Simpan</span>
                            )
                        }
                    </Button>
                </form>
            </DosenLayout>
        </>
    );
}
