import { Header } from "@/components/layouts/Header";
import { Footer } from "react-day-picker";
import { Outlet } from "react-router";

export default function UserLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
