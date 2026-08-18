/**
 * Add-to-cart flight + cart badge feedback.
 *
 * Deliberately implemented outside React with the Web Animations API: the
 * flying element is a throwaway clone that never needs to re-render, and
 * animating it via WAAPI keeps the work on the compositor (transform + opacity
 * only) instead of triggering React updates 60 times a second.
 */

export const CART_BUMP_EVENT = "solecraft_cart_bump";

/** Tell the header that the cart changed, so the bag icon can react. */
export function bumpCart() {
  window.dispatchEvent(new CustomEvent(CART_BUMP_EVENT));
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Send a cloned product thumbnail from `source` to the header bag on a short
 * arc, then bump the badge. Falls back to bumping the badge alone whenever the
 * flight would be inappropriate or impossible (reduced motion, no visible cart
 * target, off-screen source, missing layout).
 */
export function flyToCart(
  source: HTMLElement | null | undefined,
  imageUrl?: string | null
) {
  const target = document.querySelector<HTMLElement>("[data-cart-target]");

  if (!source || !target || prefersReducedMotion()) {
    bumpCart();
    return;
  }

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  if (!from.width || !to.width) {
    bumpCart();
    return;
  }

  // The header can be scrolled out of view on some layouts; skip the flight
  // rather than animating toward a point the user cannot see.
  if (to.bottom < 0 || to.top > window.innerHeight) {
    bumpCart();
    return;
  }

  // Keep the clone small so the motion reads as a quick gesture, not a
  // full-screen product sliding across the page.
  const size = Math.min(132, Math.max(72, from.width * 0.42));
  const scaleEnd = Math.max(0.18, (to.width * 0.62) / size);

  const clone = document.createElement("div");
  clone.setAttribute("aria-hidden", "true");
  clone.style.cssText = [
    "position:fixed",
    `left:${from.left + from.width / 2 - size / 2}px`,
    `top:${from.top + from.height / 2 - size / 2}px`,
    `width:${size}px`,
    `height:${size}px`,
    "z-index:90",
    "pointer-events:none",
    "border-radius:14px",
    "background-color:var(--moss)",
    "background-size:cover",
    "background-position:center",
    "box-shadow:0 18px 40px rgba(18,29,24,0.28)",
    "will-change:transform,opacity",
  ].join(";");

  if (imageUrl) clone.style.backgroundImage = `url("${imageUrl}")`;

  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const animation = clone.animate(
    [
      {
        transform: "translate3d(0,0,0) scale(1) rotate(0deg)",
        opacity: 1,
        offset: 0,
      },
      {
        // Lift through an arc so the parcel feels thrown, not dragged.
        transform: `translate3d(${dx * 0.55}px, ${dy * 0.5 - 74}px, 0) scale(${
          (1 + scaleEnd) / 2
        }) rotate(-7deg)`,
        opacity: 0.95,
        offset: 0.55,
      },
      {
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scaleEnd}) rotate(2deg)`,
        opacity: 0.15,
        offset: 1,
      },
    ],
    {
      duration: 620,
      easing: "cubic-bezier(0.36, 0.06, 0.28, 1)",
      fill: "forwards",
    }
  );

  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    clone.remove();
    bumpCart();
  };

  animation.addEventListener("finish", finish);
  animation.addEventListener("cancel", finish);
  // Safety net in case the tab is backgrounded mid-flight and `finish` never
  // fires — the clone must never be left behind.
  window.setTimeout(finish, 1200);
}
