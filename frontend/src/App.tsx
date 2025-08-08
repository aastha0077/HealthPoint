import { Route, Routes } from "react-router";
import "./App.css";
import { LoginForm } from "./components/login-form";
import { Header } from "./components/layouts/Header";
import { Home } from "./pages/Home";
import { Footer } from "./components/layouts/Footer";
import { DoctorList } from "./components/doctor/DoctorList";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={""} />
        <Route path="/" element={<Home></Home>} />
        <Route path="/appointment" element={<DoctorList />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
