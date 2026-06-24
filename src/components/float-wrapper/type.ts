export type AnchorPoint =
  | "top-left"
  | "middle-left"
  | "bottom-left"
  | "center"
  | "top-right"
  | "middle-right"
  | "bottom-right";

export type CustomAnchor = {
  name: string;
  coordinates: { x: string; y: string };
};
