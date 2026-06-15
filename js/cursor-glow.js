// cursor-glow.js
// A soft blurred glow that follows the cursor and tints toward whatever
// the visitor is hovering (or the currently recommended drink's color).

const glow = document.getElementById("cursorGlow");

const DEFAULT_COLOR = "#FFD9E8";
let baseColor = DEFAULT_COLOR;

function setGlowColor(hex) {
  glow.style.setProperty("--glow-color", hex);
}

/**
 * Called whenever a new recommendation is shown — the ambient glow
 * settles toward that drink's color until something else is hovered.
 */
export function setBaseColor(hex) {
  baseColor = hex || DEFAULT_COLOR;
  setGlowColor(baseColor);
}

function init() {
  // Position the glow at the cursor (CSS transition gives it a gentle lag).
  window.addEventListener("pointermove", (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });

  // Any element with data-glow="#hex" tints the glow on hover.
  document.body.addEventListener("pointerover", (e) => {
    const target = e.target.closest("[data-glow]");
    if (target) setGlowColor(target.dataset.glow);
  });

  document.body.addEventListener("pointerout", (e) => {
    const target = e.target.closest("[data-glow]");
    if (target) setGlowColor(baseColor);
  });

  // Start centered-ish so it doesn't pop in from the corner.
  glow.style.left = "50%";
  glow.style.top = "30%";
  setGlowColor(baseColor);
}

init();
