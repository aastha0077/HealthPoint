import {
  Star,
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
} from "lucide-react";

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-red-50 to-red-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Your Health,
              <br />
              <span className="text-red-600">Our Priority</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Experience world-class healthcare with our dedicated team of
              specialists. We provide comprehensive medical care with a personal
              touch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium">
                Book Appointment
              </button>
              <button className="border border-red-600 text-red-600 px-8 py-3 rounded-lg hover:bg-red-50 font-medium">
                Emergency Care
              </button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop"
              alt="PLU Hospital Building"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Trust Indicators Component
function TrustSection() {
  const trustPoints = [
    { icon: Shield, text: "Certified Medical Excellence" },
    { icon: Users, text: "50,000+ Happy Patients" },
    { icon: Clock, text: "24/7 Emergency Care" },
    { icon: Award, text: "Award Winning Facility" },
    { icon: Heart, text: "Compassionate Care" },
    { icon: Stethoscope, text: "Expert Specialists" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Trust PLU
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {trustPoints.map((point, index) => (
            <div key={index} className="text-center p-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <point.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-700 font-medium">{point.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Section Component
function AboutSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              A Home Away From Home
            </h2>
            <p className="text-gray-600 leading-relaxed">
              PLU is more than a hospital, it's a place where healing begins
              with compassion. Our state-of-the-art facility combined with our
              caring medical professionals ensures that every patient receives
              the highest quality care in a comfortable, welcoming environment.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe that healing is not just about treating illness, but
              about caring for the whole person - mind, body, and spirit.
            </p>
            <button className="text-red-600 font-medium flex items-center hover:text-red-700">
              Learn More About Us
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop"
              alt="Doctor with patient"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Services Section Component
function ServicesSection() {
  const services = [
    {
      icon: Stethoscope,
      title: "OPD",
      description:
        "Comprehensive outpatient care with specialist consultations",
    },
    {
      icon: TestTube,
      title: "Laboratory",
      description: "Advanced diagnostic testing with accurate results",
    },
    {
      icon: Activity,
      title: "Inpatient",
      description: "24/7 inpatient care with modern facilities",
    },
    {
      icon: Camera,
      title: "Radiology/X-ray",
      description: "State-of-the-art imaging and diagnostic services",
    },
    {
      icon: Pill,
      title: "Pharmacy",
      description: "Full-service pharmacy with all essential medications",
    },
    {
      icon: Heart,
      title: "Emergency",
      description: "Round-the-clock emergency medical services",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            We are always open for our services
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg border hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <service.icon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Specialists Section Component
function SpecialistsSection() {
  const specialists = [
    {
      name: "Dr. Ramu Pokhrel",
      specialty: "Cardiologist",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
    },
    {
      name: "Dr. Ram Acharya",
      specialty: "Neurologist",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
    },
    {
      name: "Dr. Devil Don",
      specialty: "Pediatrician",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
    },
    {
      name: "Dr. James Wilson",
      specialty: "Orthopedist",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Our Specialists</h2>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium">
            View All Doctors
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialists.map((doctor, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-lg transition-shadow"
            >
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {doctor.name}
              </h3>
              <p className="text-red-600 text-sm">{doctor.specialty}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Prioritize Your Health
            </h2>
            <p className="text-gray-600 text-lg">
              Don't wait for tomorrow. Take charge of your health today.
            </p>
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-gray-900">
                Book an Appointment Today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium">
                  Login
                </button>
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium">
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      text: "Excellent service and caring staff. The doctors here truly listen to your concerns.",
    },
    {
      name: "John D.",
      rating: 5,
      text: "State-of-the-art facilities with compassionate care. Highly recommend PLU Hospital.",
    },
    {
      name: "Maria L.",
      rating: 5,
      text: "Professional medical team and clean environment. Great experience overall.",
    },
    {
      name: "Robert K.",
      rating: 5,
      text: "Quick service and accurate diagnosis. The staff made me feel comfortable throughout.",
    },
    {
      name: "Lisa P.",
      rating: 5,
      text: "Amazing emergency care when I needed it most. Thank you to the entire team.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Testimonials
          </h2>
          <p className="text-gray-600">What our patients say about us</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 5).map((testimonial, index) => (
            <div key={index} className="bg-blue-600 text-white p-6 rounded-lg">
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm mb-4">{testimonial.text}</p>
              <p className="font-semibold text-sm">- {testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Homepage Component
export default function Homepage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustSection />
      <AboutSection />
      <ServicesSection />
      <SpecialistsSection />
      <CTASection />
      <TestimonialsSection />
    </div>
  );
}

export { Homepage };
