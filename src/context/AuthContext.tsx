import { createContext } from 'react';

interface AuthContextType {
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (accessToken: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);