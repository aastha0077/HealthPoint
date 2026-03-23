import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiClient } from "@/apis/apis";
import { useAuth } from "./AuthProvider";

interface FavoriteContextType {
    favorites: number[]; // doctor IDs
    toggleFavorite: (doctorId: number) => Promise<boolean>;
    isFavorite: (doctorId: number) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | null>(null);

export function FavoriteProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<number[]>([]);
    const auth = useAuth();

    const fetchFavorites = async () => {
        if (!auth?.isAuthenticated) return;
        try {
            const res = await apiClient.get('/api/favorites');
            setFavorites(res.data.map((fav: any) => fav.doctorId));
        } catch (e) {
            console.error("Failed to fetch favorites", e);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [auth?.isAuthenticated]);

    const toggleFavorite = async (doctorId: number) => {
        if (!auth?.isAuthenticated) return false;
        try {
            const res = await apiClient.post(`/api/favorites/toggle/${doctorId}`);
            if (res.data.isFavorite) {
                setFavorites([...favorites, doctorId]);
            } else {
                setFavorites(favorites.filter(id => id !== doctorId));
            }
            return res.data.isFavorite;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const isFavorite = (doctorId: number) => favorites.includes(doctorId);

    return (
        <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoriteContext.Provider>
    );
}

export const useFavorites = () => {
    const context = useContext(FavoriteContext);
    if (!context) throw new Error("useFavorites must be used within FavoriteProvider");
    return context;
};
