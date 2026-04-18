import { Search, Calendar, Filter, AlignLeft, Trash2, FileDown, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "./Pagination";
import { ConfirmModal } from "./ConfirmModal";
import { TableStatsRow, type StatItem } from "./TableStatsRow";
import { ExportDropdown } from "@/components/common/ExportDropdown";
import { AssetPreviewModal } from "../common/AssetPreviewModal";


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
    onExport?: (title: string, columns: string[], data: any[]) => void;
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
    const itemsPerPage = 10;
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean; title: string; message: string; onConfirm: () => void; type: 'DANGER' | 'WARNING' | 'INFO';
    }>({ show: false, title: "", message: "", onConfirm: () => { }, type: 'INFO' });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Reset page on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, deptFilter]);

    const filteredAppts = (appointments || []).filter(a => {
        const docFirstName = a.doctor?.user?.firstName || a.doctor?.firstName || "";
        const docLastName = a.doctor?.user?.lastName || a.doctor?.lastName || "";
        const matchesSearch = (a.patient?.firstName + " " + a.patient?.lastName).toLowerCase().includes(search.toLowerCase()) ||
            (docFirstName + " " + docLastName).toLowerCase().includes(search.toLowerCase());
        const isRefunded = a.refundRequest?.status === 'COMPLETED' || a.payment?.status === 'REFUNDED';
        const matchesStatus = statusFilter === 'ALL' || 
            (statusFilter === 'REFUNDED' ? isRefunded : a.status === statusFilter);
        const matchesDept = deptFilter === 'ALL' || a.doctor?.departmentId?.toString() === deptFilter;
        return matchesSearch && matchesStatus && matchesDept;
    }).sort((a, b) => {
        const aStatus = a.refundRequest?.status === 'COMPLETED' ? 'REFUNDED' : (a.refundRequest ? 'REF_REQ' : a.status);
        const bStatus = b.refundRequest?.status === 'COMPLETED' ? 'REFUNDED' : (b.refundRequest ? 'REF_REQ' : b.status);
        
        const priority: Record<string, number> = { REF_REQ: 0, REFUNDED: 1, BOOKED: 2, COMPLETED: 3, CANCELLED: 4 };
        const pA = priority[aStatus] ?? 5;
        const pB = priority[bStatus] ?? 5;
        
        if (pA !== pB) return pA - pB;
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });

    const totalPages = Math.ceil(filteredAppts.length / itemsPerPage);
    const paginatedAppts = filteredAppts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const paymentStatusBadge = (payment: any, refundRequest?: any) => {
        const status = refundRequest?.status === 'COMPLETED' ? 'REFUNDED' : (refundRequest ? 'REF_REQ' : (payment?.status || 'PENDING'));
        const method = payment?.method || 'CASH';
        const colors: Record<string, string> = {
            COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
            PENDING: "bg-amber-50 text-amber-600 border-amber-100",
            FAILED: "bg-red-50 text-red-500 border-red-100",
            REFUNDED: "bg-violet-50 text-violet-600 border-violet-100 shadow-sm shadow-violet-100",
            REF_REQ: "bg-orange-50 text-orange-500 border-orange-100 animate-pulse",
            REFUND_REQUESTED: "bg-orange-50 text-orange-500 border-orange-100",
        };
        return (
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${colors[status] || "bg-slate-50 text-slate-500 border-slate-100"}`}>
                        <span className={`w-1 h-1 rounded-full ${
                            status === 'COMPLETED' ? 'bg-emerald-500' :
                            status === 'REFUNDED' ? 'bg-violet-500' :
                            status === 'REF_REQ' ? 'bg-orange-500' :
                            'bg-slate-400'
                        }`} />
                        {status}
                    </span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase">{method}</span>
                    {refundRequest?.proofUrl && (
                        <button 
                            onClick={() => setPreviewUrl(refundRequest.proofUrl)}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-all border border-slate-100" 
                            title="Preview Refund Proof"
                        >
                            <Eye size={11} />
                        </button>
                    )}
                </div>
                {refundRequest?.adminNotes && (
                    <div className="flex flex-col bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/50">
                        <p className="text-[7px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">Admin Note:</p>
                        <p className="text-[8px] font-bold text-emerald-600 leading-tight">
                            {refundRequest.adminNotes}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const stats: StatItem[] = [
        { label: "Total Booked", value: appointments.length, color: "slate" },
        { label: "Completed", value: appointments.filter(a => a.status === 'COMPLETED').length, color: "emerald" },
        { label: "Pending Booking", value: appointments.filter(a => a.status === 'BOOKED').length, color: "blue" },
        { label: "Cancelled", value: appointments.filter(a => a.status === 'CANCELLED').length, color: "rose" }
    ];

    return (
        <div className="space-y-6">
            <TableStatsRow stats={stats} />
            {/* Filter Bar */}
            <div className="bg-white/80 backdrop-blur-xl p-2.5 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-2.5 items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                        type="text"
                        placeholder="Search patient or doctor name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-100 rounded-lg text-xs focus:ring-2 focus:ring-rose-500/10 focus:bg-white focus:border-rose-200 transition-all font-bold text-slate-700 outline-none"
                    />
                </div>
                <div className="flex gap-2.5 items-center">
                    {onExport && (
                        <ExportDropdown 
                            onExportAll={() => onExport("All Appointments", ["ID", "Patient", "Doctor", "Date", "Status"], filteredAppts.map(a => ({
                                id: a.appointmentNumber || a.id?.toString(),
                                patient: `${a.patient?.firstName} ${a.patient?.lastName}`,
                                doctor: `Dr. ${a.doctor?.user?.firstName || a.doctor?.firstName} ${a.doctor?.user?.lastName || a.doctor?.lastName}`,
                                date: new Date(a.dateTime).toLocaleDateString(),
                                status: a.status
                            })))}
                            onExportPage={() => onExport("Appointments (Page)", ["ID", "Patient", "Doctor", "Date", "Status"], paginatedAppts.map(a => ({
                                id: a.appointmentNumber || a.id?.toString(),
                                patient: `${a.patient?.firstName} ${a.patient?.lastName}`,
                                doctor: `Dr. ${a.doctor?.user?.firstName || a.doctor?.firstName} ${a.doctor?.user?.lastName || a.doctor?.lastName}`,
                                date: new Date(a.dateTime).toLocaleDateString(),
                                status: a.status
                            })))}
                        />
                    )}
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={12} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-8 pr-7 py-2 bg-slate-50/80 border border-slate-100 rounded-lg text-[10px] font-black text-slate-700 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-200 outline-none cursor-pointer appearance-none transition-all uppercase tracking-widest"
                        >
                            <option value="ALL">All Status</option>
                            <option value="BOOKED">Booked</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                    <div className="relative group">
                        <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={12} />
                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="pl-8 pr-7 py-2 bg-slate-50/80 border border-slate-100 rounded-lg text-[10px] font-black text-slate-700 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-200 outline-none cursor-pointer appearance-none transition-all uppercase tracking-widest"
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400">Patient</th>
                                <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400">Doctor</th>
                                <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400">Schedule</th>
                                <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400">Status</th>
                                <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400">Payment</th>
                                <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedAppts.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/70 transition-all group">
                                    <td className="px-3 py-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[9px]">
                                                {(a.patient?.firstName || "P")[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-[11px]">{a.patient?.firstName} {a.patient?.lastName}</p>
                                                <p className="text-[7px] font-bold text-slate-400">{a.patient?.gender} • {a.patient?.age}y</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-1.5">
                                        <p className="font-bold text-slate-700 text-[11px]">Dr. {a.doctor?.user?.firstName || a.doctor?.firstName} {a.doctor?.user?.lastName || a.doctor?.lastName}</p>
                                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">{a.doctor?.department?.name || 'Registry'}</p>
                                    </td>
                                    <td className="px-3 py-1.5">
                                        <p className="text-slate-700 font-bold text-[10px]">
                                            {new Date(a.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-[7px] font-bold text-slate-400">
                                            {new Date(a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-3 py-1.5">
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${a.status === 'BOOKED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            a.status === 'IN_PROGRESS' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                            'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            <span className={`w-1 h-1 rounded-full ${
                                                a.status === 'BOOKED' ? 'bg-blue-500' :
                                                a.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                a.status === 'IN_PROGRESS' ? 'bg-violet-500 animate-pulse' :
                                                'bg-rose-500'
                                            }`} />
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5">
                                        {paymentStatusBadge(a.payment, a.refundRequest)}
                                    </td>
                                    <td className="px-3 py-1.5 text-right">
                                        <div className="flex items-center justify-end gap-0.5">
                                            {onDownloadInvoice && (
                                                <button 
                                                    onClick={() => onDownloadInvoice(a.id)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all"
                                                    title="Generate Invoice"
                                                >
                                                    <AlignLeft size={11} />
                                                </button>
                                            )}
                                            <button onClick={() => setConfirmModal({
                                                show: true,
                                                title: "Delete Appointment",
                                                message: `Are you sure you want to delete the appointment for ${a.patient?.firstName} ${a.patient?.lastName}?`,
                                                type: 'DANGER',
                                                onConfirm: () => onDelete(a.id)
                                            })} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all" title="Delete Appointment">
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedAppts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center">
                                        <Calendar size={24} className="text-slate-200 mx-auto mb-2" />
                                        <p className="font-black uppercase tracking-widest text-[9px] text-slate-400">No matching appointments</p>
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
            <AssetPreviewModal 
                url={previewUrl} 
                title="Refund Proof" 
                onClose={() => setPreviewUrl(null)} 
            />
        </div>
    );
}
