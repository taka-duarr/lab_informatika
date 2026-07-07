import { Head, Link } from "@inertiajs/react";
import { LogoJarkom, LogoRPL, LogoAI, LogoLabInformatika } from "@/lib/StaticImagesLib";
import { ArrowRight, Network, Code2, Brain, ExternalLink, ShieldCheck, Cpu, Database, Cloud } from "lucide-react";
import { useState, useEffect } from "react";

const labs = [
    {
        id: "jarkom",
        nama: "Jaringan Komputer",
        singkatan: "JARKOM",
        deskripsi: "Eksplorasi mendalam routing, switching, dan keamanan jaringan dalam ekosistem modern.",
        logo: LogoJarkom,
        icon: Network,
        href: "/jarkom",
        isExternal: false,
        gradient: "from-blue-500 to-cyan-400",
        glow: "group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]",
        borderColor: "border-slate-200",
        hoverBorder: "hover:border-blue-300",
        badgeBg: "bg-blue-100 text-blue-700 border-blue-200",
        iconColor: "text-blue-600",
        tags: ["Routing", "Security", "Wireless"],
    },
    {
        id: "rpl",
        nama: "Rekayasa Perangkat Lunak",
        singkatan: "RPL",
        deskripsi: "Pusat inovasi pengembangan perangkat lunak modern, dari web architecture hingga mobile tech.",
        logo: LogoRPL,
        icon: Code2,
        href: "https://labrpl-itats.sistemin.site",
        isExternal: true,
        gradient: "from-emerald-500 to-teal-400",
        glow: "group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]",
        borderColor: "border-slate-200",
        hoverBorder: "hover:border-emerald-300",
        badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        iconColor: "text-emerald-600",
        tags: ["Web Dev", "Mobile", "UI/UX"],
    },
    {
        id: "ai",
        nama: "Kecerdasan Buatan",
        singkatan: "AI",
        deskripsi: "Penelitian komprehensif machine learning, deep learning, dan computer vision terkini.",
        logo: LogoAI,
        icon: Brain,
        href: "https://lab-ai-itats.devarc.site",
        isExternal: true,
        gradient: "from-purple-500 to-violet-400",
        glow: "group-hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]",
        borderColor: "border-slate-200",
        hoverBorder: "hover:border-purple-300",
        badgeBg: "bg-purple-100 text-purple-700 border-purple-200",
        iconColor: "text-purple-600",
        tags: ["Machine Learning", "NLP", "Vision"],
    },
];

const partners = [
    { name: "Cisco", icon: ShieldCheck },
    { name: "Linux", icon: Database },
    { name: "MikroTik", icon: Network },
    { name: "Python", icon: Code2 },
    { name: "TensorFlow", icon: Brain },
    { name: "React", icon: Cpu },
    { name: "AWS", icon: Cloud },
];

export default function LabPortalPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <Head title="Portal Laboratorium Informatika" />

            <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/30 overflow-x-hidden font-sans relative">
                
                {/* Abstract Background Glows */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/40 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-300/30 rounded-full blur-[100px] mix-blend-multiply" />
                </div>

                {/* Abstract Nodes/Lines Background SVG */}
                <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0.02)" />
                                <stop offset="50%" stopColor="rgba(0,0,0,0.15)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.02)" />
                            </linearGradient>
                        </defs>
                        {/* Center to Top Left */}
                        <path d="M 50vw 40vh Q 30vw 20vh 15vw 30vh" fill="none" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />
                        <circle cx="15vw" cy="30vh" r="4" fill="#3b82f6" opacity="0.6" />
                        {/* Center to Top Right */}
                        <path d="M 50vw 40vh Q 70vw 20vh 80vw 25vh" fill="none" stroke="url(#lineGrad)" strokeWidth="1" />
                        <circle cx="80vw" cy="25vh" r="3" fill="#10b981" opacity="0.6" />
                        {/* Center to Bottom Left */}
                        <path d="M 50vw 40vh Q 20vw 60vh 25vw 70vh" fill="none" stroke="url(#lineGrad)" strokeWidth="1" />
                        <circle cx="25vw" cy="70vh" r="3" fill="#a855f7" opacity="0.6" />
                        {/* Center to Bottom Right */}
                        <path d="M 50vw 40vh Q 70vw 70vh 85vw 60vh" fill="none" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" />
                        <circle cx="85vw" cy="60vh" r="5" fill="#3b82f6" opacity="0.4" />
                    </svg>
                </div>

                {/* Floating Navbar */}
                <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
                    <div className="flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-full shadow-lg shadow-slate-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm border border-slate-100">
                                <img src={LogoLabInformatika} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-semibold text-sm tracking-wide text-slate-800 hidden sm:block">Laboratorium ITATS</span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
                            <span className="text-slate-900 transition-colors cursor-pointer">Portal</span>
                            <span className="hover:text-slate-900 transition-colors cursor-pointer">Fasilitas</span>
                            <span className="hover:text-slate-900 transition-colors cursor-pointer">Tentang</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link 
                                href={route("praktikan.login")} 
                                className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                            >
                                Get in touch
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="relative z-10 pt-40 pb-20 flex flex-col items-center justify-center min-h-screen">
                    
                    {/* Hero Section */}
                    <div className={`text-center max-w-4xl px-4 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200/60 bg-blue-50/50 backdrop-blur-md text-xs font-semibold text-blue-700 mb-8 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Unlock Your Potential in Tech
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 mb-6 drop-shadow-sm">
                            Satu Pintu Akses <br className="hidden md:block" />
                            Eksplorasi Teknologi
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
                            Pilih laboratorium yang ingin Anda akses untuk mulai menggunakan fasilitas komputasi tingkat tinggi dan fitur rekapitulasi nilai.
                        </p>
                    </div>

                    {/* Lab Cards Section */}
                    <div className={`w-full max-w-6xl mx-auto px-6 mt-6 md:mt-10 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {labs.map((lab) => {
                                const IconComponent = lab.icon;
                                const isExternal = lab.isExternal;

                                const cardContent = (
                                    <div className={`group relative h-full flex flex-col rounded-3xl border bg-white/60 backdrop-blur-xl overflow-hidden transition-all duration-500 ${lab.borderColor} ${lab.hoverBorder} ${lab.glow} shadow-sm hover:shadow-xl`}>
                                        
                                        {/* Top Accent Gradient */}
                                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${lab.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                        
                                        <div className="p-8 flex-1 flex flex-col">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-500 shadow-md">
                                                    <img src={lab.logo} alt={lab.nama} className="w-full h-full object-contain mix-blend-multiply" />
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border uppercase ${lab.badgeBg}`}>
                                                    {lab.singkatan}
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all">
                                                Lab {lab.nama}
                                            </h2>
                                            <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1 font-medium">
                                                {lab.deskripsi}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {lab.tags.map(tag => (
                                                    <span key={tag} className="text-[11px] font-semibold text-slate-600 bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer Action */}
                                            <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between group-hover:border-slate-200 transition-colors">
                                                <span className={`text-sm font-bold flex items-center gap-2 ${lab.iconColor}`}>
                                                    <IconComponent size={18} />
                                                    {isExternal ? "Kunjungi Website" : "Buka Dashboard"}
                                                </span>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all duration-300 text-slate-400">
                                                    {isExternal ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );

                                return isExternal ? (
                                    <a key={lab.id} href={lab.href} target="_blank" rel="noopener noreferrer" className="block focus:outline-none">
                                        {cardContent}
                                    </a>
                                ) : (
                                    <Link key={lab.id} href={lab.href} className="block focus:outline-none">
                                        {cardContent}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Logos Section */}
                    <div className={`mt-24 md:mt-32 w-full border-t border-slate-200/60 bg-white/40 backdrop-blur-sm py-10 transition-opacity duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="max-w-6xl mx-auto px-6">
                            <p className="text-center text-xs text-slate-400 uppercase tracking-widest font-bold mb-8">Powered by Industry Standard Technologies</p>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                {partners.map((partner) => {
                                    const PartnerIcon = partner.icon;
                                    return (
                                        <div key={partner.name} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors duration-300">
                                            <PartnerIcon size={24} />
                                            <span className="font-bold text-lg tracking-tight">{partner.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
