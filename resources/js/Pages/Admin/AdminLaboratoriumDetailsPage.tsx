import { AvatarUpload } from "@/components/avatar-upload";
import { PageProps } from "@/types";
import ErrorPage from "@/Pages/ErrorPage";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { Head, router } from "@inertiajs/react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ChangeEvent, FormEvent, useState } from "react";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSeparator } from "@/components/custom-separator";
import JenisNilaiSorter from "@/components/jenis-nilai-sorter";

type JenisNilai = {
    id: string;
    nama: string;
    urutan: number;
};
export default function AdminLaboratoriumDetailsPage({ auth, laboratorium }: PageProps<{
    laboratorium: {
        id: string;
        nama: string;
        avatar: string | null;
        jenis_nilai: JenisNilai[];
    };
}>) {
    if (!auth.user) {
        return (
            <ErrorPage status={401} />
        );
    }

    const { toast } = useToast();

    type UpdateForm = {
        id: string;
        nama: string;
        onChange: boolean;
        onSubmit: boolean;
    };
    type JenisNilaiForm = {
        data: JenisNilai[];
        onChange: boolean;
        onSubmit: boolean;
    };
    const updateFormInit: UpdateForm = {
        id: laboratorium.id,
        nama: laboratorium.nama,
        onChange: false,
        onSubmit: false,
    };
    const jenisNilaiFormInit: JenisNilaiForm = {
        data: laboratorium.jenis_nilai,
        onChange: false,
        onSubmit: false,
    };

    const [ updateForm, setUpdateForm ] = useState<UpdateForm>(updateFormInit);
    const [ jenisNilaiForm, setJenisNilaiForm ] = useState<JenisNilaiForm>(jenisNilaiFormInit);

    const handleUpdateFormInput = (event: ChangeEvent<HTMLInputElement>) => {
        setUpdateForm((prevState) => {
            const newState = {
                ...prevState,
                [event.target.name]: event.target.value,
            };

            return {
                ...newState,
                onChange: JSON.stringify({
                    nama: newState.nama
                }) !== JSON.stringify({
                    nama: laboratorium.nama,
                }),
            }
        });
    };
    const handleJenisNilaiFormInput = (key: keyof JenisNilaiForm, val: JenisNilai[] | boolean) => {
        setJenisNilaiForm((prevState) => {
            if (key === 'data') {
                const prevData = [
                    ...prevState.data,
                ];
                return {
                    ...prevState,
                    data: [ ...val as JenisNilai[] ],
                    onChange: JSON.stringify(prevData) !== JSON.stringify([ ...val as JenisNilai[] ])
                }
            }

            return {
                ...prevState,
                [key]: val,
            }
        })
    };

    const handleUpdateFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setUpdateForm((prevState) => ({ ...prevState, onSubmit: true }));
        const { id, nama } = updateForm;
        const updateSchema = z.object({
            id: z.string({ message: 'Format Laboratorium tidak valid! '}).min(1, { message: 'Format Laboratorium tidak valid!' }),
            nama: z.string({ message: 'Format nama tidak valid! '}).min(1, { message: 'Nama Laboratorium wajib diisi!' }),
        });
        const updateParse = updateSchema.safeParse({
            id: id,
            nama: nama
        });
        if (!updateParse.success) {
            const errMsg = updateParse.error.issues[0]?.message;
            toast({
                variant: "destructive",
                title: "Periksa kembali Input anda!",
                description: errMsg,
            });
            setUpdateForm((prevState) => ({ ...prevState, onSubmit: false }));
            return;
        }

        axios.post<{
            message: string;
        }>(route('laboratorium.update'), {
            id: id,
            nama: nama
        })
            .then((res) => {
                toast({
                    variant: 'default',
                    className: 'bg-green-500 text-white',
                    title: "Berhasil!",
                    description: res.data.message,
                });
                setUpdateForm((prevState) => ({ ...prevState, onSubmit: false, onChange: false }));
                router.reload({ only: ['laboratorium'] });
            })
            .catch((err: unknown) => {
                const errMsg: string = err instanceof AxiosError && err.response?.data?.message
                    ? err.response.data.message
                    : 'Error tidak diketahui terjadi!';
                setUpdateForm((prevState) => ({ ...prevState, onSubmit: false }));
                toast({
                    variant: "destructive",
                    title: "Permintaan gagal diproses!",
                    description: errMsg,
                });
            });
    };
    const handleJenisNilaiSubmit = () => {
        setJenisNilaiForm((prevState) => ({ ...prevState, onSubmit: true }));
        axios.post(route('jenis-nilai.create'), {
            jenis_nilai: jenisNilaiForm.data.map((jenisNilai) => ({
                ...jenisNilai,
                laboratorium_id: laboratorium.id
            }))
        })
            .then((res) => {
                setJenisNilaiForm((prevState) => ({
                    ...prevState,
                    onChange: false,
                    onSubmit: false
                }));
                toast({
                    variant: 'default',
                    className: 'bg-green-500 text-white',
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.reload({ only: ['laboratorium'] });
            })
            .catch((err: unknown) => {
                const errMsg: string = err instanceof AxiosError && err.response?.data?.message
                    ? err.response.data.message
                    : 'Error tidak diketahui terjadi!';
                setJenisNilaiForm((prevState) => ({ ...prevState, onSubmit: false }));
                toast({
                    variant: "destructive",
                    title: "Permintaan gagal diproses!",
                    description: errMsg,
                });
            })
    };

    const handleUploadAvatar = (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('id', laboratorium.id);
        axios.post<{
            message: string;
            avatar_url: string;
        }>(route('laboratorium.upload-avatar'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((res) => {
                toast({
                    variant: 'default',
                    className: 'bg-green-500 text-white',
                    title: "Berhasil!",
                    description: res.data.message,
                });
                router.reload({ only: ['laboratorium', 'auth'] });
            })
            .catch((err: unknown) => {
                const errMsg: string = err instanceof AxiosError && err.response?.data?.message
                    ? err.response.data.message
                    : 'Error tidak diketahui terjadi!';
                toast({
                    variant: "destructive",
                    title: "Permintaan gagal diproses!",
                    description: errMsg,
                });
            });
    };

    // console.log(jenisNilaiForm)

    return (
        <>
            <AdminLayout auth={ auth }>
                <Head title={ `Laboratorium ${ laboratorium.nama }`} />
                <CardTitle>
                    Data Laboratorium
                </CardTitle>
                <CardDescription>
                    Laboratorium { laboratorium.nama }
                </CardDescription>
                <AvatarUpload avatarSrc={laboratorium.avatar ? `/storage/laboratorium/${laboratorium.avatar}` : undefined} onUpload={handleUploadAvatar} />
                <form className={ cn("grid items-start gap-4") } onSubmit={ handleUpdateFormSubmit }>
                    <div className="grid gap-2 min-w-80">
                        <Label htmlFor="nama">Nama Laboratorium</Label>
                        <Input
                            type="text"
                            name="nama"
                            id="nama"
                            value={ updateForm.nama }
                            onChange={ handleUpdateFormInput }
                        />
                    </div>
                    <Button type="submit" disabled={updateForm.onSubmit || !updateForm.onChange}>
                        { updateForm.onSubmit
                            ? (
                                <>Memproses <Loader2 className="animate-spin" /></>
                            ) : (
                                <>
                                    Simpan
                                    <Save />
                                </>
                            )
                        }
                    </Button>
                </form>
                <CustomSeparator
                    text="Jenis Nilai Praktikum"
                    className="!my-8 !mb-0"
                    lineClassName="bg-primary/50 h-0.5 w-auto"
                    textClassName="bg-transparent rounded-md px-4 py-1 text-primary font-bold"
                />
                <CardTitle>
                    Petunjuk :
                </CardTitle>
                <ul className="list-inside list-disc text-sm space-y-0.5">
                    <li>Jenis Nilai adalah jenis penilaian per-modul, contoh : <strong className="tracking-wide">Evaluasi, Pendahuluan, Praktikum, Asistensi, Dosen, dan Lain-lainnya</strong>.</li>
                    <li>Setiap jenis nilai memiliki status aktif yang dapat diubah (<strong> Aktif / Tidak Aktif</strong> ).</li>
                    <li>Setiap jenis nilai memiliki urutan penempatan yang dapat diatur.</li>
                    <li>Urutan jenis nilai menentukan urutan kolom hasil export Nilai Praktikum.</li>
                    <li>Sangat tidak disarankan untuk <strong>menghapus</strong> jenis nilai, gunakan alih <strong>Status Aktif</strong> jika tidak ingin lagi menggunakan jenis nilai.</li>
                    <li>Jenis nilai <strong>Aktif</strong> akan tersedia bagi Asisten Lab. untuk input penilaian asitensi Praktikannya.</li>

                </ul>

                <div className="flex flex-col gap-2.5">
                    <Card className="my-card !border-primary/40 !rounded-md">
                        <JenisNilaiSorter
                            initialData={jenisNilaiForm.data}
                            onUpdate={(newData) => handleJenisNilaiFormInput('data', newData)}
                        />
                    </Card>
                    <Button type="button" onClick={ handleJenisNilaiSubmit } disabled={jenisNilaiForm.onSubmit || !jenisNilaiForm.onChange} className="!ml-auto ">
                        { jenisNilaiForm.onSubmit
                            ? (
                                <>Memproses <Loader2 className="animate-spin" /></>
                            ) : (
                                <>
                                    Simpan
                                    <Save />
                                </>
                            )
                        }
                    </Button>
                </div>
            </AdminLayout>
        </>
    );
}
