import React from "react";
import Hero from "@/components/home/Hero";
import LiveMarketSnapshot from "@/components/home/LiveMarketSnapshot";
import AIPredictions from "@/components/home/AIPredictions";
import AdvancedCharts from "@/components/home/AdvancedCharts";
import NewsSentiment from "@/components/home/NewsSentiment";
import AIAssistantPreview from "@/components/home/AIAssistantPreview";
import Technology from "@/components/home/Technology";
import PlatformPreview from "@/components/home/PlatformPreview";

const Index = () => {
    return (
        <main className="min-h-screen bg-background text-foreground font-inter">
            {/* The global Navbar remains at the top from App.jsx layout */}
            
            {/* 1. Hero Section */}
            <Hero />
            
            {/* 2. Live Market Snapshot */}
            <LiveMarketSnapshot />

            {/* 3. AI Prediction Engine Preview */}
            <AIPredictions />

            {/* 4. Advanced Charts Preview */}
            <AdvancedCharts />

            {/* 5. News & Sentiment Intelligence */}
            <NewsSentiment />

            {/* 6. AI Assistant Section */}
            <AIAssistantPreview />

            {/* 7. Technology Behind MarketMind */}
            <Technology />

            {/* 8. Product Interface Showcase */}
            <PlatformPreview />
        </main>
    );
};

export default Index;
