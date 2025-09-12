import { Login } from "./pages/Login"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import Dashboard from "./pages/Dashboard.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
