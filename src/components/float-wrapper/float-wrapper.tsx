import {
  animate,
  motion,
  useMotionValue,
  type BoundingBox,
} from "framer-motion";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { calculateAnchorPoints, transformAnchorPoints } from "./utils";
import { debounce } from "../../utils/debounce"; // TODO: REPLACE WITH PROJECT'S DEBOUNCE IMPORT
import type {
  AnchorPoint,
  BoundaryType,
  Coordinates,
  CustomAnchor,
  ExcludeAnchorList,
} from "./type";
import { useCalculateNearestAnchor } from "./hook";
import { defaultAnimate } from "./constants";

const PADDING = 16;

interface FloatWrapperProps {
  /** The anchor point the element snaps to on mount. Falls back to `center` if the value is not found. */
  defaultPosition?: AnchorPoint | string;
  /** Constrains drag to a viewport ref, a container `RefObject`, or an explicit Framer Motion `BoundingBox`. Defaults to the viewport. */
  dragConstraints?: Partial<BoundingBox> | RefObject<HTMLElement | null>;
  children: React.ReactNode;
  /** Called when the user starts dragging. */
  handleStartDrag?: () => void;
  /** Called when the user releases the drag. Fires before any snap animation. */
  handleStopDrag?: () => void;
  anchorProps?: {
    /** When `true`, the element snaps to the nearest anchor on drag release. */
    shouldAnchor?: boolean;
    /** Anchor points to exclude from snapping. */
    excludeAnchors?: ExcludeAnchorList[];
    /** Additional anchor points beyond the 7 defaults. Coordinates support `number`, `px`, and `%` strings. */
    customAnchors?: CustomAnchor[];
  };
  /** Called with `true` when a snap animation starts and `false` when it ends.
   * Use it with any state change visuals like `disable` to prevent events from occurring while snapping is in motion
   */
  onMovingChange?: (isMoving: boolean) => void;
}

export const FloatWrapper: React.FC<FloatWrapperProps> = ({
  children,
  defaultPosition,
  dragConstraints,
  handleStartDrag,
  handleStopDrag,
  anchorProps,
  onMovingChange,
}) => {
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);

  const elementRef = useRef<HTMLDivElement | null>(null);

  const [windowConstraints, setWindowContraints] =
    useState<Partial<BoundingBox>>();
  const [anchorPoints, setAnchorPoints] = useState<Record<
    AnchorPoint | string,
    Coordinates
  > | null>();

  const { calculateClosestAnchor } = useCalculateNearestAnchor({
    anchorPoints: anchorPoints ?? null,
    shouldAnchor: anchorProps?.shouldAnchor,
    excludeAnchors: anchorProps?.excludeAnchors,
    motion: { x: motionX, y: motionY },
  });

  const snapToAnchor = async () => {
    const closestAnchor = calculateClosestAnchor();
    if (!closestAnchor) return;

    const { x, y } = closestAnchor;

    console.log(`[debug] Snap Found: `, closestAnchor);
    onMovingChange?.(true);

    await Promise.all([
      animate(motionX, Number(x), { ...defaultAnimate }),
      animate(motionY, Number(y), { ...defaultAnimate }),
    ]);

    onMovingChange?.(false);
  };

  const handleResize = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    const { x, y, width, height } = el.getBoundingClientRect();
    setWindowContraints({
      top: -(y - PADDING),
      right: window.innerWidth - x - width - PADDING,
      bottom: window.innerHeight - y - height - PADDING,
      left: -(x - PADDING),
    });
  }, []);

  const handleAnchorPoints = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    // Checks if custom boundaries are used, helps determine the anchor points for the floater
    let boundaryType: BoundaryType;
    if (!dragConstraints) {
      boundaryType = "window";
    } else if ("current" in dragConstraints) {
      boundaryType = "ref_object";
    } else {
      boundaryType = "bounding_box";
    }

    const anchorRecords = calculateAnchorPoints(
      { element, dragConstraints },
      boundaryType,
    );

    if (anchorProps?.customAnchors) {
      // Perform conversion of custom anchors to a standardized offset value
      const convertedCustomAnchorRecords: Record<string, Coordinates> =
        transformAnchorPoints(anchorProps.customAnchors, {
          boundaryType,
          element,
          dragConstraints,
        });
      setAnchorPoints({ ...anchorRecords, ...convertedCustomAnchorRecords });
    } else {
      setAnchorPoints(anchorRecords);
    }
  }, [anchorProps, dragConstraints]);

  useEffect(() => {
    // Fallback when no custom boundaries are passed in
    handleResize();
    handleAnchorPoints();

    // TODO: REPLACE WITH PROJECT'S DEBOUNCE CALLBACK
    const debounceResize = debounce(() => {
      handleResize();
      handleAnchorPoints();
    }, 300);

    // Set resize listeners (For window-based operations)
    addEventListener("resize", debounceResize);
    return () => {
      removeEventListener("resize", debounceResize);
      if (elementRef.current) elementRef.current = null;
      setAnchorPoints(null); // clear anchor points
    };
  }, [dragConstraints, handleAnchorPoints, handleResize]);

  useEffect(() => {
    if (!defaultPosition || !anchorPoints) return;
    const target = anchorPoints[defaultPosition] ?? anchorPoints["center"];
    // Perform movement towards anchorpoint
    animate(motionX, target.x as number, { ...defaultAnimate });
    animate(motionY, target.y as number, { ...defaultAnimate });
  }, [anchorPoints, defaultPosition, motionX, motionY]);

  /* 
    Default window constraints that 
    should limit drag boundaries to screen dimensions 
  */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onStartDrag = (_: PointerEvent | MouseEvent | TouchEvent) => {
    handleStartDrag?.(); // dev custom handler
  };

  const onStopDrag = async () => {
    handleStopDrag?.(); // dev custom handler

    if (anchorProps?.shouldAnchor) {
      await snapToAnchor();
    }
  };

  return (
    <motion.div
      ref={elementRef}
      drag
      dragConstraints={dragConstraints ?? windowConstraints}
      className="box"
      style={{
        x: motionX,
        y: motionY,
        touchAction: "none",
        position: "fixed",
        zIndex: 999,
      }}
      onDragStart={(event) => onStartDrag(event)}
      onDragEnd={onStopDrag}
    >
      <>{children}</>
    </motion.div>
  );
};
