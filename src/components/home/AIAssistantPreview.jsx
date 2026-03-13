import React from "react";
import { Link } from "react-router-dom";
import { Bot, User, ArrowRight } from "lucide-react";

// Profile Icon specific to the MarketMind brand
const MarketMindAvatar = () => (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#8B5CF6] flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
        M
    </div>
);

const UserAvatar = () => (
    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground shadow-inner">
        <User size={20} />
    </div>
);

const AIAssistantPreview = () => {
    return (
        <section className="py-24 bg-card/30 border-b border-border overflow-hidden relative">
            {/* Background decors */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left: Chat UI Mock */}
                    <div className="glass-card rounded-2xl border border-border/50 shadow-2xl flex flex-col h-[500px]">
                        {/* Header */}
                        <div className="p-4 border-b border-border/50 bg-card/40 flex items-center gap-4">
                            <MarketMindAvatar />
                            <div>
                                <h3 className="font-bold text-foreground font-inter">Meet Edith</h3>
                                <div className="flex items-center gap-2 text-xs text-success font-mono">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                    Online / Context Active
                                </div>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col justify-end bg-background/50">
                            {/* User Message */}
                            <div className="flex justify-end items-start gap-4">
                                <div className="bg-primary/20 text-foreground px-4 py-3 rounded-2xl rounded-tr-sm text-sm border border-primary/20 max-w-[80%] font-inter">
                                    Analyze Tesla stock trend. High level summary.
                                </div>
                                <UserAvatar />
                            </div>

                            {/* Edith Response */}
                            <div className="flex justify-start items-start gap-4">
                                <MarketMindAvatar />
                                <div className="bg-card text-foreground px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-border/50 shadow-sm max-w-[85%] font-inter space-y-3">
                                    <p>Tesla (TSLA) currently shows <strong className="text-success">bullish momentum</strong> driven by structural technical breakouts and positive catalyst news.</p>
                                    <div className="pl-3 border-l-2 border-primary text-muted-foreground font-mono text-xs space-y-1">
                                        <p>+ SMA 50 crossed above SMA 200 (Golden Cross)</p>
                                        <p>+ Sentiment score indicates +68% positive bias</p>
                                        <p>- Volatility remains slightly elevated (VIX correlation)</p>
                                    </div>
                                    <p>Short-term AI projection targets resistance at $215.</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Input Bar */}
                        <div className="p-4 border-t border-border/50 bg-card/40">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    disabled
                                    placeholder="Type your prompt..." 
                                    className="w-full bg-background border border-border rounded-xl h-12 pl-4 pr-12 text-sm text-muted-foreground"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                                    <Bot size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="order-first lg:order-last">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
                            <Bot size={16} /> Conversational AI
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground font-inter mb-6">
                            Meet Edith — Your AI Market Analyst
                        </h2>
                        <p className="text-lg text-muted-foreground font-inter mb-8">
                            A highly tuned LLM agent embedded directly into the research terminal. Ask highly contextual questions about fundamentals, realtime prices, or machine learning projections without leaving the dashboard.
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                "Analyze Tesla trend",
                                "Predict Nvidia movement",
                                "What is Apple's current sentiment?"
                            ].map((query, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground font-mono bg-card px-4 py-3 rounded-lg border border-border w-fit">
                                    <span className="text-primary italic">"</span>
                                    {query}
                                    <span className="text-primary italic">"</span>
                                </div>
                            ))}
                        </div>

                        <Link
                            to="/assistant"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                        >
                            Try Edith AI Assistant <ArrowRight size={18} />
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AIAssistantPreview;
