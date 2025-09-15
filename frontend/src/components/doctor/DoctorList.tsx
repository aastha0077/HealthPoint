import { useEffect, useState } from "react";
import { DoctorInfoCard, type Doctor } from "./DoctorInfoCard";
import { apiClient } from "@/apis/apis";
import { Loading } from "../Loading";
import { Error } from "../Error";

interface PaginatedResponse {
  doctors: Doctor[];
  totalDoctors: number;
}

function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const pageSize = 6; // Number of doctors per page

  useEffect(() => {
    getDoctors(currentPage);
  }, [currentPage]);

  async function getDoctors(pageNumber: number) {
    try {
      setLoading(true);
      const res = await apiClient.get<PaginatedResponse>(`/api/doctors/${pageNumber}/${pageSize}`);
      setDoctors(res.data.doctors);
      setTotalDoctors(res.data.totalDoctors);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  }

  if (error) {
    return (
      <Error message="Unable to fetch doctors list. Please check your connection and try again." />
    );
  }

  if (loading) {
    return <Loading />;
  }

  const totalPages = Math.ceil(totalDoctors / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 mx-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 text-sm font-medium rounded-lg ${
            currentPage === i
              ? 'text-white bg-red-600 border border-red-600'
              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 mx-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return buttons;
  };

  return (
    <div className="container mx-auto px-4 pt-10 pb-8">
      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {doctors.map((doctor, index) => (
          <DoctorInfoCard
            key={doctor.id || index}
            doctor={doctor}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4 mt-8">
          <div className="flex items-center justify-center flex-wrap">
            {renderPaginationButtons()}
          </div>
          <div className="text-sm text-gray-700 text-center">
            Showing page {currentPage} of {totalPages} ({totalDoctors} total doctors)
          </div>
        </div>
      )}

      {/* Show message when no doctors found */}
      {doctors.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No doctors found</div>
        </div>
      )}
    </div>
  );
}

export { DoctorList };
