
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import News from "./pages/News";
import Predictions from "./pages/Predictions";
import Assistant from "./pages/Assistant";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const Layout = ({ children }) => {
    const location = useLocation();
    const isAssistant = location.pathname === "/assistant";

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans transition-colors duration-300">
            {!isAssistant && <Navbar />}
            <div className="flex-1">
                {children}
            </div>
            {!isAssistant && <Footer />}
        </div>
    );
};

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/news" element={<News />} />
                            <Route path="/predictions" element={<Predictions />} />
                            <Route path="/assistant" element={<Assistant />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Layout>
                </BrowserRouter>
                <Analytics />
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
