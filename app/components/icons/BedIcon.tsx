import { Icon } from "./Icon";

export function BedIcon({ className = "size-[13px] stroke-2" }: { className?: string }) {
    return (
        <Icon className={className}>
            <path d="M2 20h20M4 20V8l8-6 8 6v12" />
            <rect x="9" y="14" width="6" height="6" />
        </Icon>
    );
}
