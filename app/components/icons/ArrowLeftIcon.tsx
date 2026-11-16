import { Icon } from "./Icon";

export function ArrowLeftIcon({ className = "size-4 stroke-[2.5]" }: { className?: string }) {
    return (
        <Icon className={className}>
            <path d="M19 12H5m7-7-7 7 7 7" />
        </Icon>
    );
}
