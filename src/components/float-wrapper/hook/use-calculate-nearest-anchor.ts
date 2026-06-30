import { useCallback, useMemo } from "react";
import type { Coordinates, ExcludeAnchorList } from "../type";
import type { MotionValue } from "framer-motion";

interface HookToNearestAnchorProps {
  shouldAnchor?: boolean;
  anchorPoints: Record<string, Coordinates> | undefined | null;
  motion: {
    x: MotionValue<number>;
    y: MotionValue<number>;
  };
  excludeAnchors?: ExcludeAnchorList[];
}
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
