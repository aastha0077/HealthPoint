import {
  TestTube,
  Camera,
  Heart,
  Microscope,
  Calendar,
  FileText,
  Home,
  Phone,
  Mail,
  Clock,
  Download,
  Eye,
  Shield,
  Award,
  Users,
  Search,
  Filter,
} from "lucide-react";

const LabReport = () => {
  const labTests = [
    {
      category: "Blood Tests",
      icon: TestTube,
      color: "red",
      tests: [
        {
          name: "Complete Blood Count (CBC)",
          price: "$25",
          duration: "2-4 hours",
          popular: true,
        },
        {
          name: "Blood Sugar (Fasting)",
          price: "$15",
          duration: "1 hour",
          popular: false,
        },
        {
          name: "Lipid Profile",
          price: "$30",
          duration: "4-6 hours",
          popular: true,
        },
        {
          name: "Liver Function Test",
          price: "$35",
          duration: "4-6 hours",
          popular: false,
        },
        {
          name: "Kidney Function Test",
          price: "$28",
          duration: "2-4 hours",
          popular: false,
        },
      ],
    },
    {
      category: "Imaging Tests",
      icon: Camera,
      color: "red",
      tests: [
        {
          name: "X-Ray (Chest)",
          price: "$40",
          duration: "30 minutes",
          popular: false,
        },
        {
          name: "CT Scan",
          price: "$200",
          duration: "1-2 hours",
          popular: true,
        },
        {
          name: "MRI Scan",
          price: "$350",
          duration: "2-3 hours",
          popular: false,
        },
        {
          name: "Ultrasound",
          price: "$80",
          duration: "45 minutes",
          popular: true,
        },
        {
          name: "Mammography",
          price: "$120",
          duration: "1 hour",
          popular: false,
        },
      ],
    },
    {
      category: "Cardiac Tests",
      icon: Heart,
      color: "red",
      tests: [
        {
          name: "ECG (Electrocardiogram)",
          price: "$50",
          duration: "30 minutes",
          popular: true,
        },
        {
          name: "Echocardiogram",
          price: "$150",
          duration: "1 hour",
          popular: false,
        },
        {
          name: "Stress Test",
          price: "$180",
          duration: "2 hours",
          popular: false,
        },
        {
          name: "Holter Monitor",
          price: "$200",
          duration: "24 hours",
          popular: false,
        },
      ],
    },
    {
      category: "Specialized Tests",
      icon: Microscope,
      color: "red",
      tests: [
        {
          name: "Thyroid Function Test",
          price: "$45",
          duration: "4-6 hours",
          popular: true,
        },
        {
          name: "Vitamin D Test",
          price: "$35",
          duration: "2-4 hours",
          popular: false,
        },
        {
          name: "Cancer Markers",
          price: "$85",
          duration: "1-2 days",
          popular: false,
        },
        {
          name: "Allergy Panel",
          price: "$120",
          duration: "3-5 days",
          popular: false,
        },
      ],
    },
  ];

  const recentReports = [
    {
      id: "RPT001",
      patientName: "John Doe",
      testName: "Complete Blood Count",
      date: "2024-01-15",
      status: "Ready",
      doctor: "Dr. Smith",
      priority: "Normal",
    },
    {
      id: "RPT002",
      patientName: "Jane Smith",
      testName: "Lipid Profile",
      date: "2024-01-14",
      status: "Processing",
      doctor: "Dr. Johnson",
      priority: "High",
    },
    {
      id: "RPT003",
      patientName: "Mike Wilson",
      testName: "CT Scan",
      date: "2024-01-13",
      status: "Ready",
      doctor: "Dr. Brown",
      priority: "Normal",
    },
  ];

  const labFeatures = [
    { icon: Shield, text: "Certified Lab", value: "ISO 15189" },
    { icon: Clock, text: "Quick Results", value: "Same Day" },
    { icon: Award, text: "Accuracy", value: "99.9%" },
    { icon: Users, text: "Expert Staff", value: "50+ Technicians" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-50 to-red-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Laboratory
              <br />
              <span className="text-red-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Advanced diagnostic testing with accurate results and quick
              turnaround times. Our state-of-the-art laboratory ensures reliable
              and precise medical testing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Book Lab Test
              </button>
              <button className="border border-red-600 text-red-600 px-8 py-3 rounded-lg hover:bg-red-50 font-medium flex items-center justify-center">
                <FileText className="w-5 h-5 mr-2" />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {labFeatures.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {feature.value}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <p className="text-gray-600">Choose your preferred service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Book Lab Test</h3>
              <p className="text-gray-600 mb-6">
                Schedule your laboratory tests online with our easy booking
                system
              </p>
              <button className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                Book Now
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">View Reports</h3>
              <p className="text-gray-600 mb-6">
                Access your test results online securely and instantly
              </p>
              <button className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                View Reports
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Home Collection</h3>
              <p className="text-gray-600 mb-6">
                Sample collection at your doorstep for your convenience
              </p>
              <button className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                Schedule
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Tests Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Available Tests
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive range of diagnostic tests with accurate results and
              quick turnaround
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {labTests.map((category, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-16 h-16 bg-${category.color}-50 rounded-full flex items-center justify-center mr-4`}
                  >
                    <category.icon
                      className={`w-8 h-8 text-${category.color}-600`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {category.category}
                  </h3>
                </div>

                <div className="space-y-4">
                  {category.tests.map((test, testIndex) => (
                    <div
                      key={testIndex}
                      className="flex justify-between items-center p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">
                            {test.name}
                          </h4>
                          {test.popular && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          Duration: {test.duration}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-red-600 text-lg">
                          {test.price}
                        </p>
                        <button
                          className={`text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition-colors font-semibold`}
                        >
                          Book Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Recent Lab Reports
              </h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Report ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Patient Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Test Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Doctor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-sm font-semibold text-red-600">
                        {report.id}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {report.patientName}
                      </td>
                      <td className="py-3 px-4">{report.testName}</td>
                      <td className="py-3 px-4 text-gray-600">{report.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            report.priority === "High"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {report.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            report.status === "Ready"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {report.doctor}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                            report.status === "Ready"
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {report.status === "Ready" ? (
                            <>
                              <Download className="w-4 h-4" />
                              Download
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Track
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help with Lab Services?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Our laboratory team is available to assist you with any questions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Lab Helpline</p>
                  <p className="text-red-100">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Email Support</p>
                  <p className="text-red-100">lab@hospital.com</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Book Test Now
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Call Lab
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export { LabReport };
