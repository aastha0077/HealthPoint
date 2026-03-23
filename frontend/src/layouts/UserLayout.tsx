import { Outlet } from "react-router";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

export default function UserLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <ScrollToTop />
        </div>
    );
}
