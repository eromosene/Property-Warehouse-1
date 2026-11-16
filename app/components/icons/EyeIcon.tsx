import { Icon } from "./Icon";

export function EyeIcon({ className = "h-3 w-3" }: { className?: string }) {
    return (
        <Icon className={className}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </Icon>
    );
}
