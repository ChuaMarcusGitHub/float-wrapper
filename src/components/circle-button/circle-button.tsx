import React from "react";
import type { CSSProperties } from "react";
import { baseStyle } from "./circle-button-style";

interface CircleButtonProps {
  title: string;
  onClick?: (...args: unknown[]) => Promise<unknown>;
  style?: CSSProperties;
}

export const CircleButton: React.FC<CircleButtonProps> = ({
  title,
  onClick,
  style,
}) => {
  return (
    <button
      style={{ ...baseStyle, ...style }}
      onClick={onClick}
      aria-label={title}
      title={title}
    >
      {title}
    </button>
  );
};
