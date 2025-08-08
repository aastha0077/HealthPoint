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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 py-8">
      <div
        className={cn("flex flex-col gap-6 w-full max-w-4xl", className)}
        {...props}
      >
        <Card className="overflow-hidden shadow-lg border border-gray-200 bg-white">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Form Section */}
            <form className="p-8 md:p-12 flex flex-col justify-center">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-2">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome back to PLU
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Sign in to access your healthcare dashboard
                  </p>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10 h-11 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <a
                      href="#"
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md"
                >
                  Sign In to Your Account
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-md font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {/* Sign up link */}
                <div className="text-center text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <a
                    href="#"
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Create one now
                  </a>
                </div>
              </div>
            </form>

            {/* Image Section */}
            <div className="relative hidden md:block bg-red-600">
              <img
                src={image}
                alt="Healthcare professionals"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />

              {/* Overlay Content */}
              <div className="relative z-10 flex flex-col justify-center items-center h-full p-12 text-white text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.5 3A2.5 2.5 0 0017 5.5V8h-1V5.5A3.5 3.5 0 0012.5 2 3.5 3.5 0 009 5.5V8H8V5.5A4.5 4.5 0 0012.5 1 4.5 4.5 0 0117 5.5V8h2.5A1.5 1.5 0 0121 9.5v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20.5v-11A1.5 1.5 0 014.5 8H8V5.5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold">
                    Your Health, Our Priority
                  </h2>
                  <p className="text-red-100 text-sm">
                    Access your medical records, book appointments, and manage
                    your healthcare journey with ease.
                  </p>
                  <div className="flex items-center justify-center space-x-6 pt-4">
                    <div className="text-center">
                      <div className="text-xl font-semibold">24/7</div>
                      <div className="text-red-200 text-xs">Support</div>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-xl font-semibold">100K+</div>
                      <div className="text-red-200 text-xs">Patients</div>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="text-center">
                      <div className="text-xl font-semibold">99.9%</div>
                      <div className="text-red-200 text-xs">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Privacy */}
        <div className="text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <a href="#" className="text-red-600 hover:text-red-700">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-red-600 hover:text-red-700">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
