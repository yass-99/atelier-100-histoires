import type * as React from "react";

/** Élément « nœud » (JSX libre : icône, badge, etc.). */
export type LogoItemNode = {
  node: React.ReactNode;
  title?: string;
  href?: string;
  ariaLabel?: string;
};

/** Élément « image » (logo en src). */
export type LogoItemImage = {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  href?: string;
};

export type LogoItem = LogoItemNode | LogoItemImage;

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const LogoLoop: React.FC<LogoLoopProps>;
export default LogoLoop;
