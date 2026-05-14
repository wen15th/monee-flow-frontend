// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import { useAuth } from '../hooks/useAuth';


export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (!res.ok) {
                let message: string;
                try {
                    const errorData = await res.json();
                    message = errorData.detail;
                } catch {
                    message = await res.text();
                }
                setError(message);
                return;
            }

            const data = await res.json();
            console.log("Login success:", data);
            // Save token
            login(data.access_token);

            // Navigate to dashboard
            navigate("/upload");
        } catch (err) {
            console.error(err);
            setError("Network error");
        }
    };

    return (
        <>
            <div className="min-h-[720px] flex items-center justify-center">
                <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
                <div className="md:flex">
                    <div className="md:shrink-0">
                        <div className="w-full object-cover md:h-full md:w-96 p-8">
                            <form method="POST" className="space-y-6" onSubmit={handleSubmit}>
                                {/* Log in Title */}
                                <div>
                                    <label className="text-3xl font-bold text-accent-ink">Sign in to Account</label>
                                </div>

                                <hr className="mt-4 border-t-3 border-accent w-16 mx-auto"/>

                                {/* Email */}
                                <div>
                                    <div className="mt-2">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Email"
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoComplete="email"
                                            className="block w-full h-11 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                {/* Password */}
                                <div>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Password"
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                            className="block w-full h-11 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                {/* Error */}
                                <div>
                                    {error && <p className="text-red-500">{error}</p>}
                                </div>
                                {/* Sign in button */}
                                <div>
                                    <button
                                        type="submit"
                                        className="flex w-full justify-center bg-accent rounded-md px-3 py-1.5 border border-accent text-sm/6 font-semibold text-white"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="p-8 bg-accent">
                        <div className="text-3xl font-bold tracking-wide text-white uppercase"> Hello Friends!
                        </div>
                        <hr className="mt-4 border-t-3 border-white w-16 mx-auto"/>
                        <p className="mt-4 text-white">
                            Fill up personal information and start journey with us
                        </p>
                        <div className="mt-6 flex justify-center">
                            <button
                                className="flex justify-center bg-accent-tint rounded-md text-sm/6 px-3 py-1.5 text-accent-ink font-semibold hover:bg-accent-soft"
                                onClick={() => navigate("/signup")}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};
