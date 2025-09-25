import { Login } from "./pages/Login"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import Dashboard from "./pages/Dashboard.tsx";
import Register from "./pages/Register.tsx";
import Upload from "./pages/Upload.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
