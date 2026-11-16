import { Icon } from "./Icon";

export function FilterIcon({ className = "size-4 stroke-2" }: { className?: string }) {
    return (
        <Icon className={className}>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
        </Icon>
    );
}
