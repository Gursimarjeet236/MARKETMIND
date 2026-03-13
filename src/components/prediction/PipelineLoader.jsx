import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

const steps = [
    "Fetching market data",
    "Feature engineering",
    "VMD decomposition",
    "Graph neural network processing",
    "Generating forecast"
];

export function PipelineLoader() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        // Fast cycle through the 5 steps during the loading phase
        const interval = setInterval(() => {
            setCurrentStepIndex((prev) => {
                if (prev < steps.length - 1) return prev + 1;
                return prev; // Stop at the last step until parent unmounts it
            });
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <div className="glass-card rounded-2xl border border-border/50 bg-card/60 p-8 shadow-xl max-w-sm w-full mx-auto">
                <div className="flex items-center gap-3 mb-6 justify-center">
                    <div className="relative">
                        <div className="w-10 h-10 border-4 border-muted rounded-full" />
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
                    </div>
                </div>
                
                <h3 className="text-center font-bold mb-6 font-inter text-foreground">AI Inference Pipeline</h3>

                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        
                        return (
                            <div key={index} className="flex items-center gap-3">
                                {isCompleted ? (
                                    <CheckCircle2 className="text-success w-5 h-5 flex-shrink-0" />
                                ) : isCurrent ? (
                                    <Loader2 className="text-primary w-5 h-5 flex-shrink-0 animate-spin" />
                                ) : (
                                    <Circle className="text-muted-foreground/30 w-5 h-5 flex-shrink-0" />
                                )}
                                
                                <span className={`text-sm font-medium ${
                                    isCompleted ? 'text-muted-foreground' : 
                                    isCurrent ? 'text-foreground font-bold' : 
                                    'text-muted-foreground/50'
                                }`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
