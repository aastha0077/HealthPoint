import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import image from "../assets/image.png";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div
        className={cn("flex flex-col gap-6 w-full max-w-4xl", className)}
        {...props}
      >
        <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Form Section */}
            <form className="p-8 md:p-12 flex flex-col justify-center">
              <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-2">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome back to PLU
                  </h1>
                  <p className="text-gray-600 text-balance leading-relaxed">
                    Sign in to access your healthcare dashboard
                  </p>
                </div>

                {/* Email Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Password
                    </Label>
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline font-medium transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-11 pr-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Sign In to Your Account
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200 group"
                >
                  <svg
                    className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                  Continue with Google
                </Button>

                {/* Sign up link */}
                <div className="text-center text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 underline underline-offset-4 font-semibold transition-colors"
                  >
                    Create one now
                  </a>
                </div>
              </div>
            </form>

            {/* Image Section */}
            <div className="relative hidden md:block bg-gradient-to-br from-blue-600 to-indigo-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90"></div>
              <img
                src={image}
                alt="Healthcare professionals"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />

              {/* Overlay Content */}
              <div className="relative z-10 flex flex-col justify-center items-center h-full p-12 text-white text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.5 3A2.5 2.5 0 0017 5.5V8h-1V5.5A3.5 3.5 0 0112.5 2 3.5 3.5 0 009 5.5V8H8V5.5A4.5 4.5 0 0112.5 1 4.5 4.5 0 0117 5.5V8h2.5A1.5 1.5 0 0121 9.5v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20.5v-11A1.5 1.5 0 014.5 8H8V5.5z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold">
                    Your Health, Our Priority
                  </h2>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Access your medical records, book appointments, and manage
                    your healthcare journey with ease.
                  </p>
                  <div className="flex items-center justify-center space-x-8 pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-blue-200 text-sm">Support</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">100K+</div>
                      <div className="text-blue-200 text-sm">Patients</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">99.9%</div>
                      <div className="text-blue-200 text-sm">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Privacy */}
        <div className="text-center text-xs text-gray-500 leading-relaxed">
          By continuing, you agree to our{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-4 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-4 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
