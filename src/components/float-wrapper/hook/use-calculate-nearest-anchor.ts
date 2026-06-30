import { useCallback, useMemo } from "react";
import type { Coordinates, ExcludeAnchorList } from "../type";
import type { MotionValue } from "framer-motion";

interface HookToNearestAnchorProps {
  /** When `false`, `calculateClosestAnchor` returns `null` without computing. */
  shouldAnchor?: boolean;
  /** The full set of available anchor points. Can be `null` or `undefined` before the component mounts. */
  anchorPoints: Record<string, Coordinates> | undefined | null;
  /** Live motion values representing the element's current position. */
  motion: {
    x: MotionValue<number>;
    y: MotionValue<number>;
  };
  /** Anchor names to exclude from the nearest-anchor calculation. */
  excludeAnchors?: ExcludeAnchorList[];
}
/**
 * Returns a `calculateClosestAnchor` callback that, when called, reads the
 * current motion position and returns the `Coordinates` of the nearest
 * applicable anchor point. Returns `null` if `shouldAnchor` is false or no
 * anchor points are available.
 */
export const useCalculateNearestAnchor = ({
  motion,
  anchorPoints,
  shouldAnchor = false, // Determines if the snap to Anchor should trigger
  excludeAnchors = [],
}: HookToNearestAnchorProps) => {
  // Filter out anchors that the float item should not snap to.
  const applicableAnchors = useMemo(() => {
    if (anchorPoints) {
      return Object.entries(anchorPoints).filter(
        ([name]) => !excludeAnchors.includes(name as ExcludeAnchorList),
      );
    }
    return [];
  }, [anchorPoints, excludeAnchors]);

  const calculateClosestAnchor = useCallback((): Coordinates | null => {
    if (!shouldAnchor || !anchorPoints) return null; // Guard clause to prevent snapping

    const x = motion.x.get();
    const y = motion.y.get();

    // Calculate cloesst diff
    let closestAnchor = "";
    let closestDist = Infinity;

    for (const [name, coords] of applicableAnchors) {
      const dx = (coords.x as number) - x;
      const dy = (coords.y as number) - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < closestDist) {
        closestDist = dist;
        closestAnchor = name;
      }
    }
    return anchorPoints[closestAnchor];
  }, [anchorPoints, applicableAnchors, motion.x, motion.y, shouldAnchor]);
  return {
    calculateClosestAnchor,
  };
};
