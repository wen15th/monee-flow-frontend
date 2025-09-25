// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as React from "react";

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!firstName || !lastName || !email || !password) {
            setError("All fields are required");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: password
                }),
                credentials: "include"
            });

            if (!res.ok) {
                setError("Registration failed. Please try again later");
                return;
            }

            const data = await res.json();
            console.log("Register success:", data);

            // Redirected to log in page after 2s
            setSuccess("Registration successful! Redirecting to sign in...");
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (err) {
            console.error(err);
            setError("Network error");
        }
    };

    return (
        <>
            <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
                <div className="md:flex">
                    <div className="md:shrink-0">
                        <div className="w-full object-cover md:h-full md:w-96 p-8">
                            <form method="POST" className="space-y-6" onSubmit={handleSubmit}>
                                {/* Register Title */}
                                <div>
                                    <label className="text-3xl font-bold text-green-500">Create an Account</label>
                                </div>

                                <hr className="mt-4 border-t-3 border-green-500 w-16 mx-auto"/>

                                {/* First Name */}
                                <div>
                                    <div className="mt-2">
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            placeholder="First Name"
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            className="block w-full h-11 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>

                                {/* Last Name */}
                                <div>
                                    <div className="mt-2">
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            placeholder="Last Name"
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            className="block w-full h-11 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>

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
                                            autoComplete="new-password"
                                            className="block w-full h-11 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>

                                {/* Error & Success */}
                                <div>
                                    {error && <p className="text-red-500">{error}</p>}
                                    {success && <p className="text-green-600 font-bold">{success}</p>}
                                </div>

                                {/* Register button */}
                                <div>
                                    <button
                                        type="submit"
                                        className="flex w-full justify-center bg-green-500 rounded-md px-3 py-1.5 border border-green-500 text-sm/6 font-semibold shadow-xs text-white"
                                    >
                                        Register
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="p-8 bg-green-600">
                        <div className="text-3xl font-bold tracking-wide text-white uppercase"> Welcome!</div>
                        <hr className="mt-4 border-t-3 border-white w-16 mx-auto"/>
                        <p className="mt-6 text-white">
                            Already have an account? Sign in to continue your journey with us.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => navigate("/")}
                                className="flex justify-center bg-green-600 rounded-md px-3 py-1.5 border border-white text-sm/6 text-white font-semibold"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;