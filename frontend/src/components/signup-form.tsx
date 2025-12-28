import { useState } from "react";
import { Eye, EyeOff, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useToast } from "./ui/toast-provider";
import { useNavigate } from "react-router";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    district: "",
    municipality: "",
    wardNo: "",
    contactNumber: "",
    password: "",
  });
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();
  const signup = auth?.handleSignup
  console.log(formData.password)

  const handleChange = (e: any) => {
    console.log(e.target.name, e.target.value);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const user = {
      email: form.email.value,
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      password: form.password.value,
      municipality: form.municipality.value,
      wardNo: form.wardNo.value,
      district: form.district.value,
      address: form.district.value,
      contactNumber: form.contactNumber.value,
      role: "USER"
    }

    setIsLoading(true);
    try {
      if (signup) {
        const response = await signup(user);
        toast.showToast({ message: response.message, duration: 3000, variant: "success" })
        navigate("/login")
      }
    }
    catch (err: any) {
      if (err.response.status == 409) {
        toast.showToast({ message: "User with this email already exists", duration: 3000, variant: "warning" })
      } else {
        toast.showToast({ message: "Server error", duration: 3000, variant: "error" })
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-red-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Signup Card */}
      <div className="relative w-full max-w-2xl">
        <div className="bg-white border border-red-100 rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Left side - Branding */}
            <div className="md:col-span-2 bg-gradient-to-br from-red-600 to-red-700 p-8 flex flex-col justify-between hidden md:flex">
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Health Point
                </h2>
                <p className="text-red-100 text-sm">
                  Your trusted health appointment system
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      Easy Booking
                    </p>
                    <p className="text-red-100 text-xs">
                      Schedule appointments in minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      Verified Doctors
                    </p>
                    <p className="text-red-100 text-xs">
                      Connect with qualified healthcare professionals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="md:col-span-3 p-8">
              <div className="md:hidden mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-red-600">
                    Health Point
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Join our health appointment system
                </p>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Create Account
              </h1>
              <p className="text-gray-600 text-sm mb-6">
                Fill in your details to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Yourname"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Your surname"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="aastha@example.com"
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                  />
                </div>

                {/* Location Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. Kathmandu"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Municipality
                    </label>
                    <input
                      type="text"
                      name="municipality"
                      value={formData.municipality}
                      onChange={handleChange}
                      placeholder="e.g. Kathmandu Metropolitan"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Ward & Contact Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ward No.
                    </label>
                    <input
                      type="number"
                      name="wardNo"
                      value={formData.wardNo}
                      onChange={handleChange}
                      placeholder="01"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="+977 9800000000"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Signup Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>

                {/* Login Link */}
                <p className="text-center text-gray-600 text-sm mt-4">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                  >
                    Sign in
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-xs">
            🔒 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}
