import {
  TestTube,
  Camera,
  Microscope,
  FileText,
  Phone,
  Clock,
  Download,
  Eye,
  Shield,
  Award,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router";

const LabReport = () => {
  const labTests = [
    {
      category: "Pathology & Blood Tests",
      icon: TestTube,
      tests: [
        { name: "Complete Blood Count (CBC)", price: "$25", duration: "2-4 hours", popular: true },
        { name: "Thyroid Profile (T3, T4, TSH)", price: "$35", duration: "4-6 hours", popular: true },
        { name: "Blood Sugar (Fasting/PP)", price: "$15", duration: "1 hour", popular: false },
        { name: "Lipid Profile (Cholesterol)", price: "$30", duration: "6 hours", popular: false },
      ],
    },
    {
      category: "Imaging & Radiology",
      icon: Camera,
      tests: [
        { name: "Digital X-Ray (Chest)", price: "$40", duration: "30 mins", popular: false },
        { name: "Whole Body CT Scan", price: "$200", duration: "2 hours", popular: true },
        { name: "USG Abdomen & Pelvis", price: "$80", duration: "1 hour", popular: true },
        { name: "High-Res MRI Brain", price: "$350", duration: "3 hours", popular: false },
      ],
    },
    {
      category: "Specialized Diagnostics",
      icon: Microscope,
      tests: [
        { name: "Hormonal Assay Panel", price: "$65", duration: "1 day", popular: false },
        { name: "Biopsy Histopathology", price: "$120", duration: "3-5 days", popular: false },
        { name: "Tumor Marker (PSA/CEA)", price: "$55", duration: "1 day", popular: true },
        { name: "Vitamin D & B12 Levels", price: "$45", duration: "4 hours", popular: true },
      ],
    },
  ];

  const recentReports = [
    { id: "LR-8829", test: "CBC + Blood Sugar", date: "Jan 20, 2024", status: "Ready", type: "Normal" },
    { id: "LR-8831", test: "Lipid Profile", date: "Jan 19, 2024", status: "Processing", type: "High Priority" },
    { id: "LR-8835", test: "Chest X-Ray", date: "Jan 18, 2024", status: "Ready", type: "Urgent" },
  ];

  return (
    <div className="min-h-screen bg-rose-50/20 selection:bg-rose-100 selection:text-rose-700">
      {/* Hero Header */}
      <section className="bg-white pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest mb-6">
                <Shield className="w-3 h-3" /> ISO 15189 Certified Lab
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                Accurate <span className="text-rose-600">Diagnostics</span> <br />
                Faster Results.
              </h1>
              <p className="text-lg text-slate-500 mb-10 max-w-xl">
                Our ultra-modern laboratory features robotic analyzers and digital
                reporting, ensuring 99.9% accuracy for every medical test.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/appointment" className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 transition-all hover:-translate-y-1">
                  Book Lab Test
                </Link>
                <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-rose-100 shadow-sm font-bold text-slate-700">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  Same Day Reporting
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="grid grid-cols-2 gap-4 translate-y-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-50 flex flex-col items-center">
                    <Microscope className="w-8 h-8 text-rose-500 mb-2" />
                    <p className="text-sm font-black text-slate-900">Robotic Gear</p>
                  </div>
                  <div className="bg-rose-600 p-6 rounded-[2rem] shadow-xl text-white flex flex-col items-center">
                    <TrendingUp className="w-8 h-8 mb-2" />
                    <p className="text-2xl font-black">99%</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest">Accuracy</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                    <Users className="w-10 h-10 text-rose-500 mb-4" />
                    <p className="text-xl font-black">20+</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pathologists</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-50 flex flex-col items-center">
                    <Clock className="w-8 h-8 text-amber-500 mb-2" />
                    <p className="text-sm font-black text-slate-900">2h TAT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row gap-12">

            {/* Left: Test Menu */}
            <div className="xl:w-2/3 space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Available Tests</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300 w-4 h-4" />
                  <input type="text" placeholder="Search test name..." className="pl-10 pr-4 py-2.5 rounded-xl border border-rose-100 bg-white text-sm focus:ring-2 focus:ring-rose-200 outline-none w-64 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {labTests.map((cat, i) => (
                  <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-rose-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{cat.category}</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                      {cat.tests.map((test, j) => (
                        <div key={j} className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all group">
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{test.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{test.duration}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-rose-600 font-black text-lg">{test.price}</p>
                            <button className="text-[10px] font-black uppercase text-rose-400 group-hover:text-rose-600 transition-colors">Book</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Home Collection Promo */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600 -translate-x-1/2 -translate-y-1/2 blur-[80px] opacity-30" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                      <Phone className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="text-3xl font-black mb-4 tracking-tight leading-none">Home Sample <br />Collection</h3>
                    <p className="text-slate-400 text-sm mb-8">Can't come to us? Our expert phlebotomists will visit you at your doorstep.</p>
                    <button className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:gap-3 transition-all">
                      Schedule Pickup <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Reports & Tracking */}
            <div className="xl:w-1/3">
              <div className="sticky top-28 space-y-8">

                {/* Reports Tracker Card */}
                <div className="bg-white rounded-[2.5rem] border border-rose-100 p-8 shadow-xl shadow-rose-100/50">
                  <div className="flex items-center gap-3 mb-8">
                    <FileText className="text-rose-600 w-6 h-6" />
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">My Lab Reports</h3>
                  </div>

                  <div className="space-y-4">
                    {recentReports.map((rpt, i) => (
                      <div key={i} className="p-5 rounded-3xl border border-rose-50 bg-rose-50/20 hover:border-rose-200 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{rpt.date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rpt.status === 'Ready' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                            {rpt.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{rpt.test}</h4>
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-[10px] text-slate-400 font-bold">{rpt.id}</p>
                          {rpt.status === 'Ready' ? (
                            <button className="flex items-center gap-1.5 text-xs font-black text-rose-600 hover:gap-2 transition-all">
                              Download <Download className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button className="flex items-center gap-1.5 text-xs font-black text-slate-400 cursor-wait">
                              Tracking <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-6 py-4 rounded-2xl border-2 border-rose-100 text-rose-600 font-bold hover:bg-rose-50 transition-all text-sm">
                    View All My Reports
                  </button>
                </div>

                {/* Contact Help */}
                <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl mb-6">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black mb-2">Need Technical Help?</h4>
                  <p className="text-xs text-rose-100 font-medium mb-6 opacity-80 leading-relaxed">If you haven't received your reports or have questions regarding your results, call our lab desk.</p>
                  <p className="text-2xl font-black mb-1 tracking-tight">071-XXXXX</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Extensions: 201, 204</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-white border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            {[
              { icon: Shield, label: "Certified Facility", val: "ISO 15189" },
              { icon: Clock, label: "Fastest Turnaround", val: "2-4 Hours" },
              { icon: Award, label: "Lab Accuracy", val: "99.9%" },
              { icon: Users, text: "Qualified Staff", val: "50+ Technicians" },
            ].map((b, i) => (
              <div key={i}>
                <p className="text-4xl font-black text-slate-900 mb-2">{b.val}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{b.label || b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export { LabReport };
