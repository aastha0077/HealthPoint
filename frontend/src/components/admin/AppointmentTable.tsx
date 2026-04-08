import { Search, Calendar, Filter, AlignLeft, Trash2, FileDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "./Pagination";
import { ConfirmModal } from "./ConfirmModal";

interface AppointmentTableProps {
    appointments: any[];
    search: string;
    setSearch: (s: string) => void;
    statusFilter: string;
    setStatusFilter: (s: string) => void;
    deptFilter: string;
    setDeptFilter: (s: string) => void;
    departments: any[];
    onDelete: (id: number) => void;
    onExport?: () => void;
    onDownloadInvoice?: (id: number) => void;
}

export function AppointmentTable({
    appointments,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    deptFilter,
    setDeptFilter,
    departments,
    onDelete,
    onExport,
    onDownloadInvoice
}: AppointmentTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean; title: string; message: string; onConfirm: () => void; type: 'DANGER' | 'WARNING' | 'INFO';
    }>({ show: false, title: "", message: "", onConfirm: () => { }, type: 'INFO' });

    // Reset page on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, deptFilter]);

    const filteredAppts = (appointments || []).filter(a => {
        const docFirstName = a.doctor?.user?.firstName || a.doctor?.firstName || "";
        const docLastName = a.doctor?.user?.lastName || a.doctor?.lastName || "";
        const matchesSearch = (a.patient?.firstName + " " + a.patient?.lastName).toLowerCase().includes(search.toLowerCase()) ||
            (docFirstName + " " + docLastName).toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
        const matchesDept = deptFilter === 'ALL' || a.doctor?.departmentId?.toString() === deptFilter;
        return matchesSearch && matchesStatus && matchesDept;
    });

    const totalPages = Math.ceil(filteredAppts.length / itemsPerPage);
    const paginatedAppts = filteredAppts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search patient or doctor name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-500/5 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                    />
                </div>
                <div className="flex gap-4">
                    {onExport && (
                        <button 
                            onClick={onExport}
                            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                        >
                            <FileDown size={16} className="text-rose-500" />
                            Export List
                        </button>
                    )}
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-rose-500/5 focus:bg-white outline-none cursor-pointer appearance-none transition-all uppercase tracking-widest"
                        >
                            <option value="ALL">All Status</option>
                            <option value="BOOKED">Booked</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="relative group">
                        <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-rose-500/5 focus:bg-white outline-none cursor-pointer appearance-none transition-all uppercase tracking-widest"
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id.toString()}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">Patient Details</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">Doctor & Dept</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">Schedule</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">Status Info</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">Payment</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedAppts.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-900 text-[13px]">{a.patient?.firstName} {a.patient?.lastName}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{a.patient?.gender}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{a.patient?.age} YRS</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-700 text-[13px]">Dr. {a.doctor?.user?.firstName || a.doctor?.firstName} {a.doctor?.user?.lastName || a.doctor?.lastName}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{a.doctor?.department?.name || 'Registry'}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                                            <Calendar size={12} className="text-slate-400" />
                                            {new Date(a.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-5">
                                            {new Date(a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${a.status === 'BOOKED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-[9px] font-black text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 inline-block uppercase tracking-widest bg-slate-50">
                                            {a.payment?.method || 'CASH'} • {a.payment?.status || 'PENDING'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {onDownloadInvoice && (
                                                <button 
                                                    onClick={() => onDownloadInvoice(a.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all border border-blue-100"
                                                    title="Generate Invoice"
                                                >
                                                    <AlignLeft size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => setConfirmModal({
                                                show: true,
                                                title: "Delete Appointment",
                                                message: `Are you sure you want to delete the appointment for ${a.patient?.firstName} ${a.patient?.lastName}?`,
                                                type: 'DANGER',
                                                onConfirm: () => onDelete(a.id)
                                            })} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all border border-transparent hover:border-rose-100" title="Delete Appointment">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedAppts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Calendar size={48} />
                                            <p className="font-black uppercase tracking-widest text-xs">No matching appointments discovered</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredAppts.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
