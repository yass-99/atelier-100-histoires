import Link from "next/link";
import type { ReactNode } from "react";

type Common = { label: string; children: ReactNode; className?: string };

export function CircleButton(
  props: Common &
    (
      | { as: "link"; href: string; transitionTypes?: string[] }
      | { as?: "button"; onClick?: () => void }
    )
) {
  const cls = `circle-btn ${props.className ?? ""}`;
  if (props.as === "link") {
    return (
      <Link
        href={props.href}
        aria-label={props.label}
        transitionTypes={props.transitionTypes}
        className={cls}
      >
        {props.children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={props.label} onClick={props.onClick} className={cls}>
      {props.children}
    </button>
  );
}
