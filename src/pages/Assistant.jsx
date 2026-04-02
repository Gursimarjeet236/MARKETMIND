import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Navbar } from "@/components/layout/Navbar";
import { useClickOutside } from "@/hooks/useClickOutside";

const BACKEND_URL = import.meta.env.VITE_API_URL || "";

const Assistant = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [threadId, setThreadId] = useState(null);
    const [threads, setThreads] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, openUpward: false });
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const sidebarRef = useRef(null);

    // Close thread dropdown when clicking anywhere outside the sidebar
    useClickOutside(sidebarRef, useCallback(() => setMenuOpenId(null), []), !!menuOpenId);

    // Resize State: 'focused' (768px), 'default' (1024px), 'full' (100%)
    const [widthMode, setWidthMode] = useState('full');

    // ... (existing effects) ...

    const cycleWidth = () => {
        if (widthMode === 'focused') setWidthMode('default');
        else if (widthMode === 'default') setWidthMode('full');
        else setWidthMode('focused');
    };

    const getContainerWidth = () => {
        switch (widthMode) {
            case 'focused': return 'max-w-3xl';
            case 'default': return 'max-w-5xl';
            case 'full': return 'max-w-full px-4 md:px-6';
            default: return 'max-w-full px-4 md:px-6';
        }
    };

    // Initial Load & Auth Check
    useEffect(() => {
        if (!loading && !user) {
            // Redirect or show login state being handled by render
        } else if (user) {
            fetchThreads();
        }
    }, [user, loading]);

    // Update document title
    useEffect(() => {
        document.title = "Ask Edith | MarketMind";
        return () => document.title = "MarketMind";
    }, []);

    // Scroll handling — directly set scrollTop on the container.
    // This is far more reliable than scrollIntoView during streaming because
    // it doesn't depend on element position and works even when layout shifts.
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    // Data Fetching
    const fetchThreads = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/threads?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setThreads(data.threads || []);
            }
        } catch (err) {
            console.error("Failed to load threads", err);
        }
    };

    const fetchHistory = async (tid) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/history/${tid}`);
            if (res.ok) {
                const data = await res.json();
                const loadedMessages = data.messages.map((msg, idx) => ({
                    id: `hist-${idx}`,
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(), // We don't have exact timestamp from history yet
                }));
                setMessages(loadedMessages);
            }
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const loadThread = (thread) => {
        if (thread.id === threadId) return;
        setThreadId(thread.id);
        fetchHistory(thread.id);
        if (window.innerWidth < 768) setShowSidebar(false);
    };

    const startNewChat = () => {
        setThreadId(null);
        setMessages([]);
        setInput("");
        if (window.innerWidth < 768) setShowSidebar(false);
    };

    // Message Handling
    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const currentMsg = input;
        setInput("");

        // Optimistic update
        const userMsg = {
            id: Date.now().toString(),
            role: "user",
            content: currentMsg,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);

        // Generate a thread_id client-side if this is a new chat,
        // so the user_id is reliably associated on the backend.
        let activeThreadId = threadId;
        if (!activeThreadId) {
            activeThreadId = crypto.randomUUID();
            setThreadId(activeThreadId);
        }

        // Prepare request
        const apiPayload = {
            message: currentMsg,
            thread_id: activeThreadId,
            user_id: user?.id
        };

        try {
            const response = await fetch(`${BACKEND_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiPayload),
            });

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            if (!response.body) throw new Error("No response body");

            // Setup new message for streaming
            const aiMsgId = "ai-" + Date.now();
            setMessages(prev => [...prev, {
                id: aiMsgId,
                role: "assistant",
                content: "",
                timestamp: new Date(),
                isStreaming: true
            }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiContent += chunk;

                setMessages(prev => prev.map(msg =>
                    msg.id === aiMsgId ? { ...msg, content: aiContent } : msg
                ));
            }

            // End streaming
            setMessages(prev => prev.map(msg =>
                msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
            ));

            // Refresh threads (to get new thread ID or updated timestamp)
            setTimeout(fetchThreads, 1000);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: "err-" + Date.now(),
                role: "assistant",
                content: "I apologize, but I'm having trouble connecting right now. Please try again.",
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Thread Operations
    const handleDeleteThread = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Delete this chat?")) return;

        try {
            await fetch(`${BACKEND_URL}/api/threads/${id}`, { method: "DELETE" });
            setThreads(prev => prev.filter(t => t.id !== id));
            if (threadId === id) startNewChat();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRenameStart = (e, thread) => {
        e.stopPropagation();
        setEditingId(thread.id);
        setEditTitle(thread.title);
        setMenuOpenId(null);
    };

    const handleRenameSave = async () => {
        if (!editTitle.trim()) return;
        try {
            await fetch(`${BACKEND_URL}/api/threads/${editingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle })
            });
            setThreads(prev => prev.map(t =>
                t.id === editingId ? { ...t, title: editTitle } : t
            ));
            setEditingId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    // Auth Guard
    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth?mode=signup"); // Redirect to signup
        }
    }, [user, loading, navigate]);

    if (!user) return null; // Prevent flash of content or manual restriction UI

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">

            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Sidebar */}
            <aside ref={sidebarRef} className={`
                fixed md:static inset-y-0 left-0 z-50 w-[280px] flex-shrink-0 bg-card/95 backdrop-blur-md border-r border-border/50 transform transition-transform duration-300 ease-in-out
                ${showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="flex flex-col h-full">
                    {/* New Chat Button */}
                    <div className="p-3">
                        <button
                            onClick={startNewChat}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-foreground bg-muted/50 hover:bg-muted transition-colors border border-border/50 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-foreground"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                            <span>New Chat</span>
                        </button>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
                        {threads.length === 0 ? (
                            <div className="text-xs text-muted-foreground p-4 font-medium">History is empty.</div>
                        ) : (
                            <>
                                <div className="text-[10px] font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">Recent</div>
                                {threads.map(thread => (
                                    <div
                                        key={thread.id}
                                        className={`group relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all border border-transparent ${threadId === thread.id
                                            ? "bg-muted text-foreground border-border/50"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            }`}
                                        onClick={() => loadThread(thread)}
                                    >
                                        {editingId === thread.id ? (
                                            <input
                                                autoFocus
                                                className="bg-transparent border-b border-border outline-none w-full text-sm py-0 text-foreground"
                                                value={editTitle}
                                                onChange={e => setEditTitle(e.target.value)}
                                                onBlur={handleRenameSave}
                                                onKeyDown={e => e.key === 'Enter' && handleRenameSave()}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className="flex-1 text-[13px] truncate font-normal leading-5">{thread.title || "New Chat"}</span>
                                        )}

                                        {/* Menu Trigger */}
                                        <div className={`absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-inherit ${menuOpenId === thread.id ? 'opacity-100' : ''}`}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (menuOpenId === thread.id) {
                                                        setMenuOpenId(null);
                                                    } else {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const dropdownHeight = 76; // ~2 items × 38px
                                                        const spaceBelow = window.innerHeight - rect.bottom;
                                                        const openUpward = spaceBelow < dropdownHeight + 8;
                                                        setMenuPosition({
                                                            // Align dropdown's right edge a few px right of the button's right edge
                                                            x: rect.right + 6,
                                                            y: openUpward
                                                                ? rect.bottom - dropdownHeight
                                                                : rect.bottom + 4,
                                                            openUpward,
                                                        });
                                                        setMenuOpenId(thread.id);
                                                    }
                                                }}
                                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                            </button>
                                        </div>

                                        {/* Dropdown Menu - smart fixed positioning based on available screen space */}
                                        {menuOpenId === thread.id && (
                                            <div
                                                className="fixed w-32 bg-card border border-border shadow-xl rounded-md overflow-hidden z-[999] py-1"
                                                style={{
                                                    left: menuPosition.x,
                                                    top: menuPosition.y,
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={(e) => handleRenameStart(e, thread)}
                                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-foreground hover:bg-muted transition-colors"
                                                >
                                                    Rename
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteThread(e, thread.id)}
                                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-red-400 hover:bg-red-900/20 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="p-3 border-t border-border bg-card">
                        <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors cursor-pointer w-full group">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-[11px] font-bold border border-white/10 shadow-sm leading-none pt-0.5 group-hover:scale-105 transition-transform">
                                {user.name?.[0] || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-foreground truncate">{user.name || "User"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative min-w-0 bg-background">

                {/* Global Navbar - Internalized */}
                <Navbar
                    className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border h-14"
                    fullWidth={true}
                />

                {/* Mobile Sidebar Toggle (Visible only on mobile below Navbar?) */}
                {/* OR: integrate into Navbar? No, Navbar is generic. */}
                {/* We can place a small bar below navbar on mobile, or float it. */}
                {/* Let's try placing it just below Navbar. */}
                <div className="md:hidden flex items-center p-2 border-b border-border bg-background">
                    <button onClick={() => setShowSidebar(true)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-medium px-2 py-1 rounded hover:bg-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                        History
                    </button>
                </div>

                {/* Chat Container */}
                <div
                    className="flex-1 overflow-y-auto scroll-smooth w-full relative"
                    ref={scrollContainerRef}
                >
                    {/* Width Control Handle (Right Edge, Desktop Only) */}
                    <div
                        className="hidden md:flex absolute right-0 top-0 bottom-0 w-3 hover:w-4 z-20 items-center justify-center cursor-pointer hover:bg-white/5 transition-all group"
                        onClick={cycleWidth}
                        title={`Current width: ${widthMode} (Click to resize)`}
                    >
                        <div className="h-8 w-1 rounded-full bg-border group-hover:bg-foreground/40 transition-colors" />
                    </div>

                    <div className={`mainContainer flex flex-col min-h-full ${getContainerWidth()} mx-auto w-full relative transition-all duration-300 ease-in-out`}>
                        {messages.length === 0 ? (
                            // Empty State
                            <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[500px]">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                                    <span className="text-3xl">🤖</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8 tracking-tight font-inter">How can I help you today?</h1>

                                <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl">
                                    {[
                                        "Current price of Apple",
                                        "what are Bollinger Bands",
                                        "what is Relative Strength Index"
                                    ].map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(q)}
                                            className="px-5 py-3 text-sm text-foreground glass-card bg-card/50 border border-border/50 rounded-xl hover:bg-muted/50 hover:border-primary/50 hover:-translate-y-0.5 transition-all shadow-sm"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Messages List — simple block layout, scroll is handled by scrollToBottom()
                            <div className="py-8 pb-32 space-y-6">
                                {messages.map((msg, i) => (
                                    <div
                                        key={msg.id}
                                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`
                                            relative px-6 py-4 rounded-2xl
                                            ${msg.role === 'user'
                                                ? 'bg-primary/20 text-foreground border border-primary/30 rounded-tr-sm max-w-[65%]'
                                                : 'glass-card bg-card/80 text-foreground border border-border/60 shadow-md rounded-tl-sm max-w-[85%]'
                                            }
                                        `}>
                                            {msg.role === 'assistant' && (
                                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                                                    <span className="text-sm">🤖</span>
                                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Edith AI</span>
                                                </div>
                                            )}
                                            <div className={`prose prose-invert max-w-none leading-relaxed font-inter ${msg.role === 'assistant' ? 'text-[15px]' : 'text-[15px]'}`}>
                                                <p className="whitespace-pre-wrap mb-0">{msg.content}</p>
                                                {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary/50 animate-pulse align-middle" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-px" />
                    </div>
                </div>

                {/* Input Area (Sticky) */}
                <div className="flex-none p-4 md:p-6 bg-background/95 backdrop-blur-md z-20 border-t border-border/30">
                    <div className={`${getContainerWidth()} mx-auto transition-all duration-300 ease-in-out`}>
                        <div className="relative flex glass-card bg-card/50 border border-border/60 rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything..."
                                className="w-full bg-transparent border-none text-foreground placeholder-muted-foreground text-[16px] px-4 py-3 min-h-[50px] max-h-[200px] resize-none focus:ring-0 scrollbar-thin rounded-t-xl outline-none"
                                disabled={isThinking}
                                rows={1}
                                style={{ height: 'auto', minHeight: '50px' }}
                            />
                            <div className="flex justify-center items-center p-1">
                                <button
                                    onClick={(e) => handleSend(e)}
                                    disabled={!input.trim() || isThinking}
                                    className={`p-1.5 rounded-lg transition-all  ${input.trim()
                                        ? "bg-primary text-primary-foreground hover:opacity-90"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                        }`}
                                    style={{ borderRadius: '50%', height: '45px', width: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                                </button>
                            </div>
                            {/* <div className="flex justify-between  items-center px-2 pb-2">
                                <span className="text-[10px] text-neutral-600 px-2 font-medium">Use Shift + Enter for new line</span>
                            </div> */}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Assistant;
