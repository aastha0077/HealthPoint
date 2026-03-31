import { ContactForm, type ContactFormData } from "./ContactForm";
import { ContactInfo, type ContactInfoItem } from "./ContactInformation";
import { ContactMap } from "./ContactMap";

function ContactPage() {
  // Contact information data
  const contactItems: ContactInfoItem[] = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: "Phone Numbers",
      details: [
        "Emergency: +977-9849000000",
        "Reception: +977-1-4567890",
        "Appointments: +977-1-4567891",
      ],
      link: "tel:+9779849000000",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Email Addresses",
      details: [
        "info@healthpoint.com",
        "appointments@healthpoint.com",
        "emergency@healthpoint.com",
      ],
      link: "mailto:info@healthpoint.com",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
      ),
      title: "Hospital Address",
      details: [
        "Resunga, Gulmi",
        "Lumbini Province, Nepal",
        "Postal Code: 32500",
      ],
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Operating Hours",
      details: [
        "Emergency: 24/7",
        "OPD: 6:00 AM - 9:00 PM",
        "Pharmacy: 24 hours",
      ],
    },
  ];

  const handleFormSubmit = (formData: ContactFormData) => {
    // Handle form submission here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-rose-50/50 py-20 selection:bg-rose-100 selection:text-rose-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-20">
          <h2 className="text-rose-600 font-bold uppercase tracking-widest text-sm mb-4">Get in Touch</h2>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">How Can We Help You?</h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Whether you're seeking specialized care or have general questions, our dedicated team is here to provide the support you need.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm onSubmit={handleFormSubmit} />
          </div>

          {/* Contact Information & Emergency */}
          <div className="lg:col-span-1 space-y-8">
            <ContactInfo
              hospitalName="HealthPoint Medical Center"
              items={contactItems}
            />

            {/* Emergency Notice */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-rose-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600 translate-x-1/2 -translate-y-1/2 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-900/40">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black mb-4">Emergency Support</h3>
                <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8">
                  For immediate medical assistance, our trauma center is operational 24/7.
                </p>
                <div className="space-y-4">
                  <a
                    href="tel:+9779849000000"
                    className="flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-rose-900/20 transition-all hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    +977-9849000000
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-20">
          <ContactMap
            title="Visit Our Medical Center"
            address="HealthPoint Medical Center, Specialized Care, Nepal"
          />
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-100/30 p-10 md:p-16">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">General Questions</h2>
              <p className="text-slate-500 font-medium">Find quick answers to common inquiries about our services and policies.</p>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { q: "What are your visiting hours?", a: "Daily from 10:00 AM to 8:00 PM. ICU hours are strictly 2:00 PM - 4:00 PM and 6:00 PM - 8:00 PM." },
                { q: "Do you accept insurance?", a: "Yes, we accept major insurance plans. Please contact our billing desk for specific coverage details." },
                { q: "How do I schedule surgery?", a: "Surgery schedules are managed after a clinical consultation with your specialist. Please book an OPD session first." },
                { q: "Is emergency parking free?", a: "Yes, we provide 24/7 free parking for all patients and visitors visiting the emergency trauma center." }
              ].map((faq, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="font-black text-slate-900 text-lg leading-snug">{faq.q}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ContactPage };
