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

    const paymentStatusBadge = (payment: any) => {
        const status = payment?.status || 'PENDING';
        const method = payment?.method || 'CASH';
        const colors: Record<string, string> = {
            COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
            PENDING: "bg-amber-50 text-amber-600 border-amber-100",
            FAILED: "bg-red-50 text-red-500 border-red-100",
            REFUNDED: "bg-violet-50 text-violet-600 border-violet-100",
            REFUND_REQUESTED: "bg-orange-50 text-orange-500 border-orange-100",
        };
        return (
            <div className="flex flex-col gap-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${colors[status] || "bg-slate-50 text-slate-500 border-slate-100"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                        status === 'COMPLETED' ? 'bg-emerald-500' :
                        status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                        status === 'REFUNDED' ? 'bg-violet-500' :
                        'bg-slate-400'
                    }`} />
                    {status === 'REFUND_REQUESTED' ? 'REFUND REQ' : status}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider pl-1">{method}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search patient or doctor name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/10 focus:bg-white focus:border-rose-200 transition-all font-bold text-slate-700 outline-none"
                    />
                </div>
                <div className="flex gap-3 items-center">
                    {onExport && (
                        <button 
                            onClick={onExport}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/50 flex items-center gap-2"
                        >
                            <FileDown size={14} className="text-rose-400" />
                            Export
                        </button>
                    )}
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={14} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2.5 bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-black text-slate-700 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-200 outline-none cursor-pointer appearance-none transition-all uppercase tracking-widest"
                        >
                            <option value="ALL">All Status</option>
                            <option value="BOOKED">Booked</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="relative group">
                        <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={14} />
                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="pl-9 pr-8 py-2.5 bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-black text-slate-700 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-200 outline-none cursor-pointer appearance-none transition-all uppercase tracking-widest"
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id.toString()}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-100">
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Patient Details</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Doctor & Dept</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Schedule</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Payment</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedAppts.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/70 transition-all group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-500 font-black text-xs border border-slate-100">
                                                {(a.patient?.firstName || "P")[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-[13px]">{a.patient?.firstName} {a.patient?.lastName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">{a.patient?.gender}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{a.patient?.age} YRS</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <p className="font-bold text-slate-700 text-[13px]">Dr. {a.doctor?.user?.firstName || a.doctor?.firstName} {a.doctor?.user?.lastName || a.doctor?.lastName}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{a.doctor?.department?.name || 'Registry'}</p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                                            <Calendar size={11} className="text-slate-400" />
                                            {new Date(a.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-4 mt-0.5">
                                            {new Date(a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${a.status === 'BOOKED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            a.status === 'IN_PROGRESS' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                            'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                a.status === 'BOOKED' ? 'bg-blue-500' :
                                                a.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                a.status === 'IN_PROGRESS' ? 'bg-violet-500 animate-pulse' :
                                                'bg-rose-500'
                                            }`} />
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {paymentStatusBadge(a.payment)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {onDownloadInvoice && (
                                                <button 
                                                    onClick={() => onDownloadInvoice(a.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
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
                                            })} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100" title="Delete Appointment">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedAppts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Calendar size={40} className="text-slate-200" />
                                            <p className="font-black uppercase tracking-widest text-xs text-slate-400">No matching appointments discovered</p>
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
