import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "../ui/button";
import { Menu, X, User, Calendar } from "lucide-react";
import { useState } from "react";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth = useAuth()
  const token = auth?.token

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { href: "/", label: "Hospital Overview" },
    { href: "/services", label: "Our Services" },
    { href: "/lab-report", label: "Lab Report" },
    { href: "/health-package", label: "Health Package" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <header className="bg-white shadow-md border-b border-red-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <div className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">
                PLU
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-red-50 rounded-md"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Book Appointment Button */}
            <Button
              onClick={() => {
                window.location.href = "/appointment";
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Button>

            {/* Auth Buttons */}
            {!token && <div className="flex items-center space-x-2 border-l border-red-300 pl-4">
              <Button
                variant="ghost"
                onClick={() => {
                  window.location.href = "/login";
                }}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium"
              >
                <User className="w-4 h-4 mr-1" />
                Login
              </Button>
              <Button
                onClick={() => {
                  window.location.href = "/signup";
                }}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 text-sm font-medium rounded-md"
              >
                Sign Up
              </Button>
            </div>
            }
            {
              token && <div className="ml-10"><Button variant={"default"}>Profile</Button> <Button onClick={() => auth.logout()} variant={"outline"}>Logout</Button></div>
            }
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-red-600 p-2 rounded-md"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-red-200 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block text-gray-700 hover:text-red-600 hover:bg-red-50 px-3 py-2 text-base font-medium rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="mt-4 pt-4 border-t border-red-200 space-y-3">
              <Button
                onClick={() => {
                  window.location.href = "/appointment";
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    window.location.href = "/login";
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium border border-red-300 rounded-md"
                >
                  <User className="w-4 h-4 mr-1" />
                  Login
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = "/signup";
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 text-sm font-medium rounded-md"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export { Header };
