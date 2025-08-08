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
        "info@pluhospital.com",
        "appointments@pluhospital.com",
        "emergency@pluhospital.com",
      ],
      link: "mailto:info@pluhospital.com",
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
        "Lumbini Province, Nepal",
        "Near Main Highway",
        "Postal Code: 32907",
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're here to help and answer any questions you might have. Reach
            out to us and we'll respond as soon as possible.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm onSubmit={handleFormSubmit} />
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <ContactInfo
              hospitalName="Public Lumbini United Hospital"
              items={contactItems}
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-8">
          <ContactMap
            title="Visit Our Hospital"
            address="Public Lumbini United Hospital, Lumbini Province, Nepal"
          />
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Emergency Services
              </h3>
              <p className="text-red-700 text-sm mb-3">
                For medical emergencies, please call our emergency hotline
                immediately or visit our emergency department.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+9779849000000"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Emergency: +977-9849000000
                </a>
                <a
                  href="/emergency"
                  className="bg-white text-red-600 border border-red-600 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">
                What are your visiting hours?
              </h3>
              <p className="text-gray-600 text-sm">
                Visiting hours are from 10:00 AM to 8:00 PM daily. ICU visiting
                hours are restricted to 2:00 PM - 4:00 PM and 6:00 PM - 8:00 PM.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">
                Do you accept insurance?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, we accept most major insurance plans. Please contact our
                billing department for specific coverage details.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">
                How do I schedule an appointment?
              </h3>
              <p className="text-gray-600 text-sm">
                You can schedule an appointment by calling our appointment line,
                using our online booking system, or visiting the reception desk.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">
                Is parking available?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, we provide free parking for patients and visitors. The
                parking area is located adjacent to the main hospital building.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ContactPage };
