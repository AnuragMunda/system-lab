// Shared editor constants.
import type { Health } from "@/lib/health";
import type { ComponentKind } from "./types";

/** MIME type used when dragging a component from the palette onto the canvas. */
export const DND_MIME = "application/systemlab-component";

/** Solid colours used for the minimap nodes, keyed by health. */
export const MINDMAP_COLORS: Record<Health, string> = {
  healthy: "#4ade80",
  degraded: "#f0a94e",
  critical: "#f2555a",
};

/** Default canvas position used when a component is added by click (not drag). */
export const CLICK_DROP_POSITION = { x: 120, y: 120 };

export type { ComponentKind };
