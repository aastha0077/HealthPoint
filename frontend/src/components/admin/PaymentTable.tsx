import { Search, FileDown, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "./Pagination";

interface PaymentTableProps {
    appointments: any[];
    search: string;
    setSearch: (s: string) => void;
    onExport?: () => void;
}

export function PaymentTable({ appointments, search, setSearch, onExport }: PaymentTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const filteredPayments = appointments.filter(a => {
        const matchesSearch = (a.patient?.firstName + " " + a.patient?.lastName).toLowerCase().includes(search.toLowerCase()) ||
            a.payment?.transactionId?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch && a.payment;
    });

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const statusColors: Record<string, string> = {
        COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        PENDING: "bg-amber-50 text-amber-600 border-amber-100",
        FAILED: "bg-red-50 text-red-500 border-red-100",
        REFUNDED: "bg-violet-50 text-violet-600 border-violet-100",
        REFUND_REQUESTED: "bg-orange-50 text-orange-500 border-orange-100",
    };

    const dotColors: Record<string, string> = {
        COMPLETED: "bg-emerald-500",
        PENDING: "bg-amber-500 animate-pulse",
        FAILED: "bg-red-500",
        REFUNDED: "bg-violet-500",
        REFUND_REQUESTED: "bg-orange-500",
    };

    return (
        <div className="space-y-6">
            {/* Search & Export Bar */}
            <div className="flex flex-col md:flex-row gap-2.5">
                <div className="bg-white/80 backdrop-blur-xl p-1.5 rounded-xl shadow-sm border border-slate-100 flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder="Search by patient name or transaction ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-100 rounded-lg text-xs focus:ring-2 focus:ring-rose-500/10 focus:bg-white focus:border-rose-200 transition-all font-bold text-slate-700 outline-none"
                        />
                    </div>
                </div>
                {onExport && (
                    <button
                        onClick={onExport}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/50"
                    >
                        <FileDown size={14} className="text-rose-400" />
                        Export Ledger
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-100">
                                <th className="px-4 py-3 text-[9px] uppercase font-black tracking-widest text-slate-400">Transaction</th>
                                <th className="px-4 py-3 text-[9px] uppercase font-black tracking-widest text-slate-400">Patient</th>
                                <th className="px-4 py-3 text-[9px] uppercase font-black tracking-widest text-slate-400">Amount</th>
                                <th className="px-4 py-3 text-[9px] uppercase font-black tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-4 py-3 text-[9px] uppercase font-black tracking-widest text-slate-400 text-right">Date/Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedPayments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <CreditCard size={32} className="text-slate-200" />
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">No transactions recorded</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {paginatedPayments.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/70 transition-all group">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                <CreditCard size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-xs font-mono">{a.payment?.transactionId || 'PENDING'}</p>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{a.payment?.method}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 font-black text-[9px] border border-rose-100/50">
                                                {(a.patient?.firstName || "P")[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-xs">{a.patient?.firstName} {a.patient?.lastName}</p>
                                                <p className="text-[8px] font-bold text-slate-400 mt-0.5">{a.patient?.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <p className="font-black text-slate-900 text-xs">Rs. {a.payment?.amount || '—'}</p>
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${statusColors[a.payment?.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                            <span className={`w-1 h-1 rounded-full ${dotColors[a.payment?.status] || 'bg-slate-400'}`} />
                                            {a.payment?.status === 'REFUND_REQUESTED' ? 'REFUND REQ' : a.payment?.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <p className="font-bold text-slate-700 text-[10px]">{new Date(a.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(a.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredPayments.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
}
