import React from "react";

interface PatientCardProps {
    patient: any;
    isSelected: boolean;
    onSelect: (patient: any) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, isSelected, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(patient)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all
        ${isSelected ? "border-rose-500 bg-rose-50 shadow-md shadow-rose-100" : "border-rose-100 hover:border-rose-300"}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
          ${isSelected ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-600"}`}>
                    {patient.firstName?.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-slate-800 leading-tight">{patient.firstName} {patient.lastName}</p>
                    <p className="text-xs text-slate-400 mt-1">{patient.gender} • {patient.municipality}</p>
                </div>
            </div>
        </div>
    );
};
