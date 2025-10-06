import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, BarChart3, Upload } from "lucide-react";

export const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        navigate("/logout");
    };
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 border-b border-gray-200 bg-white">
            {/* Left side: log and nav */}
            <div className="flex items-center space-x-6">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#080717] rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-lg">MoneeFlow</span>
                </div>

                {/* Nav */}
                <nav className="flex items-center space-x-3">
                    <Link
                        to="/dashboard"
                        className={`flex items-center space-x-2 ml-4 px-4 py-1.5 rounded-lg font-medium text-sm transition ${
                            isActive("/dashboard")
                                ? "bg-[#080717] text-white"
                                : "text-gray-900 hover:bg-gray-100"
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/upload"
                        className={`flex items-center space-x-1 px-4 py-1.5 rounded-lg font-medium text-sm transition ${
                            isActive("/upload")
                                ? "bg-[#080717] text-white"
                                : "text-gray-900 hover:bg-gray-100"
                        }`}
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                    </Link>
                </nav>
            </div>

            {/* Right side: Profile & Logout */}
            <div className="relative">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                    <User className="w-5 h-5 text-gray-700" />
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
        </header>
    );
};