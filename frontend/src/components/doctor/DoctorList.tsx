import { DoctorInfoCard, type Doctor } from "./DoctorInfoCard";

function DoctorList() {
  const doctors: Doctor[] = [
    {
      qualifications: ["MBBS, MD"],
      specialities: ["Heart Surgery"],
      name: "Raghab Pokhrel",
    },
    {
      qualifications: ["MD", "LAB"],
      specialities: ["Cardiology"],
      name: "Nirajan Pokhrel",
    },
    {
      qualifications: ["Phd"],
      specialities: ["Parkinson"],
      name: "Sudarshan Pokhrel",
    },
  ];

  return doctors.map((doctor) => (
    <DoctorInfoCard
      specialities={doctor.specialities}
      qualifications={doctor.qualifications}
      name={doctor.name}
    />
  ));
}

export { DoctorList };
