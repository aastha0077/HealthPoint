import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/apis/apis";
import { 
    Activity, 
    Brain, 
    ChevronRight, 
    Heart,
    Eye,
    ShieldCheck,
    RotateCcw,
    ChevronLeft,
    Info
} from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";

interface Region {
    id: number;
    name: string;
    organs: Organ[];
}

interface Organ {
    id: number;
    name: string;
    regionId: number;
}

interface Symptom {
    id: number;
    name: string;
}

interface Doctor {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    speciality: string;
    department: string;
    available: boolean;
    organs: string[];
    symptoms: string[];
    timeSlots: string[];
    relevanceScore: number;
}

// STEP-BY-STEP TYPES
type DiagnosticStep = 'anatomy' | 'focus' | 'symptoms' | 'results';

const BodyVisual = ({ onSelect, selectedRegion }: { onSelect: (name: string) => void, selectedRegion: string | null }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            <svg 
                viewBox="0 0 200 500" 
                className="w-full h-full transition-all duration-700 ease-in-out drop-shadow-2xl"
            >
                <defs>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#f1f5f9" />
                    </linearGradient>
                    <filter id="premiumGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <path d="M100,20 c-18,0 -28,14 -28,28 s8,28 28,28 s28,-14 28,-28 s-10,-28 -28,-28 M72,76 l-8,25 l-45,85 l10,10 l35,-65 l0,135 l-12,165 l22,6 l18,-150 l18,-1 l18,150 l22,-6 l-12,-165 l0,-135 l35,65 l10,-10 l-45,-85 l-8,-25 z" fill="url(#bodyGradient)" stroke="#e2e8f0" strokeWidth="1.5" />
                <motion.path d="M100,20 c-18,0 -28,14 -28,28 s8,28 28,28 s28,-14 28,-28 s-10,-28 -28,-28" className={`cursor-pointer transition-all ${selectedRegion === 'Head & Neck' ? 'fill-rose-500/30 stroke-rose-500 stroke-[2px]' : 'fill-transparent hover:fill-rose-500/10'}`} animate={selectedRegion === 'Head & Neck' ? { filter: "url(#premiumGlow)" } : { filter: "none" }} onClick={() => onSelect('Head & Neck')} />
                <motion.path d="M72,85 l56,0 l6,42 c0,20 -25,32 -34,32 s-34,-12 -34,-32 z" className={`cursor-pointer transition-all ${selectedRegion === 'Chest & Upper Back' ? 'fill-rose-500/30 stroke-rose-500 stroke-[2px]' : 'fill-transparent hover:fill-rose-500/10'}`} animate={selectedRegion === 'Chest & Upper Back' ? { filter: "url(#premiumGlow)" } : { filter: "none" }} onClick={() => onSelect('Chest & Upper Back')} />
                <motion.path d="M66,165 c0,0 8,50 34,50 s34,-50 34,-50 z" className={`cursor-pointer transition-all ${selectedRegion === 'Abdomen & Digestive' ? 'fill-rose-500/30 stroke-rose-500 stroke-[2px]' : 'fill-transparent hover:fill-rose-500/10'}`} animate={selectedRegion === 'Abdomen & Digestive' ? { filter: "url(#premiumGlow)" } : { filter: "none" }} onClick={() => onSelect('Abdomen & Digestive')} />
                <motion.path d="M66,215 l68,0 l-10,45 l-48,0 z" className={`cursor-pointer transition-all ${selectedRegion === 'Pelvis & Urinary' ? 'fill-rose-500/30 stroke-rose-500 stroke-[2px]' : 'fill-transparent hover:fill-rose-500/10'}`} animate={selectedRegion === 'Pelvis & Urinary' ? { filter: "url(#premiumGlow)" } : { filter: "none" }} onClick={() => onSelect('Pelvis & Urinary')} />
                <motion.path d="M70,95 l-50,90 l12,14 l38,-84 z M130,95 l50,90 l-12,14 l-38,-84 z M76,260 l-16,170 l26,6 l16,-176 z M124,260 l16,170 l-26,6 l-16,-176 z" className={`cursor-pointer transition-all ${selectedRegion === 'Limbs & Joints' ? 'fill-rose-500/30 stroke-rose-500 stroke-[2px]' : 'fill-transparent hover:fill-rose-500/10'}`} animate={selectedRegion === 'Limbs & Joints' ? { filter: "url(#premiumGlow)" } : { filter: "none" }} onClick={() => onSelect('Limbs & Joints')} />
                <motion.circle cx="100" cy="48" r="4" fill="#f43f5e" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
                <motion.circle cx="100" cy="110" r="4" fill="#f43f5e" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.5 }} />
                <motion.circle cx="100" cy="190" r="4" fill="#f43f5e" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.8 }} />
            </svg>
        </div>
    )
}

const ConfidenceGauge = ({ value }: { value: number }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
        <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90">
                <circle cx="48" cy="48" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle cx="48" cy="48" r={radius} fill="transparent" stroke={value > 80 ? "#10b981" : "#fb7185"} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white leading-none tracking-tighter">{value}%</span>
            </div>
        </div>
    );
};

export function SymptomChecker() {
    const [regions, setRegions] = useState<Region[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
    const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [clinicalInsight, setClinicalInsight] = useState("");
    const [confidence, setConfidence] = useState(0);
    const [manualSymptomsInput, setManualSymptomsInput] = useState("");
    const [, setLoading] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    
    // STEP NAVIGATION
    const [currentStep, setCurrentStep] = useState<DiagnosticStep>('anatomy');

    useEffect(() => {
        async function fetchRegions() {
            setLoading(true);
            try {
                const res = await apiClient.get("/api/symptoms/regions");
                setRegions(res.data);
            } catch (err) {
                toast.error("Anatomical Engine Error");
            } finally {
                setLoading(false);
            }
        }
        fetchRegions();
    }, []);

    const handleRegionSelect = async (name: string) => {
        const region = regions.find(r => r.name === name);
        if (!region) return;
        setSelectedRegion(region);
        setSelectedOrgan(null);
        setSymptoms([]);
        setSelectedSymptoms([]);
        setCurrentStep('focus');
    };

    const handleOrganSelect = async (organ: Organ) => {
        setSelectedOrgan(organ);
        setSelectedSymptoms([]);
        setLoading(true);
        try {
            const res = await apiClient.get(`/api/symptoms/organs/${organ.id}/symptoms`);
            setSymptoms(res.data);
            setCurrentStep('symptoms');
        } catch (err) {
            toast.error("Symptom Data Unavailable");
        } finally {
            setLoading(false);
        }
    };

    const toggleSymptom = (id: number) => {
        setSelectedSymptoms(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSearch = async () => {
        if (!selectedOrgan) return;
        setLoadingDoctors(true);
        setCurrentStep('results');
        
        // Split manual symptoms by comma
        const manualSymptoms = manualSymptomsInput.split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        try {
            const res = await apiClient.get("/api/symptoms/doctors", {
                params: {
                    organId: selectedOrgan.id,
                    symptomIds: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
                    manualSymptoms: manualSymptoms.length > 0 ? manualSymptoms : undefined
                }
            });
            setDoctors(res.data.doctors);
            setClinicalInsight(res.data.clinicalInsight);
            setConfidence(res.data.diagnosticConfidence);
        } catch (err) {
            toast.error("Diagnostic Search Blocked");
        } finally {
            setLoadingDoctors(false);
        }
    };

    const reset = () => {
        setSelectedRegion(null);
        setSelectedOrgan(null);
        setSelectedSymptoms([]);
        setManualSymptomsInput("");
        setDoctors([]);
        setClinicalInsight("");
        setConfidence(0);
        setCurrentStep('anatomy');
    };

    const getOrganIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('brain')) return <Brain size={24} />;
        if (n.includes('heart')) return <Heart size={24} />;
        if (n.includes('eye')) return <Eye size={24} />;
        if (n.includes('lungs')) return <Activity size={24} />;
        return <Activity size={24} />;
    }
    const stepInfo = {
        anatomy: { label: "Anatomy", description: "Region", num: 1 },
        focus: { label: "Focus", description: "Organ", num: 2 },
        symptoms: { label: "Symptoms", description: "Markers", num: 3 },
        results: { label: "Report", description: "AI Synthesis", num: 4 },
    };

    return (
        <div className="h-screen bg-[#FDFDFD] selection:bg-rose-100 selection:text-rose-700 font-sans overflow-hidden flex flex-col">
            {/* COMPACT HEADER */}
            <header className="z-[60] bg-white border-b border-slate-100 px-6 py-3">
                <div className="max-w-[1500px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
                        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                            <Activity className="text-white w-4 h-4" />
                        </div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tighter">HealthPath <span className="text-rose-600">MD</span></h1>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        {(Object.keys(stepInfo) as DiagnosticStep[]).map((stepKey, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${currentStep === stepKey ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-900/10" : "bg-slate-50 border-transparent text-slate-300"}`}>
                                    <span className="text-[9px] font-black">{stepInfo[stepKey].num}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest">{stepInfo[stepKey].label}</span>
                                </div>
                                {idx < 3 && <div className="w-4 h-[1px] bg-slate-100" />}
                            </div>
                        ))}
                    </div>

                    <button onClick={reset} className="p-2 text-slate-200 hover:text-rose-600 transition-colors"><RotateCcw size={16} /></button>
                </div>
            </header>

            <main className="flex-1 max-w-[1500px] mx-auto w-full p-4 overflow-hidden flex flex-col">
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden relative">
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            {/* STEP HEADER - COMPACT */}
                            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                                <div className="flex items-center gap-4">
                                    {(currentStep !== 'anatomy' && currentStep !== 'results') && (
                                        <button 
                                            onClick={() => {
                                                if (currentStep === 'focus') setCurrentStep('anatomy');
                                                if (currentStep === 'symptoms') setCurrentStep('focus');
                                            }}
                                            className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{stepInfo[currentStep].label}</h2>
                                        <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em]">{stepInfo[currentStep].description}</p>
                                    </div>
                                </div>
                                {currentStep === 'symptoms' && (
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleSearch} disabled={loadingDoctors} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2">
                                            {loadingDoctors ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={14} />}
                                            Analyze 
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* 1. ANATOMY */}
                                {currentStep === 'anatomy' && (
                                    <div className="h-full flex flex-col lg:flex-row items-center gap-10 md:gap-20 p-6 md:px-20 py-8">
                                        <div className="max-w-[300px] space-y-6">
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Localization Core</h3>
                                            <p className="text-slate-400 text-xs font-medium leading-relaxed">Map Concern Area</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {regions.map(r => (
                                                    <button key={r.id} onClick={() => handleRegionSelect(r.name)} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all text-left">
                                                        <span className="font-black text-[10px] uppercase tracking-widest">{r.name}</span>
                                                        <ChevronRight size={14} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full h-[580px] flex items-center justify-center">
                                            <div className="w-full h-full scale-105 lg:scale-110 transition-transform duration-700">
                                                <BodyVisual onSelect={handleRegionSelect} selectedRegion={selectedRegion?.name || null} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. FOCUS */}
                                {currentStep === 'focus' && (
                                    <div className="max-w-4xl mx-auto p-10">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {selectedRegion?.organs.map(organ => (
                                                <button key={organ.id} onClick={() => handleOrganSelect(organ)} className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-rose-100 hover:shadow-xl transition-all group">
                                                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-all">
                                                        {getOrganIcon(organ.name)}
                                                    </div>
                                                    <span className="font-black text-xs uppercase tracking-tight text-slate-900">{organ.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 3. SYMPTOMS */}
                                {currentStep === 'symptoms' && (
                                    <div className="max-w-4xl mx-auto p-10 space-y-12">
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Predefined Pathologies</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {symptoms.map(s => (
                                                    <button key={s.id} onClick={() => toggleSymptom(s.id)} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedSymptoms.includes(s.id) ? "bg-rose-600 border-rose-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"}`}>
                                                        <span className="font-black text-[11px]">{s.name}</span>
                                                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${selectedSymptoms.includes(s.id) ? "bg-white/20 border-white/40" : "bg-white border-slate-100"}`}>{selectedSymptoms.includes(s.id) && "✓"}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Custom Clinical Markers</h3>
                                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed">
                                                <input 
                                                    type="text"
                                                    value={manualSymptomsInput}
                                                    onChange={(e) => setManualSymptomsInput(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm font-bold text-slate-700 outline-none focus:border-rose-300 placeholder:text-slate-300 transition-all shadow-sm"
                                                    placeholder="Enter custom symptoms, separated by commas... (e.g. Sharp pain, Dizziness, Fatigue)"
                                                />
                                                <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Info size={12} className="text-rose-500" />
                                                    AI matches these against specialist databases in real-time.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <button onClick={handleSearch} disabled={loadingDoctors} className="px-12 py-5 bg-rose-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center gap-3 shadow-xl shadow-rose-200">
                                                {loadingDoctors ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={18} />}
                                                Generate Analysis
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 4. RESULTS */}
                                {currentStep === 'results' && (
                                    <div className="h-full">
                                        {loadingDoctors ? (
                                            <div className="h-full flex flex-col items-center justify-center p-20 space-y-10">
                                                <div className="relative">
                                                    <motion.div 
                                                        className="w-40 h-40 rounded-full border border-rose-100 flex items-center justify-center bg-rose-50/20"
                                                        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                    >
                                                        <Brain className="text-rose-600 w-16 h-16" />
                                                    </motion.div>
                                                    <motion.div 
                                                        className="absolute inset-0 rounded-full border-t-2 border-rose-500"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                    />
                                                </div>
                                                <div className="text-center space-y-4">
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Clinical Synthesis in Progress</h3>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <motion.div 
                                                            className="h-1 bg-slate-100 rounded-full w-64 overflow-hidden relative"
                                                        >
                                                            <motion.div 
                                                                className="absolute h-full w-1/3 bg-rose-600"
                                                                animate={{ left: ["-30%", "100%"] }}
                                                                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                                                            />
                                                        </motion.div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Mapping Specialists to Pathology...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-8 p-6 md:p-10">
                                                <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center"><Brain size={20} /></div>
                                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Autonomous Synthesis</h3>
                                                        </div>
                                                        <p className="text-xl font-black italic border-l-2 border-rose-600 pl-6">"{clinicalInsight}"</p>
                                                    </div>
                                                    <div className="flex-shrink-0 bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-3">
                                                        <ConfidenceGauge value={confidence} />
                                                        <span className="text-[9px] font-black uppercase text-slate-500">Faith Multiplier</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {doctors.map(doc => (
                                                        <div key={doc.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-rose-100 hover:shadow-xl transition-all flex flex-col items-center text-center gap-4">
                                                            <div className="w-20 h-20 rounded-2xl bg-rose-50 overflow-hidden shadow-sm">{doc.profilePicture ? <img src={doc.profilePicture} alt={doc.firstName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-rose-500 text-xl uppercase">{doc.firstName[0]}</div>}</div>
                                                            <div>
                                                                <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full">{doc.speciality}</span>
                                                                <h4 className="text-lg font-black text-slate-900">Dr. {doc.firstName} {doc.lastName}</h4>
                                                            </div>
                                                            <Link to={`/book-appointment?doctorId=${doc.id}`} className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-all">ConsulT <ChevronRight size={12} /></Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <footer className="p-4 bg-white border-t border-slate-50 flex justify-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    HealthPath MD AI Analysis • Diagnostic Only
                </p>
            </footer>
        </div>
    );
}
