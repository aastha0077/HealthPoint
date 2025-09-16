
import {
  Heart,
  Stethoscope,
  Activity,
  Brain,
  Baby,
  Users,
  Clock,
  Shield,
  Award,
  Phone,
  Calendar,
  ChevronRight,
  CheckCircle,
  Star,
  Crown,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  UserCheck,
  FileText,
  MessageCircle
} from "lucide-react";

const HealthPackage = () => {
  const packages = [
    {
      id: 1,
      name: "Basic Health Checkup",
      price: "$199",
      originalPrice: "$299",
      duration: "2-3 hours",
      icon: Stethoscope,
      color: "red",
      popular: false,
      description: "Essential health screening for general wellness monitoring",
      includes: [
        "Complete Blood Count (CBC)",
        "Blood Sugar (Fasting)",
        "Blood Pressure Check",
        "BMI Assessment",
        "General Physical Examination",
        "Doctor Consultation"
      ],
      benefits: [
        "Early disease detection",
        "Baseline health metrics",
        "Preventive care guidance"
      ],
      savings: "Save $100"
    },
    {
      id: 2,
      name: "Comprehensive Health Package",
      price: "$399",
      originalPrice: "$599",
      duration: "4-5 hours",
      icon: Star,
      color: "red",
      popular: true,
      description: "Complete health assessment with advanced diagnostic tests",
      includes: [
        "All Basic Package tests",
        "Lipid Profile",
        "Liver Function Test",
        "Kidney Function Test",
        "Thyroid Function Test",
        "ECG",
        "Chest X-Ray",
        "Ultrasound Abdomen",
        "Specialist Consultation"
      ],
      benefits: [
        "Comprehensive health overview",
        "Multiple organ assessment",
        "Detailed health report",
        "Personalized health plan"
      ],
      savings: "Save $200"
    },
    {
      id: 3,
      name: "Executive Health Package",
      price: "$799",
      originalPrice: "$1199",
      duration: "Full day",
      icon: Crown,
      color: "red",
      popular: false,
      description: "Premium health package with advanced imaging and specialized tests",
      includes: [
        "All Comprehensive Package tests",
        "CT Scan (Chest/Abdomen)",
        "Echocardiogram",
        "Stress Test",
        "Cancer Markers",
        "Vitamin D & B12",
        "Eye Examination",
        "Dental Checkup",
        "Nutritionist Consultation",
        "Cardiologist Consultation"
      ],
      benefits: [
        "Executive-level healthcare",
        "Advanced disease screening",
        "Multiple specialist consultations",
        "Priority scheduling",
        "Detailed wellness report"
      ],
      savings: "Save $400"
    },
    {
      id: 4,
      name: "Women's Health Package",
      price: "$349",
      originalPrice: "$499",
      duration: "3-4 hours",
      icon: Users,
      color: "red",
      popular: false,
      description: "Specialized health screening designed for women's unique health needs",
      includes: [
        "Complete Blood Count",
        "Thyroid Function Test",
        "Pap Smear",
        "Mammography",
        "Pelvic Ultrasound",
        "Bone Density Test",
        "Iron Studies",
        "Gynecologist Consultation"
      ],
      benefits: [
        "Women-specific health screening",
        "Reproductive health assessment",
        "Breast and cervical cancer screening",
        "Hormonal health evaluation"
      ],
      savings: "Save $150"
    },
    {
      id: 5,
      name: "Senior Citizen Package",
      price: "$299",
      originalPrice: "$449",
      duration: "3-4 hours",
      icon: Heart,
      color: "red",
      popular: false,
      description: "Comprehensive health package tailored for seniors (60+ years)",
      includes: [
        "Complete Blood Count",
        "Diabetes Screening",
        "Lipid Profile",
        "Kidney Function Test",
        "ECG & Echo",
        "Chest X-Ray",
        "Eye Examination",
        "Bone Density Test",
        "Geriatrician Consultation"
      ],
      benefits: [
        "Age-appropriate health screening",
        "Chronic disease monitoring",
        "Mobility and cognitive assessment",
        "Senior-friendly care"
      ],
      savings: "Save $150"
    },
    {
      id: 6,
      name: "Cardiac Health Package",
      price: "$449",
      originalPrice: "$649",
      duration: "4-5 hours",
      icon: Activity,
      color: "red",
      popular: false,
      description: "Specialized package focusing on heart health and cardiovascular wellness",
      includes: [
        "Lipid Profile",
        "Blood Sugar Tests",
        "ECG",
        "Echocardiogram",
        "Stress Test",
        "Chest X-Ray",
        "Blood Pressure Monitoring",
        "Cardiologist Consultation"
      ],
      benefits: [
        "Comprehensive heart assessment",
        "Cardiovascular risk evaluation",
        "Early detection of heart disease",
        "Personalized cardiac care plan"
      ],
      savings: "Save $200"
    }
  ];

  const features = [
    {
      icon: Award,
      title: "Expert Medical Team",
      description: "Experienced doctors and specialists",
      color: "red"
    },
    {
      icon: Zap,
      title: "Advanced Technology",
      description: "State-of-the-art diagnostic equipment",
      color: "red"
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Comprehensive health analysis",
      color: "red"
    },
    {
      icon: Clock,
      title: "Quick Results",
      description: "Fast turnaround time",
      color: "red"
    }
  ];

  const stats = [
    { number: "500+", label: "Packages Completed", icon: TrendingUp },
    { number: "98%", label: "Customer Satisfaction", icon: Star },
    { number: "24/7", label: "Support Available", icon: Shield }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      package: "Comprehensive Health Package",
      rating: 5,
      text: "Excellent service! The comprehensive package gave me complete peace of mind about my health."
    },
    {
      name: "Michael Chen",
      package: "Executive Health Package",
      rating: 5,
      text: "Worth every penny. The executive package was thorough and the staff was incredibly professional."
    },
    {
      name: "Emily Davis",
      package: "Women's Health Package",
      rating: 5,
      text: "Perfect for women's health needs. The gynecologist consultation was very helpful and reassuring."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-50 to-red-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Health
              <br />
              <span className="text-red-600">Packages</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Comprehensive health checkup packages designed to meet your specific needs.
              Choose from our range of preventive healthcare solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Book Package
              </button>
              <button className="border border-red-600 text-red-600 px-8 py-3 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Health Packages?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive health solutions with the latest technology and expert care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`w-8 h-8 text-red-600`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Health Package
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the package that best fits your health needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative ${pkg.popular ? 'ring-2 ring-red-500 scale-105' : 'hover:-translate-y-1'
                  }`}
              >
                {pkg.popular && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <pkg.icon className={`w-10 h-10 text-red-600`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {pkg.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-red-600">{pkg.price}</span>
                      <span className="text-lg text-gray-400 line-through">{pkg.originalPrice}</span>
                    </div>
                    <div className={`inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold mb-2`}>
                      {pkg.savings}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Duration: {pkg.duration}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 text-red-500 mr-2" />
                      Package Includes:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {pkg.includes.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Target className="w-5 h-5 text-red-500 mr-2" />
                      Key Benefits:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {pkg.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          <span className="text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center bg-red-600 hover:bg-red-700 text-white`}>
                    Book Package
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-gray-600">Real experiences from our health package customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-red-600 text-white p-6 rounded-xl">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t border-red-500 pt-3">
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-red-200">{testimonial.package}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Prioritize Your Health?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Book your health package today and take the first step towards a healthier tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Consultation
              </button>
            </div>

            <div className="pt-8 border-t border-red-400 opacity-90">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold">{stat.number}</div>
                    <div className="text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export { HealthPackage };
