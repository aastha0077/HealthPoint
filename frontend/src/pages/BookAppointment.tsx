import Calendar20 from "@/components/calendar-20";

// Types
interface Doctor {
  name: string;
  age: number;
  experience: string;
  qualification: string;
  image: string;
  speciality: string;
}

interface DoctorInfoProps {
  doctor: Doctor;
}

interface EducationProps {
  education: string[];
}

interface PublicationsProps {
  publications: string[];
}

// Doctor Information Component
function DoctorInfo({ doctor }: DoctorInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-48 h-48 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{doctor.name}</h1>
          <p className="text-gray-600 mt-1">{doctor.age} Years Old</p>
          <p className="text-gray-600">{doctor.experience} of experience</p>
          <p className="text-gray-600">{doctor.qualification}</p>
          <div className="mt-4">
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              {doctor.speciality}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Education Component
function Education({ education }: EducationProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Education</h2>
      <ul className="space-y-3">
        {education.map((item: string, index: number) => (
          <li key={index} className="flex items-start">
            <span className="bg-blue-500 text-white p-1 rounded-full mr-3 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Publications Component
function Publications({ publications }: PublicationsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Research & Publications
        </h2>
      </div>
      
      <div className="space-y-4">
        {publications.map((pub: string, index: number) => (
          <div key={index} className="group hover:bg-gray-50 p-4 rounded-lg transition-colors duration-200 border border-gray-100 hover:border-blue-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm group-hover:bg-blue-200 transition-colors">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed text-sm group-hover:text-gray-900 transition-colors">
                  {pub}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Published Research
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {publications.length} Publications
          </span>
          <span className="text-blue-600 font-medium">Peer Reviewed</span>
        </div>
      </div>
    </div>
  );
}

// Main Component
function BookAppointment() {

  const doctor = {
    name: "Dr. Bijoy G Rajbanshi",
    age: 42,
    experience: "Has 15 years",
    qualification: "MD in Cardiology, Cardiovascular Surgeon",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    speciality: "Cardiology",
  };

  const education = [
    "M.B.B.S. from Jawaharlal Nehru Medical College",
    "M.S from BSM Medical University, Bangladesh",
    "Clinical Fellowship (Cardiac Surgery) from Mayo Clinic, Rochester, Minnesota USA",
    "Advanced Clinical Fellowship (Adult Cardiac Surgery) from Yale University School of Medicine, New Haven, Connecticut, USA",
  ];

  const publications = [
    "Lakhey PJ, Rajbanshi BG, Singh YP, Vaidya P, Khakurel MK. Splenic Abscess: an experience at TUTH. J Society of Surgeons of Nepal 1999;2:50-52",
    "Lakhey PJ, Rajbanshi BG, Singh YP, Vaidya P, Khakurel MK. Splenic Abscess: an experience at TUTH. J Society of Surgeons of Nepal 1999;2:50-52",
    "Lakhey PJ, Rajbanshi BG, Singh YP, Vaidya P, Khakurel MK. Splenic Abscess: an experience at TUTH. J Society of Surgeons of Nepal 1999;2:50-52",
    "Lakhey PJ, Rajbanshi BG, Singh YP, Vaidya P, Khakurel MK. Splenic Abscess: an experience at TUTH. J Society of Surgeons of Nepal 1999;2:50-52",
    "Lakhey PJ, Rajbanshi BG, Singh YP, Vaidya P, Khakurel MK. Splenic Abscess: an experience at TUTH. J Society of Surgeons of Nepal 1999;2:50-52",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-2 max-w-none">
        <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 max-w-8xl mx-auto">
          {/* Left Column - Doctor Info and Details */}
          <div className="xl:col-span-4 space-y-6">
            <DoctorInfo doctor={doctor} />

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                About Dr. {doctor.name.split(" ")[2]}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Dr. Bijoy G Rajbanshi is the Principal Consultant and Head of
                the Department of Cardiovascular and Thoracic Surgery at Nepal
                Mediciti. He is also the President of the Cardiac Society of
                Nepal, the country's largest association of cardiologists and
                cardiac surgeons. With extensive experience and international
                training, Dr. Rajbanshi is recognized as one of Nepal's leading
                heart surgeons.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                With over 6,000 successful heart surgeries, Dr. Rajbanshi has
                played a pioneering role in developing advanced cardiac surgery
                in Nepal. He is highly skilled in performing complex aortic
                surgeries, procedures involving deep hypothermic circulatory
                arrest, coronary artery bypass grafting (CABG), heart valve
                repair and replacement, mitral valve repair, and minimally
                invasive cardiac surgery.
              </p>
            </div>

            <Education education={education} />
            <Publications publications={publications} />
          </div>

          {/* Right Column - Calendar */}
          <div className="xl:col-span-3">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-md p-2 mb-6 min-w-0 w-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 px-4 pt-2">
                  Book an Appointment
                </h2>
                <div className="w-full min-w-0">
                  <Calendar20 />
                </div>
                <div className="px-4 pb-2">
                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    Confirm Appointment
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-medium text-gray-700 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    +977 1 2345678
                  </p>
                  <p className="flex items-center text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    doctor@medicalcenter.com
                  </p>
                  <p className="flex items-center text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Medical Center, Kathmandu, Nepal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { BookAppointment };
