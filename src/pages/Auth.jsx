
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

const Auth = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, signIn, signUp, signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await signIn(email, password);
            } else {
                result = await signUp(email, password, name);
            }

            if (result.error) {
                setError(result.error.message);
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setIsLoading(true);
        // Pass a callback — it will be called on success, error, OR popup cancel.
        // This guarantees isLoading is always reset, preventing the stuck "Processing..." state.
        signInWithGoogle(() => {
            setIsLoading(false);
        });
    };

    return (
        <main className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 bg-background relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-20 pointer-events-none" />

            <div className="w-full max-w-md animate-fade-in-up relative z-10">
                <div className="rounded-2xl border bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden glass-card">
                    <div className="text-center p-8 bg-gradient-to-b from-primary/5 to-transparent border-b">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                                🔐
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">
                            Welcome to <span className="text-primary">MarketMind</span>
                        </h2>
                        <p className="text-muted-foreground">
                            Sign in to access AI-powered market insights
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Tabs */}
                        <div className="grid grid-cols-2 gap-1 mb-8 bg-muted/50 p-1.5 rounded-xl">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${isLogin ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${!isLogin ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"}`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="pl-3"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-3"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-3"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                            </Button>
                        </form>

                        <div className="relative my-6 text-center text-sm">
                            <span className="bg-card px-2 text-muted-foreground relative z-10">Or continue with</span>
                            <div className="absolute inset-x-0 top-1/2 h-px bg-border -z-0"></div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            <span>🌐</span>
                            Continue with Google
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Auth;
