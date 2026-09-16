import { Icon } from "./Icon";

export function ShieldIcon({ small = false }: { small?: boolean }) {
    return (
        <Icon
            className={
                small
                    ? "h-[10px] w-[10px] text-[#15935f]"
                    : "h-[22px] w-[22px] text-[#4ade97]"
            }
        >
            <path d="M12 3 5 6v5.5c0 4.1 2.8 7.9 7 9.5 4.2-1.6 7-5.4 7-9.5V6l-7-3Z" />
            <path d="m9.5 12 1.7 1.7 3.6-4" />
        </Icon>
    );
}
