import { Route, Routes } from "react-router";
import "./App.css";
import { LoginForm } from "./components/login-form";
import { Header } from "./components/layouts/Header";
import { Home } from "./pages/Home";

function App() {
  return (
    <>
      <Header></Header>
      <Routes>
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/signup" element={""}></Route>
        <Route path="/" element={<Home></Home>}></Route>
      </Routes>
    </>
  );
}

export default App;
