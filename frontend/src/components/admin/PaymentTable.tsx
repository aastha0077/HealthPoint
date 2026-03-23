import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "./Pagination";

interface PaymentTableProps {
    appointments: any[];
    search: string;
    setSearch: (s: string) => void;
}

export function PaymentTable({ appointments, search, setSearch }: PaymentTableProps) {
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

    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search by patient name or transaction ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[1.25rem] text-sm focus:ring-4 focus:ring-rose-500/5 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 h-8">
                                <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400">Transaction ID</th>
                                <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400">Patient</th>
                                <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400 text-center">Amount & Status</th>
                                <th className="px-4 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Date/Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedPayments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                                        No transactions recorded
                                    </td>
                                </tr>
                            )}
                            {paginatedPayments.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-900 text-[13px]">{a.payment?.transactionId || 'PENDING'}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Method: {a.payment?.method}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-700 text-[13px]">{a.patient?.firstName} {a.patient?.lastName}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{a.patient?.user?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${a.payment?.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            a.payment?.status === 'REFUNDED' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                                            }`}>
                                            {a.payment?.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <p className="font-bold text-slate-700 text-[11px]">{new Date(a.dateTime).toLocaleDateString()}</p>
                                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-0.5">{new Date(a.dateTime).toLocaleTimeString()}</p>
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
