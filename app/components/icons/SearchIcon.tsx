import { Icon } from "./Icon";

export function SearchIcon({ className = "h-4 w-4 shrink-0 text-[#5d6876]" }: { className?: string }) {
    return (
        <Icon className={className}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Icon>
    );
}
