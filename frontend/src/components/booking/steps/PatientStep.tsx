import React from "react";
import { UserPlus, Plus, RefreshCw } from "lucide-react";
import { PatientCard } from "../PatientCard";
import { PatientForm } from "../PatientForm";

interface PatientStepProps {
    loadingPatients: boolean;
    isAddingPatient: boolean;
    setIsAddingPatient: (val: boolean) => void;
    patients: any[];
    selectedPatient: any;
    onSelectPatient: (patient: any) => void;
    fetchPatients: () => void;
    newPatient: any;
    onNewPatientChange: (data: any) => void;
}

export const PatientStep: React.FC<PatientStepProps> = ({
    loadingPatients,
    isAddingPatient,
    setIsAddingPatient,
    patients,
    selectedPatient,
    onSelectPatient,
    fetchPatients,
    newPatient,
    onNewPatientChange
}) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-rose-800">Select Patient</h2>
                    <p className="text-xs text-slate-500">Who is this appointment for?</p>
                </div>
                {!isAddingPatient && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchPatients}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Refresh Patient List"
                        >
                            <RefreshCw size={18} className={loadingPatients ? "animate-spin" : ""} />
                        </button>
                        <button
                            onClick={() => setIsAddingPatient(true)}
                            className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-100 hover:bg-rose-100 transition-all"
                        >
                            <UserPlus size={16} /> Add New
                        </button>
                    </div>
                )}
            </div>

            {loadingPatients ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-rose-50 animate-pulse" />
                    ))}
                </div>
            ) : isAddingPatient ? (
                <PatientForm
                    formData={newPatient}
                    onChange={onNewPatientChange}
                    onCancel={() => setIsAddingPatient(false)}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patients.map((pat) => (
                        <PatientCard
                            key={pat.id}
                            patient={pat}
                            isSelected={selectedPatient?.id === pat.id}
                            onSelect={onSelectPatient}
                        />
                    ))}
                    <div
                        onClick={() => setIsAddingPatient(true)}
                        className="p-4 rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 hover:bg-rose-50 cursor-pointer transition-all flex items-center justify-center gap-2 text-rose-400 hover:text-rose-600"
                    >
                        <Plus size={20} />
                        <span className="font-bold text-sm">Add New Patient</span>
                    </div>
                </div>
            )}
        </div>
    );
};
