import {
  ChevronRight,
  Shield,
  Users,
  Clock,
  Award,
  Heart,
  Stethoscope,
  TestTube,
  Pill,
  Activity,
  Camera,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { apiClient } from "@/apis/apis";
import type { Doctor } from "@/components/doctor/DoctorInfoCard";

// Stats & Trust Section
function TrustSection() {
  const trustPoints = [
    { icon: Shield, text: "Certified Excellence", desc: "ISO 9001:2015 Approved" },
    { icon: Users, text: "Expert Team", desc: "200+ Specialists" },
    { icon: Clock, text: "24/7 Response", desc: "Emergency & ICU" },
    { icon: Award, text: "Global Standards", desc: "Modern Technology" },
  ];

  return (
    <section className="py-20 bg-rose-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustPoints.map((point, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <point.icon className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{point.text}</h3>
              <p className="text-sm text-slate-500">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Services Section Component
function ServicesSection() {
  const services = [
    { icon: Stethoscope, title: "Specialist OPD", desc: "Consult with top doctors across Cardiology, Neurology, and more." },
    { icon: TestTube, title: "Modern Lab", desc: "Fully automated laboratory with express reports for all diagnostics." },
    { icon: Activity, title: "Inpatient Care", desc: "Comfortable private and general wards with 24/7 nursing care." },
    { icon: Camera, title: "Imaging & Radiology", desc: "Digital X-Ray, MRI, and CT Scans with professional reporting." },
    { icon: Pill, title: "Premium Pharmacy", desc: "Genuine medicines available 24/7 within the hospital premises." },
    { icon: Heart, title: "Emergency & ICU", desc: "State-of-the-art ICU and 24/7 trauma care for all emergencies." },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-rose-600 font-bold uppercase tracking-widest text-sm mb-4">Our Departments</h2>
          <h3 className="text-4xl font-extrabold text-slate-900 mb-6">World Class Medical Services</h3>
          <p className="text-slate-500 text-lg">We offer a wide range of medical services to ensure the best health outcomes for our community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="p-8 rounded-3xl border border-slate-100 hover:border-rose-200 bg-white hover:shadow-xl hover:shadow-rose-100 transition-all group">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100 group-hover:bg-rose-600 transition-colors">
                <service.icon className="w-7 h-7 text-rose-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h4>
              <p className="text-slate-500 leading-relaxed mb-6">{service.desc}</p>
              <Link to="/services" className="inline-flex items-center gap-2 text-rose-600 font-bold text-sm hover:gap-3 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/appointment" className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl hover:bg-slate-800 font-bold shadow-lg transition-all">
            See All Services
          </Link>
        </div>
      </div>
    </section>
  );
}

// Specialists Section Component
function SpecialistsSection() {
  const [specialists, setSpecialists] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const response = await apiClient.get("/api/doctors/1/4");
        if (response.data.doctors) {
          setSpecialists(response.data.doctors);
        }
      } catch (error) {
        console.error("Failed to fetch specialists", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpecialists();
  }, []);

  return (
    <section className="py-24 bg-rose-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-rose-600 font-bold uppercase tracking-widest text-sm mb-4">Expert Doctors</h2>
            <h3 className="text-4xl font-extrabold text-slate-900">Meet Our Specialists</h3>
          </div>
          <Link to="/appointment" className="bg-rose-600 text-white px-8 py-3.5 rounded-2xl hover:bg-rose-700 font-bold shadow-lg shadow-rose-200 transition-all flex items-center gap-2">
            View All Doctors <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] h-80 animate-pulse border border-rose-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {specialists.map((doctor, index) => (
              <Link key={index} to={`/doctor/${doctor.doctorId || doctor.id}`} className="bg-white rounded-[2.5rem] overflow-hidden border border-rose-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="aspect-[3/4] overflow-hidden bg-rose-100 relative">
                  <img
                    src={doctor.user?.profilePicture || doctor.profilePicture || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=400&fit=crop"}
                    alt={doctor.user?.firstName || doctor.firstName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-xl font-black text-slate-900 mb-1 leading-tight">Dr. {doctor.user?.firstName || doctor.firstName} {doctor.user?.lastName || doctor.lastName}</h4>
                  <p className="text-rose-600 font-black text-[10px] uppercase tracking-widest">{doctor.speciality || doctor.department?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto rounded-[3rem] bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600 translate-x-1/2 -translate-y-1/2 blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600 -translate-x-1/2 translate-y-1/2 blur-[100px] opacity-20" />

        <div className="relative py-16 px-8 md:px-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to prioritize your health?</h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of happy families who trust HealthPoint Medical Center for their medical needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-rose-600 text-white px-10 py-4 rounded-2xl hover:bg-rose-700 font-bold text-lg shadow-lg shadow-rose-900 transition-all hover:-translate-y-1">
              Create Free Account
            </Link>
            <Link to="/contact" className="bg-white/10 text-white border border-white/20 px-10 py-4 rounded-2xl hover:bg-white/20 font-bold text-lg backdrop-blur-md transition-all">
              Contact Center
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main Homepage Component
export default function Homepage() {
  return (
    <div className="min-h-screen selection:bg-rose-100 selection:text-rose-700">
      <TrustSection />
      <ServicesSection />
      <SpecialistsSection />
      <CTASection />

      {/* Testimonials Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* You could put logos of partner insurance companies or accreditations here */}
            <h4 className="text-2xl font-black text-slate-300 italic uppercase tracking-tighter">NABH Accredited</h4>
            <h4 className="text-2xl font-black text-slate-300 italic uppercase tracking-tighter">WHO Standard</h4>
            <h4 className="text-2xl font-black text-slate-300 italic uppercase tracking-tighter">ISO 9001:2015</h4>
            <h4 className="text-2xl font-black text-slate-300 italic uppercase tracking-tighter">Nepal Health Board</h4>
          </div>
        </div>
      </section>
    </div>
  );
}

export { Homepage };
