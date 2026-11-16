import { Icon } from "./Icon";

export function BathIcon({ className = "size-[13px] stroke-2" }: { className?: string }) {
    return (
        <Icon className={className}>
            <path d="M4 12h16" />
            <path d="M4 6V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8" />
            <path d="M2 20h20v-2a6 6 0 0 0-6-6H8a6 6 0 0 0-6 6v2z" />
        </Icon>
    );
}
