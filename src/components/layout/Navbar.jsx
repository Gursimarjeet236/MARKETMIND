

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useClickOutside } from "@/hooks/useClickOutside";

const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Predictions", path: "/predictions" },
    { name: "News", path: "/news" },
    { name: "Ask Edith", path: "/assistant" },
];

export function Navbar({ className, fullWidth = false }) {
    const { isDark, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut, loading } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);
    useClickOutside(userMenuRef, () => setShowUserMenu(false), showUserMenu);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    const getUserInitials = () => {
        if (user?.name) {
            return user.name[0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return "U";
    };

    const isAssistant = location.pathname === "/assistant";
    const headerClass = className || `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg" : "bg-transparent"}`;

    return (
        <header className={headerClass}>
            <nav className={`${fullWidth ? "w-full px-4 md:px-6" : "container mx-auto px-4 md:px-6"}`}>
                <div className={`flex items-center justify-between ${isAssistant ? "h-14" : "h-16 md:h-20"}`}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group min-w-0 focus:outline-none rounded-lg p-1 -ml-1">
                        <div className="relative flex-shrink-0 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg border border-white/10 group-hover:shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                            <span className="text-white font-bold text-lg md:text-xl leading-none pt-0.5">M</span>
                        </div>
                        <span className="text-lg md:text-xl font-bold hidden sm:block truncate tracking-tight text-foreground group-hover:text-foreground/80 transition-colors">
                            MarketMind
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link key={link.path} to={link.path}>
                                    <Button
                                        variant="ghost"
                                        className={`relative px-4 ${isActive
                                            ? "text-primary bg-accent/10"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {link.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">

                        <Button
                            variant="ghost"
                            onClick={toggleTheme}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {isDark ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 2v2" />
                                    <path d="M12 20v2" />
                                    <path d="m4.93 4.93 1.41 1.41" />
                                    <path d="m17.66 17.66 1.41 1.41" />
                                    <path d="M2 12h2" />
                                    <path d="M20 12h2" />
                                    <path d="m6.34 17.66-1.41 1.41" />
                                    <path d="m19.07 4.93-1.41 1.41" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                </svg>
                            )}
                        </Button>


                        {/* Auth buttons */}
                        {!loading && (
                            <>
                                {user ? (
                                    <div className="relative" ref={userMenuRef}>
                                        <button
                                            className="relative w-10 h-10 rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all shadow-md group focus:outline-none"
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                        >
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-lg leading-none pt-0.5 group-hover:scale-105 transition-transform duration-300">
                                                    {getUserInitials()}
                                                </div>
                                            )}
                                        </button>

                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg py-1 z-50">
                                                <div className="px-4 py-2 text-sm border-b">
                                                    <p className="font-medium">{user.email}</p>
                                                </div>
                                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent" onClick={handleSignOut}>
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link to="/auth" className="hidden md:block">
                                        <Button variant="primary" size="sm">
                                            Sign In
                                        </Button>
                                    </Link>
                                )}
                            </>
                        )}

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? "X" : "Menu"}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2 bg-background border-b">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block"
                            >
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                >
                                    {link.name}
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </nav>
        </header>
    );
}
