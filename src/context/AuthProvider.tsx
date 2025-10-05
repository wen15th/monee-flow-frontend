import { useState, useEffect } from 'react';
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true
});


interface AuthProviderProps {
    children: ReactNode;
}
interface LoginResponse {
    access_token: string;
}


export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const refreshAccessToken = async (): Promise<string | null> => {
        try {
            const response = await apiClient.post<LoginResponse>(
                '/users/token/refresh',
                {},
                { withCredentials: true }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            return null;
        }
    };

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    setAccessToken(newToken);
                    setIsAuthenticated(true);
                }
            } finally {
                setIsLoading(false);
            }
        };

        initAuth().catch(console.error);
    }, []);

    // Set axios interceptors to automatically handle token refresh
    useEffect(() => {
        const requestInterceptor = apiClient.interceptors.request.use(
            (config) => {
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = apiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url.includes('/users/token/refresh')
                ) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await refreshAccessToken();
                        if (newToken) {
                            setAccessToken(newToken);
                            setIsAuthenticated(true);
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return apiClient(originalRequest);
                        }
                    } catch (refreshError) {
                        await logout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        // Clean
        return () => {
            apiClient.interceptors.request.eject(requestInterceptor);
            apiClient.interceptors.response.eject(responseInterceptor);
        };
    }, [accessToken]);

    const login = async (token: string) => {
        setAccessToken(token);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await apiClient.post('/users/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setAccessToken(null);
            setIsAuthenticated(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{
            accessToken,
            isAuthenticated,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
