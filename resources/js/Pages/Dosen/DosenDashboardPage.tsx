import { Head } from "@inertiajs/react";
import { DosenLayout } from "@/layouts/DosenLayout";
import { PageProps } from "@/types";

export default function DosenDashboardPage({ auth }: PageProps<{

}>) {
    return (
        <>
            <Head title="Dosen - Dashboard" />
            <DosenLayout auth={auth}>
                <div>
                    Dashboard Dosen
                </div>
            </DosenLayout>
        </>
    );
}
