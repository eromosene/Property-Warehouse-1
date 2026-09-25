import { Icon } from "./Icon";

export function GlobeIcon() {
    return (
        <Icon className="size-5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 0 20" />
            <path d="M2 12h20" />
            <path d="M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10" />
            <path d="M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10" />
        </Icon>
    );
}
