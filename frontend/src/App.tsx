import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Results from "./pages/Results";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/results" element={<Results />} />
            </Routes>
        </BrowserRouter>
    );
}
