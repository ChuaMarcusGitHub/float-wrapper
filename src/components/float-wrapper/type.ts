export type AnchorPoint =
  | "top-left"
  | "middle-left"
  | "bottom-left"
  | "center"
  | "top-right"
  | "middle-right"
  | "bottom-right";

export type BoundaryType = "window" | "ref_object" | "bounding_box";
export type ExcludeAnchorList = AnchorPoint & string; // for custom anchors
export interface Coordinates {
  x: number | string;
  y: number | string;
}
export type CustomAnchor = {
  name: string;
  coordinates: Coordinates;
};
