
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
  Star
} from "lucide-react";

const OurServices = () => {
  const services = [
    {
      id: 1,
      title: "Emergency Care",
      description: "24/7 emergency medical services with state-of-the-art equipment and experienced medical staff.",
      icon: Activity,
      color: "red",
      features: ["24/7 Availability", "Advanced Life Support", "Trauma Care", "Critical Care"],
      stats: "Response Time: <15 min"
    },
    {
      id: 2,
      title: "Cardiology",
      description: "Comprehensive heart care including diagnostics, treatment, and surgical procedures.",
      icon: Heart,
      color: "red",
      features: ["ECG & Echo", "Cardiac Surgery", "Angioplasty", "Heart Monitoring"],
      stats: "500+ Successful Surgeries"
    },
    {
      id: 3,
      title: "Orthopedics",
      description: "Expert care for bones, joints, and musculoskeletal system disorders.",
      icon: Stethoscope,
      color: "red",
      features: ["Joint Replacement", "Sports Medicine", "Fracture Care", "Arthroscopy"],
      stats: "95% Success Rate"
    },
    {
      id: 4,
      title: "Neurology",
      description: "Advanced neurological care for brain, spine, and nervous system conditions.",
      icon: Brain,
      color: "red",
      features: ["Brain Surgery", "Stroke Care", "Epilepsy Treatment", "Neuroimaging"],
      stats: "Advanced MRI Technology"
    },
    {
      id: 5,
      title: "Pediatrics",
      description: "Specialized medical care for infants, children, and adolescents.",
      icon: Baby,
      color: "red",
      features: ["Child Health", "Vaccinations", "Growth Monitoring", "Pediatric Surgery"],
      stats: "Child-Friendly Environment"
    },
    {
      id: 6,
      title: "Maternity Care",
      description: "Comprehensive care for mothers and babies before, during, and after childbirth.",
      icon: Users,
      color: "red",
      features: ["Prenatal Care", "Delivery Services", "NICU", "Postnatal Support"],
      stats: "Level 3 NICU"
    }
  ];

  const trustIndicators = [
    { icon: Shield, text: "Certified Excellence", value: "ISO 9001" },
    { icon: Users, text: "Expert Doctors", value: "50+" },
    { icon: Clock, text: "24/7 Service", value: "Always Open" },
    { icon: Award, text: "Patient Satisfaction", value: "98%" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      service: "Cardiology",
      rating: 5,
      text: "Outstanding care and professional staff. The cardiology team saved my life."
    },
    {
      name: "Michael Chen",
      service: "Emergency Care",
      rating: 5,
      text: "Quick response and excellent emergency care. Highly recommended!"
    },
    {
      name: "Emily Davis",
      service: "Maternity Care",
      rating: 5,
      text: "Amazing maternity care. The staff made my delivery experience wonderful."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-50 to-red-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Medical
              <br />
              <span className="text-red-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              We provide comprehensive healthcare services with cutting-edge technology and
              compassionate care from our team of experienced medical professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </button>
              <button className="border border-red-600 text-red-600 px-8 py-3 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Emergency: 911
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <indicator.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{indicator.value}</div>
                <p className="text-sm text-gray-600 font-medium">{indicator.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Medical Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From emergency care to specialized treatments, we offer a full spectrum of medical services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:-translate-y-1"
              >
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 bg-${service.color}-50 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <service.icon className={`w-10 h-10 text-${service.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className={`inline-block bg-${service.color}-100 text-${service.color}-700 px-3 py-1 rounded-full text-sm font-semibold`}>
                    {service.stats}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 text-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-red-500 mr-2" />
                    Key Features:
                  </h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors bg-${service.color}-600 hover:bg-${service.color}-700 text-white flex items-center justify-center`}>
                  Learn More
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
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
            <p className="text-gray-600">Real experiences from our valued patients</p>
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
                  <p className="text-xs text-red-200">{testimonial.service} Patient</p>
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
              Need Medical Assistance?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Our medical team is ready to provide you with the best healthcare services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Emergency Contact
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export { OurServices };
