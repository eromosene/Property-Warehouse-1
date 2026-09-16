import { Icon } from "./Icon";

export function ClockIcon() {
    return (
        <Icon className="size-5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </Icon>
    );
}
