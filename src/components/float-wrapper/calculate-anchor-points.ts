import React from "react";
import type { BoundingBox } from "framer-motion";
import type { AnchorPoint, BoundaryType, Coordinates } from "./type";

const PADDING = 16;
type boundaryArgs = {
  element: HTMLDivElement;
  dragConstraints:
    | Partial<BoundingBox>
    | React.RefObject<HTMLElement | null>
    | undefined;
};
export const calculateAnchorPoints = (
  args: boundaryArgs,
  boundaryType: BoundaryType,
): Record<AnchorPoint, Coordinates> => {
  const { element, dragConstraints } = args;
  switch (boundaryType) {
    case "bounding_box":
      return calculateBoundingBoxBoundary(dragConstraints as BoundingBox);
    case "ref_object":
      return calculateRefObjectBoundary(
        element,
        dragConstraints as React.RefObject<HTMLElement>,
      );
    case "window":
    default:
      return calculateWindowBoundary(element);
  }
};

const calculateWindowBoundary = (
  el: HTMLDivElement,
): Record<AnchorPoint, Coordinates> => {
  const { x, y, width, height } = el.getBoundingClientRect();

  const leftX   = -(x - PADDING);
  const rightX  = window.innerWidth - x - width - PADDING;
  const topY    = -(y - PADDING);
  const bottomY = window.innerHeight - y - height - PADDING;
  const midX    = (window.innerWidth - width) / 2 - x;
  const midY    = (window.innerHeight - height) / 2 - y;

  const topLeft     = { x: leftX,  y: topY };
  const middleLeft  = { x: leftX,  y: midY };
  const bottomLeft  = { x: leftX,  y: bottomY };
  const center      = { x: midX,   y: midY };
  const topRight    = { x: rightX, y: topY };
  const middleRight = { x: rightX, y: midY };
  const bottomRight = { x: rightX, y: bottomY };

  return {
    "top-left": topLeft,
    "middle-left": middleLeft,
    "bottom-left": bottomLeft,
    center: center,
    "top-right": topRight,
    "middle-right": middleRight,
    "bottom-right": bottomRight,
  };
};

const calculateBoundingBoxBoundary = (
  dragConstraints: Partial<BoundingBox>,
): Record<AnchorPoint, Coordinates> => {
  const { left = 0, top = 0, right = 0, bottom = 0 } = dragConstraints;
  const midX = (left + right) / 2;
  const midY = (top + bottom) / 2;

  const topLeft     = { x: left,  y: top };
  const middleLeft  = { x: left,  y: midY };
  const bottomLeft  = { x: left,  y: bottom };
  const center      = { x: midX,  y: midY };
  const topRight    = { x: right, y: top };
  const middleRight = { x: right, y: midY };
  const bottomRight = { x: right, y: bottom };

  return {
    "top-left": topLeft,
    "middle-left": middleLeft,
    "bottom-left": bottomLeft,
    center: center,
    "top-right": topRight,
    "middle-right": middleRight,
    "bottom-right": bottomRight,
  };
};

const calculateRefObjectBoundary = (
  el: HTMLDivElement,
  dragConstraints: React.RefObject<HTMLElement>,
): Record<AnchorPoint, Coordinates> => {
  // redundancy in case the dragConstrains somehow fail to attach
  if (!dragConstraints.current) return calculateWindowBoundary(el);

  const { x, y, width, height } = el.getBoundingClientRect();
  const { left, top, right, bottom } =
    dragConstraints.current.getBoundingClientRect();

  const leftBound = left - x + PADDING;
  const topBound = top - y + PADDING;
  const rightBound = right - x - width - PADDING;
  const bottomBound = bottom - y - height - PADDING;

  const midX = (rightBound + leftBound) / 2;
  const midY = (topBound + bottomBound) / 2;

  const topLeft = { x: leftBound, y: topBound };
  const middleLeft = { x: leftBound, y: midY };
  const bottomLeft = { x: leftBound, y: bottomBound };
  const center = { x: midX, y: midY };
  const topRight = { x: rightBound, y: topBound };
  const middleRight = { x: rightBound, y: midY };
  const bottomRight = { x: rightBound, y: bottomBound };

  return {
    "top-left": topLeft,
    "middle-left": middleLeft,
    "bottom-left": bottomLeft,
    center: center,
    "top-right": topRight,
    "middle-right": middleRight,
    "bottom-right": bottomRight,
  };
};
