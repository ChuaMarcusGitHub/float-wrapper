import { motion, type BoundingBox } from "framer-motion";
import React, { useEffect, useRef, useState, type RefObject } from "react";
import { debounce } from "../../utils/debounce";
import type { AnchorPoint, CustomAnchor } from "./type";

const PADDING = 16;

interface FloatWrapperProps {
  dragConstraints?: Partial<BoundingBox> | RefObject<HTMLElement | null>;
  children: React.ReactNode;
  handleStartDrag?: () => void;
  handleStopDrag?: () => void;
  anchorProps: {
    shouldAnchor: boolean;
    excludeAnchors: AnchorPoint[]
    customAnchors: CustomAnchor[]
  }
}

export const FloatWrapper: React.FC<FloatWrapperProps> = ({
  children,
  dragConstraints,
  handleStartDrag,
  handleStopDrag,
}) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [windowConstraints, setWindowContraints] =
    useState<Partial<BoundingBox>>();

  const handleResize = debounce(() => {
    setWindowContraints({
      top: PADDING,
      left: PADDING,
      right: PADDING,
      bottom: PADDING,
    });
  }, 300);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const { x, y, width, height } = el.getBoundingClientRect();
    setWindowContraints({
      top: -(y - PADDING),
      right: window.innerWidth - x - width - PADDING,
      bottom: window.innerHeight - y - height - PADDING,
      left: -(x - PADDING),
    });
    addEventListener("resize", handleResize);
    return () => {
      removeEventListener("resize", handleResize);
      if (elementRef.current) elementRef.current = null;
    };
  }, [handleResize]);

  /* 
    Default window constraints that 
    should limit drag boundaries to screen dimensions 
  */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onStartDrag = (_: PointerEvent | MouseEvent | TouchEvent) => {
    handleStartDrag?.();
  };

  const onStopDrag = () => {
    handleStopDrag?.();
  };

  return (
    <motion.div
      ref={elementRef}
      drag
      dragConstraints={dragConstraints ?? windowConstraints}
      className="box"
      style={{ touchAction: "none", position: "fixed", zIndex: 999 }}
      onDragStart={(event) => onStartDrag(event)}
      onDragEnd={onStopDrag}
    >
      <>{children}</>
    </motion.div>
  );
};
