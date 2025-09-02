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

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Home></Home>} />
        <Route path="/appointment" element={<DoctorList />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
