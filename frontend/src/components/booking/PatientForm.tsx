import React from "react";

interface PatientFormData {
    firstName: string;
    lastName: string;
    district: string;
    municipality: string;
    wardNo: string;
    gender: string;
}

interface PatientFormProps {
    formData: PatientFormData;
    onChange: (data: PatientFormData) => void;
    onCancel: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ formData, onChange, onCancel }) => {
    const handleChange = (field: keyof PatientFormData, value: string) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                    <input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={e => handleChange("firstName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                    <input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={e => handleChange("lastName", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5 ml-1">District</label>
                    <input
                        type="text"
                        placeholder="Rupandehi"
                        value={formData.district}
                        onChange={e => handleChange("district", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5 ml-1">Municipality</label>
                    <input
                        type="text"
                        placeholder="Butwal"
                        value={formData.municipality}
                        onChange={e => handleChange("municipality", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5 ml-1">Ward No</label>
                    <input
                        type="number"
                        placeholder="1"
                        value={formData.wardNo}
                        onChange={e => handleChange("wardNo", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-1.5 ml-1">Gender</label>
                    <select
                        value={formData.gender}
                        onChange={e => handleChange("gender", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <button
                onClick={onCancel}
                className="text-sm font-medium text-rose-400 hover:text-rose-600 transition-colors ml-1"
            >
                ← Back to selection
            </button>
        </div>
    );
};
