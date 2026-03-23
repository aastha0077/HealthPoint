import { useEffect, useState } from "react";
import {
  Heart,
  Stethoscope,
  Activity,
  Brain,
  Baby,
  Clock,
  Phone,
  CheckCircle,
  Star,
  ArrowRight,
  Loader2,
  Building2,
} from "lucide-react";
import { Link } from "react-router";
import { apiClient } from "@/apis/apis";

// Fallback icons by department name keyword
const ICON_MAP: Record<string, any> = {
  cardio: Heart,
  heart: Heart,
  emergency: Activity,
  neuro: Brain,
  ortho: Stethoscope,
  maternity: Baby,
  pediatric: Baby,
  general: Stethoscope,
  surgery: Stethoscope,
  radiology: Activity,
};

function getIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return Building2;
}

const OurServices = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get("/api/departments");
        setDepartments(res.data || []);
      } catch {
        console.error("Failed to load departments");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-rose-100 selection:text-rose-700">
      {/* Header */}
      <section className="bg-white pt-24 pb-16 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest mb-6">
              <Building2 size={12} /> Our Departments
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              World-Class Medical{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-500">Departments</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              Cutting-edge healthcare across specialized departments — bringing the best medical technology and compassionate care to Lumbini.
            </p>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-lg">No departments available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {departments.map((dept: any) => {
                const Icon = getIcon(dept.name);
                return (
                  <div
                    key={dept.id}
                    className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 group-hover:bg-rose-600 transition-colors">
                        <Icon className="w-7 h-7 text-rose-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex items-center gap-2">
                        {dept.doctorCount > 0 && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            {dept.doctorCount} Doctors
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-rose-600 transition-colors leading-tight">
                      {dept.name}
                    </h3>
                    <p className="text-slate-500 leading-relaxed font-medium text-sm flex-1 mb-6 line-clamp-3">
                      {dept.description || "Specialized department providing expert medical care and modern treatment protocols."}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mb-6 text-xs">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                        <Stethoscope size={12} className="text-slate-400" />
                        <span className="font-bold text-slate-500">
                          {dept.doctorCount || 0} Specialist{dept.doctorCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {dept.appointmentCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                          <CheckCircle size={12} className="text-emerald-400" />
                          <span className="font-bold text-emerald-600">
                            {dept.appointmentCount} Appointments
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/appointment?dept=${dept.id}`}
                      className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 group-hover:bg-rose-600 transition-all"
                    >
                      Consult Specialist
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600 blur-[150px] opacity-20 translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "24/7", label: "Care Available", icon: Clock },
              { val: `${departments.length}`, label: "Departments", icon: Building2 },
              { val: "50k+", label: "Happy Patients", icon: Heart },
              { val: "99%", label: "Satisfaction", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <stat.icon className="w-6 h-6 text-rose-400" />
                </div>
                <p className="text-3xl font-black text-white mb-2">{stat.val}</p>
                <p className="text-slate-400 font-medium text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-[3rem] p-12 md:p-16 border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                Don't Wait. Book Your <br />
                <span className="text-rose-600">Health Check-up</span> Today!
              </h2>
              <p className="text-slate-500 text-lg mb-8 font-medium">
                Your health is your greatest asset. Get a professional consultation from the best doctors in the region.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/appointment" className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-rose-200 transition-all hover:-translate-y-1">
                  Book Appointment
                </Link>
                <Link to="/contact" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold transition-all hover:bg-slate-50">
                  Call Help Desk
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&h=500&fit=crop"
                alt="Medical Care" className="w-72 h-72 object-cover rounded-[2.5rem] shadow-2xl border-4 border-white"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-rose-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Emergency</p>
                    <p className="text-sm font-bold text-slate-900">071-XXXXXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export { OurServices };
