import { useState } from "react";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  department: string;
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
}

function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    department: "",
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const departments = [
    "General Inquiry",
    "Emergency Services",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Radiology",
    "Laboratory Services",
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    if (!formData.department)
      newErrors.department = "Please select a department";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-xl shadow-rose-100/50 p-8 md:p-12">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
          Send us a Message
        </h2>
        <p className="text-slate-500 font-medium">
          Our specialized team is ready to assist you with any medical inquiries or feedback.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 ${errors.firstName ? "border-red-400" : "border-slate-100 focus:border-rose-400"
                }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 ${errors.lastName ? "border-red-400" : "border-slate-100 focus:border-rose-400"
                }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 ${errors.email ? "border-red-400" : "border-slate-100 focus:border-rose-400"
                }`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 ${errors.phone ? "border-red-400" : "border-slate-100 focus:border-rose-400"
                }`}
              placeholder="+977-98XXXXXXXX"
            />
            {errors.phone && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Department Selection */}
        <div className="space-y-2">
          <label
            htmlFor="department"
            className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
          >
            Target Department
          </label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 appearance-none ${errors.department ? "border-red-400" : "border-slate-100 focus:border-rose-400"
              }`}
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.department}</p>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 ${errors.subject ? "border-red-400" : "border-slate-100 focus:border-rose-400"
              }`}
            placeholder="How can we help you?"
          />
          {errors.subject && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.subject}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1"
          >
            Detailed Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-rose-500/10 resize-none ${errors.message ? "border-red-400" : "border-slate-100 focus:border-rose-400"
              }`}
            placeholder="Please share details about your inquiry..."
          />
          {errors.message && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 text-white py-5 px-8 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            Send Inquiry
          </button>
        </div>
      </form>
    </div>
  );
}

export { ContactForm, type ContactFormData };
