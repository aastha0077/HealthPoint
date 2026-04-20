import { useEffect, useState, useRef, useCallback } from "react";
import { DoctorInfoCard, type Doctor } from "./DoctorInfoCard";
import { apiClient } from "@/apis/apis";
import { Error } from "../Error";
import { Search, Stethoscope, ChevronDown, Activity, Heart, LayoutGrid, List } from "lucide-react";
import { useFavorites } from "@/contexts/FavoriteContext";
import { useAuth } from "@/contexts/AuthProvider";

interface PaginatedResponse {
  doctors: Doctor[];
  totalDoctors: number;
}

interface Department {
  id: number;
  name: string;
}

import { AIAnalyzerMiniCard } from "../dashboard/AIAnalyzerCard";

function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const pageSize = 6;

  const { favorites, isFavorite } = useFavorites();
  const auth = useAuth();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastDoctorElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !showFavourites) {
        setCurrentPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, showFavourites]);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await apiClient.get<Department[]>("/api/departments");
        setDepartments(res.data);
      } catch {
        console.error("Failed to fetch departments");
      }
    }
    fetchDepartments();
  }, []);

  // Reset when filters change
  useEffect(() => {
    if (showFavourites) return; // Favourites are filtered client-side
    setDoctors([]);
    setCurrentPage(1);
    setHasMore(true);
    getDoctors(1, true);
  }, [search, departmentId]);

  // Load more on page change
  useEffect(() => {
    if (currentPage > 1 && !showFavourites) {
      getDoctors(currentPage, false);
    }
  }, [currentPage]);

  async function getDoctors(pageNumber: number, isNewSearch: boolean) {
    try {
      setLoading(true);
      if (pageNumber > 1) {
        await new Promise(resolve => setTimeout(resolve, 800)); // slightly faster feel
      }
      const res = await apiClient.get<PaginatedResponse>(`/api/doctors/${pageNumber}/${pageSize}`, {
        params: {
          search: search || undefined,
          departmentId: departmentId || undefined
        }
      });
      const newDoctors = res.data.doctors;
      
      if (isNewSearch) {
        setDoctors(newDoctors);
        setTotalDoctors(res.data.totalDoctors);
      } else {
        setDoctors(prev => {
          const existingIds = new Set(prev.map(d => d.doctorId ?? d.id));
          const filteredNew = newDoctors.filter(d => !existingIds.has(d.doctorId ?? d.id));
          return [...prev, ...filteredNew];
        });
      }
      
      setHasMore(newDoctors.length === pageSize);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return <Error message="Unable to fetch doctors list. Please check your connection and try again." />;
  }

  // When showing favourites, filter from loaded doctors or fetch all favourited
  const displayedDoctors = showFavourites
    ? doctors.filter(d => isFavorite(d.doctorId ?? d.id))
    : doctors;

  return (
    <div className="min-h-screen bg-rose-50/20 selection:bg-rose-100 selection:text-rose-700">
      {/* Hero Header with Filters */}
      <section className="bg-white pt-20 pb-8 relative overflow-hidden border-b border-rose-100">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                Trusted Specialists
              </div>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                Our Expert <span className="text-rose-600">Health Point Specialists</span>
              </h1>

              {/* Filter tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFavourites(false)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${!showFavourites
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  All Doctors
                </button>
                {auth?.isAuthenticated && (
                  <button
                    onClick={() => setShowFavourites(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${showFavourites
                      ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                      : "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${showFavourites ? "fill-white" : "fill-rose-500"}`} />
                    Favourites
                    {favorites.length > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${showFavourites ? "bg-white/25 text-white" : "bg-rose-100 text-rose-600"}`}>
                        {favorites.length}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Search & Dept Filter (hidden in favourites mode) */}
              {!showFavourites && (
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-rose-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="relative w-full sm:w-56 group">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value ? parseInt(e.target.value) : "")}
                      className="w-full pl-9 pr-8 py-2 text-xs appearance-none rounded-xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-8 pb-1">
              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-lg transition-all ${view === "grid" ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">
                    {showFavourites ? displayedDoctors.length : totalDoctors}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {showFavourites ? "Saved" : "Results"}
                  </p>
                </div>
                <div className="w-px h-10 bg-rose-100" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-rose-600 mb-0.5">
                    <Activity className="w-4 h-4" />
                    <p className="text-2xl font-black">24/7</p>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Clinic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* AI Analyzer entry point - now a subtle mini-card */}
        {!showFavourites && !search && !departmentId && (
          <div className="mb-12">
            <AIAnalyzerMiniCard />
          </div>
        )}

        {/* Favourites empty state */}
        {showFavourites && displayedDoctors.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-rose-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Favourites Yet</h3>
            <p className="text-slate-400 font-medium">Tap the ❤️ on any doctor's card to save them here.</p>
            <button
              onClick={() => setShowFavourites(false)}
              className="mt-8 px-8 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
            >
              Browse All Doctors
            </button>
          </div>
        )}

        {/* Doctor Grid/List */}
        {displayedDoctors.length > 0 && (
          <div className={`grid gap-8 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {displayedDoctors.map((doctor, index) => {
              const isLast = !showFavourites && index === displayedDoctors.length - 1;
              return (
                <div ref={isLast ? lastDoctorElementRef : undefined} key={doctor.id ?? index}>
                  <DoctorInfoCard doctor={doctor} view={view} />
                </div>
              );
            })}
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="py-12 flex justify-center">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-rose-100 shadow-sm">
              <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-black text-rose-600 uppercase tracking-widest">Loading Specialists...</span>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !showFavourites && doctors.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-rose-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Doctors Found</h3>
            <p className="text-slate-400 font-medium">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => { setSearch(""); setDepartmentId(""); }}
              className="mt-8 px-8 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* End message */}
        {!hasMore && !showFavourites && doctors.length > 0 && (
          <div className="text-center py-16">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              You've reached the end of our specialist list
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { DoctorList };

