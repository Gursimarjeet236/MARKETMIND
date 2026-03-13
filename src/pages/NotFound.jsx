
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Button from "@/components/common/Button";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8">
                <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
                <p className="mb-8 text-xl text-muted-foreground">Oops! Page not found</p>
                <Link to="/">
                    <Button>Return to Home</Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
