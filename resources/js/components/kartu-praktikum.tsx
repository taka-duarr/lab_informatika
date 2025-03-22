import { Document, Image, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";
import { LogoLabInformatika } from "@/lib/StaticImagesLib";
import { saveAs } from "file-saver";
import * as React from "react";
import { Buffer } from 'buffer';

window.Buffer = Buffer;
type Praktikan = {
    id: string;
    username: string;
    avatar: string | null;
    nama: string;
    aslab: {
        id: string;
        nama: string;
    } | null;
    dosen: {
        id: string;
        nama: string;
    } | null;
    sesi: {
        id: string;
        nama: string;
    } | null;
}
type Praktikum = {
    id: string;
    nama: string;
    tahun: number;
    praktikan: Praktikan[];
    periode: {
        id: string;
        nama: string;
    };
    jenis: {
        id: string;
        nama: string;
    };
    laboratorium: {
        id: string;
        nama: string;
        avatar: string | null;
    };
    pertemuan: {
        id: string;
        nama: string;
    }[];
}
const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#fff",
        padding: 16,
    },
    header: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },
    logo: {
        width: 35,
        height: 35,
        backgroundColor: "transparent",
    },
    titleContainer: {
        alignItems: "center",
    },
    titleText: {
        fontFamily: "Helvetica-Bold",
        fontSize: 14.5,
    },
    subtitleText: {
        fontSize: 9,
    },
    divider: {
        backgroundColor: "#000",
        width: "100%",
        height: 1,
        marginVertical: 10,
    },
    content: {
        flexDirection: "row",
        flex: 1,
        gap: 8,
    },
    profileImage: {
        width: 90,
        height: 90,
        objectFit: "cover",
        objectPosition: "center",
    },
    bioContainer: {
        gap: 5,
        fontSize: 8.5,
    },
    bioRow: {
        flexDirection: "row",
        gap: 2,
    },
    bioLabel: {
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        width: 38,
    },
    bioLabelWide: {
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        width: 90,
    },
    tableWrapper: {
        marginTop: 12,
        border: "0.5px solid #333",
        marginBottom: 20,
    },
    tableHeader: {
        width: "100%",
        textAlign: "center",
        fontFamily: "Helvetica-Bold",
        fontSize: 10.5,
        fontWeight: "extrabold",
        padding: 4,
        border: "1px solid #333",
    },
    table: {
        width: "100%",
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    cell: {
        border: "0.5px solid #333",
        padding: 2.5,
        flex: 1,
        fontFamily: "Helvetica-Bold",
        fontSize: 6,
        fontWeight: "bold",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyCell: {
        border: "0.5px solid #333",
        padding: 20,
        flexGrow: 1,
    },
});
export const exportKartuPraktikum = async (praktikum: Praktikum): Promise<{
    message: string
}> => {
    try {
        const doc = (
            <Document>
                {praktikum.praktikan.map((praktikan, index) => (
                    <Page
                        key={index}
                        size="A6"
                        orientation="landscape"
                        style={styles.page}
                    >
                        <View style={styles.header}>
                            <Image
                                style={styles.logo}
                                src={LogoLabInformatika}
                            />
                            <View style={styles.titleContainer}>
                                <Text style={styles.titleText}>
                                    Kartu Praktikum
                                </Text>
                                <Text style={styles.subtitleText}>
                                    {praktikum.nama} - {praktikum.tahun}
                                </Text>
                                <Text style={styles.subtitleText}>
                                    Laboratorium{" "}
                                    {praktikum.laboratorium.nama}
                                </Text>
                            </View>
                            <Image
                                style={styles.logo}
                                src={
                                    praktikum.laboratorium.avatar
                                        ? `/storage/laboratorium/${praktikum.laboratorium.avatar}`
                                        : LogoLabInformatika
                                }
                            />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.content}>
                            {praktikan.avatar ? (
                                <Image
                                    src={{ uri: `${window.location.origin}/storage/praktikan/${praktikan.avatar}`, method: 'GET', credentials: 'include' }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View
                                    style={{
                                        ...styles.profileImage,
                                        border: 1,
                                    }}
                                />
                            )}
                            <View style={styles.bioContainer}>
                                <View style={styles.bioRow}>
                                    <Text style={styles.bioLabel}>
                                        Nama
                                    </Text>
                                    <Text>: {praktikan.nama}</Text>
                                </View>
                                <View style={styles.bioRow}>
                                    <Text style={styles.bioLabel}>NPM</Text>
                                    <Text>: {praktikan.username}</Text>
                                </View>
                                <View style={styles.bioRow}>
                                    <Text style={styles.bioLabel}>
                                        Sesi
                                    </Text>
                                    <Text>
                                        : {praktikan.sesi?.nama ?? ""}
                                    </Text>
                                </View>
                                <View style={styles.bioRow}>
                                    <Text style={styles.bioLabelWide}>
                                        Asisten Pembimbing
                                    </Text>
                                    <Text>
                                        : {praktikan.aslab?.nama ?? ""}
                                    </Text>
                                </View>
                                <View style={styles.bioRow}>
                                    <Text style={styles.bioLabelWide}>
                                        Dosen Pembimbing
                                    </Text>
                                    <Text>
                                        : {praktikan.dosen?.nama ?? ""}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.tableWrapper}>
                            <Text style={styles.tableHeader}>
                                Pelanggaran
                            </Text>
                            <View style={styles.table}>
                                <View style={styles.row}>
                                    {Array.from({
                                        length:
                                            praktikum.pertemuan.length < 1
                                                ? 8
                                                : praktikum.pertemuan
                                                    .length,
                                    }).map((_, index) => (
                                        <View
                                            key={index}
                                            style={styles.cell}
                                        >
                                            <Text>
                                                Pertemuan {index + 1}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.row}>
                                    {Array.from({
                                        length:
                                            praktikum.pertemuan.length < 1
                                                ? 8
                                                : praktikum.pertemuan
                                                    .length,
                                    }).map((_, index) => (
                                        <View
                                            key={index}
                                            style={styles.emptyCell}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                    </Page>
                ))}
            </Document>
        );
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const pdfBlob = await asPdf.toBlob();
        saveAs(
            pdfBlob,
            `kartu-praktikum-${praktikum.nama}-${praktikum.periode.nama}.pdf`
        );
        return {
            message: 'Berhasil mengeskpor Kartu Praktikum!'
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'Gagal mengeskpor Kartu Praktikum! cek console dan laporkan ke Developer'
        };
    }
};
