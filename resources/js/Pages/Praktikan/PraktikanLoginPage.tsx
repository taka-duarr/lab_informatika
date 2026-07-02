import { ChangeEvent, FormEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogoLabInformatika } from "@/lib/StaticImagesLib";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Head, router } from "@inertiajs/react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const loginSchema = z.object({
    username: z
        .string({ message: "Username wajib diisi!" })
        .min(1, "Username minimal 1 karakter")
        .max(50, "Username terlalu panjang"),
    password: z
        .string({ message: "Password wajib diisi!" })
        .min(6, "Password minimal 6 karakter")
        .max(100, "Password terlalu panjang"),
});

export default function PraktikanLoginPage() {
    const { toast } = useToast();
    const formInit = {
        username: "",
        password: "",
        onsubmit: false,
        onSuccess: false,
        onError: false,
        errMsg: "",
    };
    const [form, setForm] = useState(formInit);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleFormInput = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prevState) => ({
            ...prevState,
            [name]: value,
            onError: false,
            errMsg: "",
        }));
    };

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { username, password } = form;
        setForm((prev) => ({ ...prev, onsubmit: true }));
        const loginValidation = loginSchema.safeParse({ username, password });

        if (!loginValidation.success) {
            setForm((prevState) => ({
                ...prevState,
                onsubmit: false,
                onError: true,
                errMsg: loginValidation.error.issues[0].message,
            }));
            return;
        }

        axios
            .post(route("auth.praktikan"), { username, password })
            .then((res) => {
                setForm((prevState) => ({
                    ...prevState,
                    onsubmit: false,
                    onSuccess: true,
                }));
                toast({
                    variant: "default",
                    className: "bg-green-500 text-white",
                    title: "Sukses!",
                    description: res.data.message,
                });
                router.visit(route(`${res.data.role}.dashboard`), { replace: true });
            })
            .catch((err: unknown) => {
                const errMsg: string =
                    err instanceof AxiosError && err.response?.data?.message
                        ? err.response.data.message
                        : "Server gagal memproses permintaan!";
                setForm((prevState) => ({
                    ...prevState,
                    onsubmit: false,
                    onError: err instanceof AxiosError && err.status !== 500,
                    errMsg: errMsg,
                }));
                if (err instanceof AxiosError && err.status === 500) {
                    toast({
                        variant: "destructive",
                        title: "Gagal!",
                        description: err?.response?.data.message ?? "Network Error",
                    });
                }
            });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen bg-[#f0f2f7] flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[560px]">

                    {/* Left Panel - Form */}
                    <div className="relative flex-1 flex flex-col justify-center px-8 md:px-14 py-12 overflow-hidden">
                        {/* Background blobs */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 opacity-50 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-200 to-cyan-100 opacity-50 blur-3xl pointer-events-none" />

                        <div className="relative z-10 max-w-sm w-full mx-auto">
                            {/* Logo */}
                            <div className="flex items-center gap-3 mb-8">
                                <img src={LogoLabInformatika} alt="logo" className="w-10 h-10 object-contain" />
                                <span className="font-bold text-slate-800 text-sm leading-tight">Laboratorium<br/>Informatika ITATS</span>
                            </div>

                            <h1 className="text-3xl font-bold text-slate-900 mb-1">Selamat Datang!</h1>
                            <p className="text-sm text-slate-500 mb-8">
                                Masuk menggunakan akun{" "}
                                <span className="text-blue-500 font-medium">Praktikan atau Dosen</span>
                            </p>

                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="username" className="text-sm text-slate-700 font-medium">NPM / NIP</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="06.xxxx.1.xxxxx / NIP Dosen"
                                        value={form.username}
                                        onChange={handleFormInput}
                                        required
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white transition-colors focus-visible:ring-blue-400"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-sm text-slate-700 font-medium">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={passwordVisible ? "text" : "password"}
                                            placeholder="Masukkan password"
                                            value={form.password}
                                            onChange={handleFormInput}
                                            required
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white transition-colors pr-10 focus-visible:ring-blue-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error message */}
                                <p className={`text-sm text-red-500 font-medium transition-opacity duration-200 ${form.onError && form.errMsg ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                                    {form.errMsg}
                                </p>

                                <Button
                                    className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/20 mt-2"
                                    type="submit"
                                    disabled={form.onsubmit || form.onError || form.onSuccess}
                                >
                                    {form.onsubmit ? "Memuat..." : form.onSuccess ? "Berhasil ✓" : "Masuk"}
                                </Button>

                                <p className="text-center text-sm text-slate-500 pt-1">
                                    Belum punya akun?{" "}
                                    <a
                                        href={route("praktikan.register")}
                                        className="font-bold text-slate-800 hover:underline underline-offset-2"
                                    >
                                        Daftar di sini
                                    </a>
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel - Mascot */}
                    <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden rounded-2xl m-3">
                        {/* Gradient blobs background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50" />
                        <div className="absolute top-1/4 right-1/4 w-56 h-56 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 opacity-60 blur-3xl" />
                        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-gradient-to-tr from-blue-300 to-cyan-300 opacity-60 blur-3xl" />
                        <div className="absolute top-1/3 left-1/3 w-40 h-40 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-40 blur-2xl" />

                        {/* Mascot Image */}
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <img
                                src="/assets/network_mascot.png"
                                alt="Network Mascot"
                                className="w-72 h-72 object-contain mix-blend-multiply drop-shadow-2xl"
                                style={{
                                    filter: "drop-shadow(0 20px 40px rgba(99, 102, 241, 0.25))",
                                    animation: "float 4s ease-in-out infinite"
                                }}
                            />
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* Float animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-16px); }
                }
            `}</style>

            <Toaster />
        </>
    );
}
