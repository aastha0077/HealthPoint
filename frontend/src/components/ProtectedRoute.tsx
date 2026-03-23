import { Navigate } from "react-router";
import { useAuth } from "@/contexts/AuthProvider";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    /** Roles allowed to access this route. If not provided, any authenticated user gets in. */
    allowedRoles?: string[];
    /** Where to redirect unauthenticated users */
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = "/login",
}: ProtectedRouteProps) {
    const auth = useAuth();

    if (auth?.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rose-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-rose-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!auth?.isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    if (allowedRoles && auth.role && !allowedRoles.includes(auth.role)) {
        // Redirect to appropriate page based on actual role
        if (auth.role === "ADMIN") return <Navigate to="/admin" replace />;
        if (auth.role === "DOCTOR") return <Navigate to="/doctor-panel" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
