import React from "react";
import { resolveLucideIcon } from "../utils/themeStyles";

export interface DynamicIconProps {
  name?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/**
 * Crash-proof Lucide icon wrapper for Remotion scenes.
 * Uses curated tree-shakable lookup with Sparkles fallback and explicit inline SVG styling
 * for 1:1 parity between @remotion/player and @remotion/web-renderer.
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 48,
  color = "#06B6D4",
  strokeWidth = 2,
  style,
}) => {
  const IconComponent = resolveLucideIcon(name);

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={{
        display: "block",
        flexShrink: 0,
        ...style,
      }}
    />
  );
};
