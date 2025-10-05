import { Login } from "./pages/Login"
import {Logout} from "./pages/Logout";
import { AuthProvider } from './context/AuthProvider.tsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css'
import Dashboard from "./pages/Dashboard.tsx";
import Register from "./pages/Register.tsx";
import Upload from "./pages/Upload.tsx";


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/signup" element={<Register />} />
                    <Route path="/upload" element={
                        <ProtectedRoute>
                            <Upload />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
