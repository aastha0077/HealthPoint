import { Link } from "react-router";

interface Doctor {
  name: string;
  qualifications: string[];
  specialities: string[];
}

function DoctorInfoCard(doctor: Doctor) {
  const doctorImageUrl = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop&crop=face`;

  return (
    <div className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Doctor Image */}
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          src={doctorImageUrl}
          alt={`Dr. ${doctor.name}`}
          onError={(e) => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&crop=face`;
          }}
        />
        <div className="absolute top-3 right-3">
          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            Available
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Doctor Name */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Dr. {doctor.name}
        </h2>

        {/* Qualifications */}
        <div className="mb-4">
          <h3 className="font-medium text-red-600 text-sm mb-2">
            Qualifications
          </h3>
          <div className="flex flex-wrap gap-1">
            {doctor.qualifications.map((qualification, index) => (
              <span
                key={index}
                className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs"
              >
                {qualification}
              </span>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-5">
          <h3 className="font-medium text-red-600 text-sm mb-2">Specialties</h3>
          <div className="flex flex-wrap gap-1">
            {doctor.specialities.map((speciality, index) => (
              <span
                key={index}
                className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
              >
                {speciality}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium">
            <Link to={"/book-appointment"} >Book Appointment</Link>
          </button>
          <button className="flex-1 bg-white text-red-600 border border-red-600 hover:bg-red-50 py-2 px-3 rounded text-sm font-medium">
            Call Now
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>PLU Hospital</span>
            <span>Available Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DoctorInfoCard, type Doctor };
