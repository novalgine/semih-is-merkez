import { cn } from "@/lib/utils";
import React from "react";

export function InteractiveCard({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "transition-transform duration-200 ease-out hover:scale-[1.01] cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
