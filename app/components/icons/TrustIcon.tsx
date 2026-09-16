import { ReactElement } from "react";
import { Icon } from "./Icon";

export type TrustIconKind = "shield" | "check" | "chat" | "lock";

const paths: Record<TrustIconKind, ReactElement> = {
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.1 2.8 7.9 7 9.5 4.2-1.6 7-5.4 7-9.5V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.6-4" />
    </>
  ),
  check: (
    <>
      <path d="M12 3 5 6v5.5c0 4.1 2.8 7.9 7 9.5 4.2-1.6 7-5.4 7-9.5V6l-7-3Z" />
      <path d="m9 11 3 3 5-5" />
    </>
  ),
  chat: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
};

export function TrustIcon({ kind }: { kind: TrustIconKind }) {
  return <Icon className="size-5">{paths[kind]}</Icon>;
}
