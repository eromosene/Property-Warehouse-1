import { Icon } from "./Icon";

export function PlusIcon() {
    return (
        <Icon className="h-[14px] w-[14px]">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </Icon>
    );
}
