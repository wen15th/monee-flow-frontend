import { Login } from "./pages/Login"
import {Logout} from "./pages/Logout";
import { AuthProvider } from './context/AuthProvider.tsx';
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css'
import Dashboard from "./pages/Dashboard.tsx";
import Register from "./pages/Register.tsx";
import Upload from "./pages/Upload.tsx";
import { Header } from "./components/Header"


function ProtectedLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-4">
                <Outlet />
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/signup" element={<Register />} />

                    <Route
                        element={
                            <ProtectedRoute>
                                <ProtectedLayout /> {/* Header + Outlet */}
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/upload" element={<Upload />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
