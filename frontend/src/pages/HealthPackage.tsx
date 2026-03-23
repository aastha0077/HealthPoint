import {
  Stethoscope,
  Users,
  Clock,
  Shield,
  Award,
  CheckCircle,
  Star,
  Crown,
  Sparkles,
  Target,
  FileText,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";

const HealthPackage = () => {
  const packages = [
    {
      id: 1,
      name: "Basic Health Checkup",
      price: "$199",
      originalPrice: "$299",
      duration: "2-3 hours",
      icon: Stethoscope,
      popular: false,
      description: "Essential health screening for general wellness monitoring.",
      includes: [
        "Complete Blood Count (CBC)",
        "Blood Sugar (Fasting)",
        "Blood Pressure Check",
        "BMI Assessment",
        "General Physical Examination",
        "Doctor Consultation",
      ],
      savings: "Save $100",
    },
    {
      id: 2,
      name: "Full Body Screening",
      price: "$399",
      originalPrice: "$599",
      duration: "4-5 hours",
      icon: Star,
      popular: true,
      description: "Complete health assessment with advanced diagnostics.",
      includes: [
        "All Basic Package tests",
        "Lipid Profile & USG",
        "Liver & Kidney Function",
        "Thyroid Function Test",
        "ECG & Chest X-Ray",
        "Specialist Consultation",
      ],
      savings: "Save $200",
    },
    {
      id: 3,
      name: "Executive Premium",
      price: "$799",
      originalPrice: "$1199",
      duration: "Full Day",
      icon: Crown,
      popular: false,
      description: "Premium package with advanced imaging and multiple specialists.",
      includes: [
        "All Comprehensive tests",
        "CT Scan (Chest/Abdomen)",
        "Echocardiogram & TMT",
        "Cancer Markers (Tumor)",
        "Vitamin D & B12 Levels",
        "Cardiologist Consultation",
      ],
      savings: "Save $400",
    }
  ];

  return (
    <div className="min-h-screen bg-rose-50/20 selection:bg-rose-100 selection:text-rose-700">
      {/* Hero Header */}
      <section className="bg-white pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Comprehensive <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-500">Health Packages</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
            Preventive healthcare is the best medicine. Choose from our curated
            medical packages designed for your age, lifestyle, and unique needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full text-rose-600 text-sm font-bold border border-rose-100">
              <CheckCircle className="w-4 h-4" /> Reports in 24h
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full text-rose-600 text-sm font-bold border border-rose-100">
              <Award className="w-4 h-4" /> NABL Accredited
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`group relative bg-white rounded-[3rem] border transition-all duration-500 hover:-translate-y-3 ${pkg.popular
                  ? "border-rose-500 shadow-2xl shadow-rose-100 ring-1 ring-rose-500/20"
                  : "border-rose-100 shadow-xl shadow-rose-50"
                  }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div className="p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${pkg.popular ? "bg-rose-600 border-rose-600 text-white" : "bg-rose-50 border-rose-100 text-rose-600"
                      }`}>
                      <pkg.icon className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-none mb-1">Duration</span>
                      <span className="text-sm font-bold text-slate-600 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-rose-500" /> {pkg.duration}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-2">{pkg.name}</h3>
                  <p className="text-sm text-slate-400 font-medium mb-6">{pkg.description}</p>

                  <div className="flex items-end gap-3 mb-4">
                    <span className={`text-4xl font-black ${pkg.popular ? "text-rose-600" : "text-slate-900"}`}>{pkg.price}</span>
                    <span className="text-lg text-slate-300 line-through font-bold mb-1">{pkg.originalPrice}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mb-2">{pkg.savings}</span>
                  </div>

                  <hr className="border-rose-50 mb-8" />

                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Target className="w-4 h-4 text-rose-500" /> What's Included:
                  </h4>

                  <ul className="space-y-4 mb-10">
                    {pkg.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-sm font-medium text-slate-500 group-hover:text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-rose-600" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/appointment"
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${pkg.popular
                      ? "bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700"
                      : "bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800"
                      }`}
                  >
                    Select Package
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Panel */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-rose-50/50 rounded-[3rem] p-12 border border-rose-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-rose-100">
                  <FileText className="text-rose-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Detailed Analysis</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Every package includes a comprehensive medical report with easy-to-understand
                  graphs and doctor's remarks on your overall health status.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-rose-100">
                  <Users className="text-rose-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Expert Guidance</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Post-checkup consultations with senior specialists to discuss
                  your results and build a personalized lifestyle plan.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-rose-100">
                  <Shield className="text-rose-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">NABL Lab Standards</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Your tests are processed in our own high-end diagnostic lab
                  with the latest robotic analyzers for 99.9% accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24 pt-12 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Need a custom package?</h2>
        <p className="text-slate-500 mb-10 max-w-xl mx-auto font-medium">
          Speak with our medical advisors to build a screening plan that perfectly matches
          your specific health concerns and history.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/contact" className="px-10 py-4 bg-white border-2 border-rose-100 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 transition-all flex items-center gap-2">
            <Phone className="w-5 h-5" /> 071-XXXXXX
          </Link>
          <Link to="/appointment" className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
            Book a Callback
          </Link>
        </div>
      </section>
    </div>
  );
};

export { HealthPackage };
