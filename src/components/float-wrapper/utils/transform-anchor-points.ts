import type { BoundingBox } from "framer-motion";
import type React from "react";
import type { BoundaryType, Coordinates, CustomAnchor } from "../type";

const PX_REGEX = /^-?\d+(\.\d+)?px$/;
const PERCENT_REGEX = /^-?\d+(\.\d+)?%$/;

type BoundaryArgs = {
  boundaryType: BoundaryType;
  element: HTMLDivElement;
  dragConstraints?: Partial<BoundingBox> | React.RefObject<HTMLElement | null>;
};

/**
 * Converts an array of `CustomAnchor` definitions into a coordinate record
 * keyed by anchor name, resolving all coordinate values to pixel offsets
 * relative to the active boundary.
 *
 * @param customAnchors - Array of developer-defined anchor points
 * @param boundaryArgs - The active boundary context used to resolve percentage-based coordinates
 * @returns A record mapping each anchor name to its resolved `{ x, y }` offset
 */
export const transformAnchorPoints = (
  customAnchors: CustomAnchor[],
  boundaryArgs: BoundaryArgs,
): Record<string, Coordinates> => {
  const { width, height } = resolveBoundaryDimensions(boundaryArgs);
  let customAnchorRecord: Record<string, Coordinates> = {};

  customAnchors.forEach((ca) => {
    customAnchorRecord = {
      ...customAnchorRecord,
      [ca.name]: {
        x: resolveValue(ca.coordinates.x, width),
        y: resolveValue(ca.coordinates.y, height),
      },
    };
  });

  return customAnchorRecord;
};

/**
 * Derives the boundary width and height from the active boundary type.
 * Falls back to window dimensions if the ref is not yet attached.
 */
const resolveBoundaryDimensions = (
  boundaryArgs: BoundaryArgs,
): { width: number; height: number } => {
  if (boundaryArgs.boundaryType === "ref_object") {
    const ref = boundaryArgs.dragConstraints as React.RefObject<HTMLElement>;
    if (!ref.current)
      return { width: window.innerWidth, height: window.innerHeight };
    return ref.current.getBoundingClientRect();
  }
  if (boundaryArgs.boundaryType === "bounding_box") {
    const {
      left = 0,
      right = 0,
      top = 0,
      bottom = 0,
    } = boundaryArgs.dragConstraints as Partial<BoundingBox>;
    return { width: right - left, height: bottom - top };
  }
  return { width: window.innerWidth, height: window.innerHeight };
};

/**
 * Resolves a single coordinate value to a pixel number.
 *
 * Supported formats:
 * - `number` or numeric string (e.g. `100`, `"100"`) — used as-is
 * - `"100%"` — resolved as a percentage of `boundarySize`
 * - `"100px"` — parsed to a number, unit stripped
 *
 * @throws If the format is not recognised
 */
const resolveValue = (value: number | string, boundarySize: number): number => {
  if (typeof value === "number" || !isNaN(Number(value))) { // 100 or "100"
    return Number(value);
  }
  if (PERCENT_REGEX.test(value)) { // "100%"
    return (parseFloat(value) / 100) * boundarySize;
  }
  if (PX_REGEX.test(value)) { // "100px"
    return parseFloat(value);
  }
  console.error(
    `[resolveValue] Unsupported coordinate value "${value}". Use a number, px, or % string.`,
  );
  throw new Error(`[resolveValue] Unsupported coordinate format: "${value}"`);
};
