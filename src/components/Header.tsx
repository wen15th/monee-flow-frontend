import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, BarChart3, Upload } from "lucide-react";
import { useCurrency, type Currency } from "../context/CurrencyContext";

export const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { currency, setCurrency } = useCurrency();

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        navigate("/logout");
    };
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-9 py-4 border-b border-border bg-white/80 backdrop-blur-md">
            {/* Left side: logo and nav */}
            <div className="flex items-center gap-5">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <span className="font-semibold text-lg tracking-tight text-ink">
                        Monee<span className="text-accent-ink">Flow</span>
                    </span>
                </div>

                {/* Nav pills */}
                <nav className="flex items-center gap-1 bg-surface border border-border rounded-full p-1">
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all ${
                            isActive("/dashboard")
                                ? "bg-accent text-white shadow-sm"
                                : "text-muted hover:text-ink"
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/upload"
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all ${
                            isActive("/upload")
                                ? "bg-accent text-white shadow-sm"
                                : "text-muted hover:text-ink"
                        }`}
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                    </Link>
                </nav>
            </div>

            {/* Right side: Currency + Profile */}
            <div className="flex items-center gap-2.5 relative">
                {/* Currency selector */}
                <div className="relative">
                    <select
                        aria-label="Display currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className="
                            h-9 rounded-full border border-border bg-surface
                            px-3 pr-7 text-sm font-medium text-ink-2
                            hover:bg-surface-2 hover:border-border-2
                            focus:outline-none focus:ring-2 focus:ring-accent-soft focus:border-accent
                            appearance-none transition-all
                        "
                    >
                        <option value="USD">🇺🇸 USD</option>
                        <option value="CAD">🇨🇦 CAD</option>
                        <option value="CNY">🇨🇳 CNY</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 7.5l4.5 5 4.5-5h-9z" />
                        </svg>
                    </div>

                    {/*<div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">*/}
                    {/*    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">*/}
                    {/*        <path d="M5.5 7.5l4.5 5 4.5-5h-9z" />*/}
                    {/*    </svg>*/}
                    {/*</div>*/}
                </div>

                {/* Profile menu */}
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="py-2 rounded-full hover:bg-accent-tint transition"
                    >
                        <User className="w-4 h-4 text-gray-700" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};