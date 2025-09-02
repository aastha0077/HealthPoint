import { apiClient } from "@/apis/apis";
import { createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "react-router";


interface AuthContextType {
    token: string | null
    handleLogin: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
    handleSignup: (event: React.FormEvent<HTMLFormElement>) => Promise<void>

}

const AuthContext = createContext<AuthContextType | null>(null);


function AuthProvider({ children }: { children: ReactNode }) {
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get("email")
        const password = formData.get("password")
        const response = await apiClient.post('/api/auth/login', { email, password },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )

        alert(response.data.message)
        if (response.data.token) {
            localStorage.setItem("token", response.data.token)
            navigate("/")

        }
    }
    async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const formValues = {
            email: String(formData.get("email") || ""),
            firstName: String(formData.get("firstName") || ""),
            lastName: String(formData.get("lastName") || ""),
            district: String(formData.get("district") || ""),
            municipality: String(formData.get("municipality") || ""),
            wardNo: String(formData.get("wardNo") || ""),
            contactNumber: String(formData.get("contactNumber") || ""),
            password: formData.get("password")
        };

        try {
            const res = await apiClient.post('/api/auth/signup', formValues);
            if (res.status == 201) {
                alert("Signup successfull")
                navigate("/login")
                return
            }

            alert("User with this email already exists")
        } catch (err) {
            console.error(err);
            alert("Error occurred");
        }
    }

    return <AuthContext.Provider value={{ token, handleLogin, handleSignup }}>{children}</AuthContext.Provider>
}


function useAuth() {
    const context = useContext(AuthContext)
    return context
}


export { useAuth, AuthProvider }


