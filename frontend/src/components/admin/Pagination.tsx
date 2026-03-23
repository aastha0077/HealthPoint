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

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 bg-white border-t border-slate-50">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Showing <span className="text-slate-900">{startItem}</span> to <span className="text-slate-900">{endItem}</span> of <span className="text-slate-900">{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronLeft size={20} />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isDots = totalPages > 7 && (
                        (page > 1 && page < currentPage - 2) ||
                        (page < totalPages && page > currentPage + 2)
                    );

                    if (isDots && (page === 2 || page === totalPages - 1)) {
                        return <span key={page} className="px-2 text-slate-300">...</span>;
                    }
                    if (isDots) return null;

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[40px] h-10 rounded-xl text-xs font-black transition-all ${
                                currentPage === page
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
