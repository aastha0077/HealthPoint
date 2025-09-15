import { Link } from "react-router";

// Define the Doctor interface
interface Doctor {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  createdAt: string;
  speciality: string;
  bio: string;
  address: string;
  available: boolean;
  department: {
    id: number;
    name: string;
    description: string;
  };
  timeSlots: any[];
}

// Define props interface
interface DoctorInfoCardProps {
  doctor: Doctor;
}

function DoctorInfoCard({ doctor }: DoctorInfoCardProps) {
  const doctorImageUrl = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop&crop=face`;

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200">
      {/* Compact Header with Image and Basic Info */}
      <div className="flex p-4 gap-4">
        {/* Doctor Image - Smaller */}
        <div className="relative flex-shrink-0">
          <img
            className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            src={doctorImageUrl}
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            onError={(e) => {
              e.currentTarget.src = `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&crop=face`;
            }}
          />
          <div className="absolute -top-1 -right-1">
            <span className={`${
              doctor.available 
                ? 'bg-emerald-500' 
                : 'bg-red-500'
            } text-white px-2 py-0.5 rounded-full text-xs font-semibold`}>
              {doctor.available ? '✓' : '✗'}
            </span>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <span className="text-red-600 font-medium text-sm">{doctor.department.name}</span>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-lg text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {doctor.speciality}
            </span>
          </div>
        </div>
      </div>

      {/* Bio - Compact */}
      <div className="px-4 pb-3">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {doctor.bio}
        </p>
      </div>

      {/* Contact Info - Inline */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{doctor.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{doctor.contactNumber}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Compact */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Link to="/book-appointment" className="flex-1">
            <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/25">
              Book Appointment
            </button>
          </Link>
          <button className="bg-white text-red-600 border border-red-200 hover:border-red-300 hover:bg-red-50 p-2 rounded-lg transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export { DoctorInfoCard, type Doctor };
