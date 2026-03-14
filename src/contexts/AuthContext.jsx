import { createContext, useContext, useState, useRef } from "react";
import { useGoogleLogin } from '@react-oauth/google';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
    // All routes under API_URL will now be prefixed with /api by the backend router
    // Stores a callback to notify callers (e.g. Auth.jsx) when Google auth finishes
    // for ANY reason: success, error, or the user closing/cancelling the popup.
    const onGoogleCompleteRef = useRef(null);

    const signIn = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || data.message || "Login failed");

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Added persistence
            setUser(data.user);
            return { data: data.user, error: null };
        } catch (error) {
            console.error("SignIn Error:", error);
            if (!error.message && !error.response) {
                return { data: null, error: { message: "Unable to connect to the server. Please check if the backend is running." } };
            }
            return { data: null, error };
        }
    };

    const signUp = async (email, password, name) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || data.message || "Signup failed");

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Added persistence
            setUser(data.user);
            return { data: data.user, error: null };
        } catch (error) {
            console.error("SignUp Error:", error);
            if (!error.message && !error.response) {
                return { data: null, error: { message: "Unable to connect to the server. Please check if the backend is running." } };
            }
            return { data: null, error };
        }
    };

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // 1. Get User Info from Google
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleData = await userInfoRes.json();

                // 2. Send Real Profile to Backend
                const profile = {
                    googleId: googleData.sub,
                    name: googleData.name,
                    email: googleData.email,
                    avatar: googleData.picture
                };

                const res = await fetch(`${API_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile),
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.detail || data.message || "Google auth failed");

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            } catch (error) {
                console.error("Google Login Failed", error);
                onGoogleCompleteRef.current?.({ error });
            } finally {
                setLoading(false);
                onGoogleCompleteRef.current?.(null);
                onGoogleCompleteRef.current = null;
            }
        },
        onError: (error) => {
            console.log('Login Failed:', error);
            onGoogleCompleteRef.current?.({ error });
            onGoogleCompleteRef.current = null;
        },
        // Called when the user closes the Google popup WITHOUT completing auth
        onNonOAuthError: (error) => {
            console.log('Google popup closed or cancelled:', error?.type);
            onGoogleCompleteRef.current?.({ cancelled: true });
            onGoogleCompleteRef.current = null;
        },
    });

    const signInWithGoogle = (onComplete) => {
        // Store the callback so all exit paths (success/error/cancel) can call it
        onGoogleCompleteRef.current = onComplete || null;
        login();
    };

    const signOut = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Added persistence
        // Also clear any stored predictions for the user across different models
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('marketmind_preds_') || key.startsWith('marketmind_random_stocks_'))) {
                localStorage.removeItem(key);
            }
        }
        setUser(null);
        setSession(null);
    };

    // Initialize state from localStorage
    useState(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
            }
        }
    });

    return (
        <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
