import { Icon } from "./Icon";

export function ArrowIcon({ className = "h-[13px] w-[13px]" }: { className?: string }) {
    return (
        <Icon className={className}>
            <path d="M5 12h13m-5-5 5 5-5 5" />
        </Icon>
    );
}
