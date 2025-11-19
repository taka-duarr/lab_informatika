import { Label } from "@/components/ui/label";
import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageProps } from "@/types";
import ErrorPage from "@/Pages/ErrorPage";
import { Textarea } from "@/components/ui/textarea";
import { FreezeTextInput } from "@/components/freeze-text-input";
import { CustomSeparator } from "@/components/custom-separator";
import { QuillEditor } from "@/components/quill-editor";
import Delta from "quill-delta";



type Berita = {
    id: string;
    judul: string;
    slug: string;
    deskripsi: string;
    prasyarat: string;
    konten: string;
    alur: string;
    laboratorium_id: string | null;
    jenis_praktikum_id: string | null;
};

export default function AdminBeritaUpdatePage({
    auth,
    berita,
    laboratoriums,
    jenisPraktikums,
}: PageProps<{
    berita: Berita;
    laboratoriums: { id: string; nama: string }[];
    jenisPraktikums: {
        id: string;
        nama: string;
        laboratorium_id: string;
        laboratorium: { id: string; nama: string };
    }[];
}>) {
    const authUser = auth.user;
    const { toast } = useToast();

    if (!authUser || auth.role !== "admin") {
        return <ErrorPage status={401} />;
    }

    // convert prasyarat & konten dari JSON string → Delta
   const parseDelta = (str: string): Delta => {
       try {
           return JSON.parse(str);
       } catch {
           return new Delta([{ insert: "\n" }]);
       }
   };


    type UpdateForm = {
        id: string;
        laboratorium_id: string;
        jenis_praktikum_id: string;
        judul: string;
        slug: string;
        deskripsi: string;
        prasyarat: Delta;
        konten: Delta;
        alur: string;
        onSubmit: boolean;
    };

    const [form, setForm] = useState<UpdateForm>({
        id: berita.id,
        laboratorium_id: berita.laboratorium_id ?? "null",
        jenis_praktikum_id: berita.jenis_praktikum_id ?? "null",
        judul: berita.judul,
        slug: berita.slug,
        deskripsi: berita.deskripsi,
        prasyarat: parseDelta(berita.prasyarat),
        konten: parseDelta(berita.konten),
        alur: berita.alur ?? "",
        onSubmit: false,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setForm((p) => ({ ...p, onSubmit: true }));

        axios
            .post(route("berita.update"), {
                id: form.id,
                admin_id: authUser.id,
                laboratorium_id:
                    form.laboratorium_id === "null"
                        ? null
                        : form.laboratorium_id,
                jenis_praktikum_id:
                    form.jenis_praktikum_id === "null"
                        ? null
                        : form.jenis_praktikum_id,
                judul: form.judul,
                slug: form.slug,
                deskripsi: form.deskripsi,
                prasyarat: JSON.stringify(form.prasyarat),
                konten: JSON.stringify(form.konten),
                alur: form.alur,
            })
            .then((res) => {
                toast({
                    variant: "default",
                    className: "bg-green-500 text-white",
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.visit(route("admin.berita.index"));
            })
            .catch((err: unknown) => {
                const errMsg: string =
                    err instanceof AxiosError && err.response?.data?.message
                        ? err.response.data.message
                        : "Terjadi kesalahan tidak diketahui!";
                setForm((p) => ({ ...p, onSubmit: false }));
                toast({
                    variant: "destructive",
                    title: "Gagal memperbarui",
                    description: errMsg,
                });
            });
    };

    const jenisFiltered = jenisPraktikums.filter(
        (jp) => jp.laboratorium_id === form.laboratorium_id
    );

    return (
        <AdminLayout auth={auth}>
            <Head title="Admin - Edit Berita" />
            <CardTitle>Edit Berita</CardTitle>
            <CardDescription>Perbarui konten berita</CardDescription>

            <form className="grid items-start gap-4" onSubmit={handleSubmit}>
                <CustomSeparator text="Penerbit Berita" />

                {/* L A B O R A T O R I U M */}
                <Label className="flex-1 grid gap-2">
                    Laboratorium
                    <Select
                        value={form.laboratorium_id}
                        onValueChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                laboratorium_id: v,
                                jenis_praktikum_id: v === "null" ? "null" : "",
                            }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Laboratorium" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="null">Umum</SelectItem>
                            {laboratoriums.map((lab) => (
                                <SelectItem key={lab.id} value={lab.id}>
                                    {lab.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Label>

                {/* J E N I S  P R A K T I K U M */}
                <Label className="flex-1 grid gap-2">
                    Jenis Praktikum / Mata Kuliah
                    <Select
                        value={form.jenis_praktikum_id}
                        disabled={form.laboratorium_id === ""}
                        onValueChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                jenis_praktikum_id: v,
                            }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Jenis Praktikum" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="null">Umum</SelectItem>
                            {jenisFiltered.map((jp) => (
                                <SelectItem key={jp.id} value={jp.id}>
                                    {jp.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Label>

                <CustomSeparator text="Headline Berita" />

                {/* JUDUL */}
                <Label className="grid gap-2">
                    Judul Berita
                    <Input
                        value={form.judul}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, judul: e.target.value }))
                        }
                    />
                </Label>

                {/* SLUG */}
                <Label className="grid gap-2">
                    Slug
                    <FreezeTextInput
                        freezeText={`${window.location.origin}/berita/`}
                        value={form.slug}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, slug: e.target.value }))
                        }
                    />
                </Label>

                {/* DESKRIPSI */}
                <Label className="grid gap-2">
                    Deskripsi
                    <Textarea
                        value={form.deskripsi}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                deskripsi: e.target.value,
                            }))
                        }
                    />
                </Label>

                <CustomSeparator text="Konten Berita" />

                {/* PRASYARAT EDITOR */}
                <Label className="grid gap-2">
                    Prasyarat
                    <QuillEditor
                        value={form.prasyarat}
                        onValueChange={(delta) =>
                            setForm((p) => ({ ...p, prasyarat: delta }))
                        }
                        height="250px"
                    />
                </Label>

                {/* KONTEN EDITOR */}
                <Label className="grid gap-2">
                    Konten
                    <QuillEditor
                        value={form.konten}
                        onValueChange={(delta) =>
                            setForm((p) => ({ ...p, konten: delta }))
                        }
                        height="300px"
                    />
                </Label>

                <Button type="submit" disabled={form.onSubmit}>
                    {form.onSubmit ? (
                        <>
                            Memproses <Loader2 className="animate-spin" />
                        </>
                    ) : (
                        "Simpan Perubahan"
                    )}
                </Button>
            </form>
        </AdminLayout>
    );
}
