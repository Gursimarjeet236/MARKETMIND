function Skeleton({ className, ...props }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-muted/50 ${className}`}
            {...props}
        />
    );
}

export { Skeleton };
