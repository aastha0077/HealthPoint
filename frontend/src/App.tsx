import { Route, Routes, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import "./App.css";
import UserLayout from "./layouts/UserLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthProvider";
import { ToastProvider } from "./components/ui/toast-provider";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./components/NotificationProvider";

// Lazy Load Pages
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const DoctorList = lazy(() => import("./components/doctor/DoctorList").then(m => ({ default: m.DoctorList })));
const ContactPage = lazy(() => import("./components/contact/ContactUs").then(m => ({ default: m.ContactPage })));
const BookAppointment = lazy(() => import("./pages/BookAppointment").then(m => ({ default: m.BookAppointment })));
const SymptomChecker = lazy(() => import("./pages/SymptomChecker").then(m => ({ default: m.SymptomChecker })));
const OurServices = lazy(() => import("./pages/OurServices").then(m => ({ default: m.OurServices })));
const HealthPackage = lazy(() => import("./pages/HealthPackage").then(m => ({ default: m.HealthPackage })));
const DoctorDetails = lazy(() => import("./pages/DoctorDetails").then(m => ({ default: m.DoctorDetails })));
const Chat = lazy(() => import("./pages/Chat"));
const MyChats = lazy(() => import("./pages/MyChats").then(m => ({ default: m.MyChats })));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DoctorPanel = lazy(() => import("./pages/DoctorPanel").then(m => ({ default: m.DoctorPanel })));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
const AuthPage = lazy(() => import("./pages/AuthPage").then(m => ({ default: m.AuthPage })));
const KhaltiCallback = lazy(() => import("./pages/KhaltiCallback").then(m => ({ default: m.KhaltiCallback })));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-rose-50/20">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-black text-rose-600 uppercase tracking-widest animate-pulse">Initializing Interface...</p>
    </div>
  </div>
);

function App() {
  const auth = useAuth();

  return (
    <ToastProvider>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 100000 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#0f172a',
            borderRadius: '1.25rem',
            border: '1px solid #f1f5f9',
            padding: '1rem 1.5rem',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            fontWeight: 'bold',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#e11d48',
              secondary: '#fff',
            },
          },
        }}
      />
      <NotificationProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<UserLayout />}>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="/auth" element={
              auth?.isAuthenticated ? <Navigate to={
                auth.role === "ADMIN" ? "/admin"
                  : auth.role === "DOCTOR" ? "/doctor-panel"
                    : "/dashboard"
              } replace /> : <AuthPage />
            } />
            <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
            <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
            <Route path="/appointment" element={<DoctorList />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/services" element={<OurServices />} />
            <Route path="/health-package" element={<HealthPackage />} />
            <Route path="/doctor/:id" element={<DoctorDetails />} />

            {/* Protected: any authenticated user */}
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/khalti/callback" element={<KhaltiCallback />} />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-chats" element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <MyChats />
              </ProtectedRoute>
            } />
            <Route path="/chat/:userId" element={
              <ProtectedRoute allowedRoles={["USER", "DOCTOR"]}>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/chat/appointment/:appointmentId" element={
              <ProtectedRoute allowedRoles={["USER", "DOCTOR"]}>
                <Chat />
              </ProtectedRoute>
            } />

          </Route>

          {/* Protected: DOCTOR only */}
          {/* We don't wrap the outer Layout with Suspense if we want shared layout, 
              but internal pages will be lazy. Actually Suspense is above Routes so it's fine. */}
          <Route path="/doctor-panel/*" element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorPanel />
            </ProtectedRoute>
          } />

          {/* Protected: ADMIN only */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
