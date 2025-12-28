import { Route, Routes } from "react-router";
import "./App.css";
import { LoginForm } from "./components/login-form";
import { Header } from "./components/layouts/Header";
import { Home } from "./pages/Home";
import { Footer } from "./components/layouts/Footer";
import { DoctorList } from "./components/doctor/DoctorList";
import { ContactPage } from "./components/contact/ContactUs";
import { SignupForm } from "./components/signup-form";
import { BookAppointment } from "./pages/BookAppointment";
import { OurServices } from "./pages/OurServices";
import { LabReport } from "./pages/LabReport";
import { HealthPackage } from "./pages/HealthPackage";
import { ToastProvider } from "./components/ui/toast-provider";
import UserLayout from "./layouts/UserLayout";

function App() {
  return (
    <ToastProvider>
      <Header />
      <Routes>
        <Route path="/" element={<UserLayout />} />
        <Route path="/login" element={<LoginForm />} />
        <Route index element={<Home></Home>} />
        <Route path="/appointment" element={<DoctorList />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/services" element={<OurServices />} />
        <Route path="/lab-report" element={<LabReport />} />
        <Route path="/health-package" element={<HealthPackage />} />
      </Routes>
      <Footer />
    </ToastProvider>
  );
}

export default App;
