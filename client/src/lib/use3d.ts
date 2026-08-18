import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * Shared 3D interaction primitives.
 *
 * Everything here is CSS 3D (perspective / preserve-3d / translateZ) driven by
 * framer-motion springs. No WebGL: the catalog has no 3D models, so a real
 * Three.js scene would add ~550KB to rotate a 2D photograph.
 *
 * Rules enforced in one place:
 *  - pointer-driven depth only on devices with a fine pointer (mouse / pen)
 *  - everything collapses to zero movement under `prefers-reduced-motion`
 *  - raw pointer input is never bound directly to a rotation; it feeds a
 *    normalized -0.5..0.5 value that is spring-smoothed before use
 */

/** Tilt / parallax ceilings. Restrained on purpose — premium, not gimmicky. */
export const DEPTH = {
  cardTilt: 6,
  categoryTilt: 5,
  heroTilt: 8,
  galleryTilt: 7,
  /** Spring used for pointer-tracked rotation: settles fast, never wobbles. */
  pointerSpring: { stiffness: 170, damping: 22, mass: 0.55 },
  /** Slower spring for large hero layers so parallax feels weighty. */
  sceneSpring: { stiffness: 90, damping: 20, mass: 0.7 },
} as const;

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * True when the device has a precise pointer that can hover — i.e. when
 * mouse-follow 3D is meaningful. Touch devices get scroll/tap depth instead.
 */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/**
 * Master gate for pointer-driven 3D. Starts `false` and only turns on after
 * mount, so the first paint is never a mid-transform frame.
 */
export function useDepthCapable(): boolean {
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  return finePointer && !reduced;
}

/** Map a normalized -0.5..0.5 motion value onto a symmetric numeric range. */
export function useParallax(
  source: MotionValue<number>,
  strength: number
): MotionValue<number> {
  return useTransform(source, [-0.5, 0.5], [-strength, strength]);
}

type PointerFieldOptions = {
  /** Spring config applied to the normalized pointer position. */
  spring?: { stiffness: number; damping: number; mass?: number };
  /** Track the pointer across the whole window rather than the element only. */
  global?: boolean;
};

type PointerField<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  /** Spring-smoothed pointer position, -0.5 (left/top) .. 0.5 (right/bottom). */
  px: MotionValue<number>;
  py: MotionValue<number>;
  /** Whether the pointer is currently over the element. */
  hovered: boolean;
  /** Whether pointer-driven depth is active on this device at all. */
  enabled: boolean;
  handlers: {
    onPointerMove: (event: React.PointerEvent<T>) => void;
    onPointerEnter: (event: React.PointerEvent<T>) => void;
    onPointerLeave: () => void;
  };
};

/**
 * Normalized, spring-smoothed pointer position relative to an element.
 * Pointer reads are coalesced into a single rAF tick so a fast mouse can never
 * trigger more than one layout read per frame.
 */
function usePointerField<T extends HTMLElement>({
  spring = DEPTH.pointerSpring,
  global = false,
}: PointerFieldOptions = {}): PointerField<T> {
  const enabled = useDepthCapable();
  const ref = useRef<T | null>(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, spring);
  const py = useSpring(rawY, spring);

  const frame = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);

  const flush = useCallback(() => {
    frame.current = 0;
    const point = pending.current;
    const node = ref.current;
    if (!point || !node) return;
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (point.x - rect.left) / rect.width - 0.5;
    const ny = (point.y - rect.top) / rect.height - 0.5;
    // Clamp so a pointer just outside the box (global mode) stays in range.
    rawX.set(Math.max(-0.5, Math.min(0.5, nx)));
    rawY.set(Math.max(-0.5, Math.min(0.5, ny)));
  }, [rawX, rawY]);

  const queue = useCallback(
    (x: number, y: number) => {
      pending.current = { x, y };
      if (!frame.current) frame.current = requestAnimationFrame(flush);
    },
    [flush]
  );

  const reset = useCallback(() => {
    pending.current = null;
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    []
  );

  // Global mode keeps the scene alive while the pointer roams the viewport.
  useEffect(() => {
    if (!enabled || !global) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      queue(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, global, queue]);

  const handlers = useMemo(
    () => ({
      onPointerMove: (event: React.PointerEvent<T>) => {
        if (!enabled || global || event.pointerType === "touch") return;
        queue(event.clientX, event.clientY);
      },
      onPointerEnter: (event: React.PointerEvent<T>) => {
        if (!enabled || event.pointerType === "touch") return;
        setHovered(true);
      },
      onPointerLeave: () => {
        if (!enabled) return;
        setHovered(false);
        if (!global) reset();
      },
    }),
    [enabled, global, queue, reset]
  );

  return { ref, px, py, hovered, enabled, handlers };
}

/**
 * Hero / banner scene field: tracks the pointer across the section and exposes
 * the normalized position so each depth layer can move at its own rate.
 */
export function usePointerScene<T extends HTMLElement = HTMLDivElement>(
  options: { spring?: PointerFieldOptions["spring"] } = {}
) {
  return usePointerField<T>({
    spring: options.spring ?? DEPTH.sceneSpring,
  });
}

type Tilt3dOptions = {
  /** Maximum rotation on either axis, in degrees. */
  max?: number;
  spring?: PointerFieldOptions["spring"];
};

/**
 * Subtle card tilt. Cursor right tips the right edge away, cursor top tips the
 * top edge away — the card reads as a physical object being pressed, and
 * springs back to flat when the pointer leaves.
 */
export function useTilt3d<T extends HTMLElement = HTMLDivElement>({
  max = DEPTH.cardTilt,
  spring = DEPTH.pointerSpring,
}: Tilt3dOptions = {}) {
  const field = usePointerField<T>({ spring });
  const rotateY = useTransform(field.px, [-0.5, 0.5], [-max, max]);
  const rotateX = useTransform(field.py, [-0.5, 0.5], [max, -max]);

  return { ...field, rotateX, rotateY };
}

/**
 * Pointer position as a percentage string pair, for gradient/spotlight
 * positions that need `%` rather than px.
 */
export function usePointerPercent(
  px: MotionValue<number>,
  py: MotionValue<number>
) {
  const left = useTransform(px, value => `${(value + 0.5) * 100}%`);
  const top = useTransform(py, value => `${(value + 0.5) * 100}%`);
  return { left, top };
}
