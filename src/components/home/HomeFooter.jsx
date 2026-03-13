import React from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

const HomeFooter = () => {
    return (
        <footer className="bg-background border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">

                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center glow-primary">
                                <Activity size={20} />
                            </div>
                            <span className="font-bold text-xl font-inter text-foreground tracking-tight">MarketMind</span>
                        </Link>
                        <p className="text-muted-foreground text-sm font-inter">
                            Advanced machine learning and institutional-grade analytics for retail traders.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground font-inter mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
                            <li><Link to="/predictions" className="text-sm text-muted-foreground hover:text-primary transition-colors">ML Predictions</Link></li>
                            <li><Link to="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">News & Sentiment</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground font-inter mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <li><Link to="/assistant" className="text-sm text-muted-foreground hover:text-primary transition-colors">Edith AI Assistant</Link></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors text-opacity-50 cursor-not-allowed">Documentation</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors text-opacity-50 cursor-not-allowed">API Reference</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground font-inter mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Risk Disclosure</a></li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-muted-foreground text-sm font-inter">
                        &copy; {new Date().getFullYear()} MarketMind Intelligence. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;
