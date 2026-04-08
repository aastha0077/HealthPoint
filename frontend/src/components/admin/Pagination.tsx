import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        // Always show first page
        pages.push(1);

        if (currentPage > 3) pages.push('start-dots');

        // Pages around current
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push('end-dots');

        // Always show last page
        pages.push(totalPages);

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-5 bg-gradient-to-r from-slate-50/80 to-white border-t border-slate-100">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span className="hidden sm:inline">Showing</span>
                <span className="text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{startItem}</span>
                <span>–</span>
                <span className="text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{endItem}</span>
                <span>of</span>
                <span className="text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{totalItems}</span>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all border border-transparent hover:border-rose-100 disabled:hover:border-transparent"
                >
                    <ChevronLeft size={18} />
                </button>

                {getPageNumbers().map((item) => {
                    if (typeof item === 'string') {
                        return (
                            <span key={item} className="w-9 h-9 flex items-center justify-center text-slate-300 text-xs font-bold">
                                •••
                            </span>
                        );
                    }

                    return (
                        <button
                            key={item}
                            onClick={() => onPageChange(item)}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                                currentPage === item
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-300/50 scale-105"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            {item}
                        </button>
                    );
                })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all border border-transparent hover:border-rose-100 disabled:hover:border-transparent"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
