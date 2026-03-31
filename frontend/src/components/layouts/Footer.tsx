import { Link } from "react-router";
import {
  Facebook,
  Twitter,
  Instagram,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ExternalLink
} from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-900 text-slate-300 pt-24 pb-12 overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 pb-16 border-b border-white/5">

          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-rose-900/40 group-hover:rotate-6 transition-transform">
                <span className="text-white font-black text-xl tracking-tighter">HP</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white leading-none tracking-tight">HealthPoint</span>
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mt-1.5">Hospital Center</span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              Providing world-class medical excellence with compassion. HealthPoint's premier
              healthcare institution dedicated to your family's lifelong wellness
              and advanced clinical care.
            </p>

            <div className="flex items-center gap-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-600 hover:border-rose-600 hover:text-white transition-all transition-transform hover:-translate-y-1"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Navigation</h4>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "Our Services", href: "/services" },
                { label: "Doctors", href: "/appointment" },
                { label: "Health Packages", href: "/health-package" },
                { label: "Contact Us", href: "/contact" }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.href}
                    className="text-sm font-bold hover:text-rose-500 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-rose-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialities */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Specialities</h4>
            <div className="grid grid-cols-1 gap-4">
              {[
                "Cardiology Center",
                "Orthopedic Clinic",
                "Neurology Department",
                "Pediatric Care",
                "Diagnostic Lab"
              ].map((spec, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium hover:text-white transition-colors cursor-pointer group">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600 group-hover:scale-150 transition-transform" />
                  {spec}
                </div>
              ))}
            </div>
          </div>

          {/* Support & Contact */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Get in Touch</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Emergency 24/7</p>
                  <p className="text-white font-black text-lg">+977-9849000000</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Location</p>
                  <p className="text-sm font-bold text-slate-300 leading-snug">
                    Resunga, Gulmi,<br />
                    Lumbini Province, Nepal
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-rose-600 to-red-700 text-white flex items-center justify-between group cursor-pointer transition-transform hover:scale-[1.02]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Need Help?</p>
                  <p className="text-sm font-black">Chat with AI Bot</p>
                </div>
                <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">ISO 9001 Certified</span>
            </div>
            <p className="text-xs font-bold text-slate-500">
              &copy; {currentYear} HealthPoint Medical Center. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-rose-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-rose-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-rose-500 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
