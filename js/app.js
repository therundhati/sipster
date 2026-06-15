// app.js
import { filterBeverages, findBestMatch, randomBeverage } from "./matcher.js";
import { renderResult, showEmpty } from "./render.js";
import { setBaseColor } from "./cursor-glow.js";

const CHIP_GLOW_PALETTE = ["#FFD9E8", "#C9E4DE", "#F4D9A0", "#E3D6F0"];

const state = {
  moods: [],
  ingredientsMap: new Map(),
  beverages: [],
  selectedMood: null, // mood object or null
  temperature: "any", // "any" | "hot" | "cold"
  alcohol: "any", // "any" | "alcoholic" | "non-alcoholic"
  mode: null, // null | "mood" | "surprise"
  currentBeverage: null,
  simplified: false,
};

// ---- DOM refs ----------------------------------------------------------
const moodSearch = document.getElementById("moodSearch");
const clearSearch = document.getElementById("clearSearch");
const moodChipsEl = document.getElementById("moodChips");
const tempToggle = document.getElementById("tempToggle");
const alcToggle = document.getElementById("alcToggle");
const surpriseBtn = document.getElementById("surpriseBtn");
const simplifyBtn = document.getElementById("simplifyBtn");

// ---- data loading -------------------------------------------------------
async function loadData() {
  const [moods, ingredients, beverages] = await Promise.all([
    fetch("./data/moods.json").then((r) => r.json()),
    fetch("./data/ingredients.json").then((r) => r.json()),
    fetch("./data/beverages.json").then((r) => r.json()),
  ]);

  state.moods = moods;
  state.beverages = beverages;
  state.ingredientsMap = new Map(ingredients.map((i) => [i.id, i]));
}

// ---- mood chips ----------------------------------------------------------
function renderMoodChips() {
  moodChipsEl.innerHTML = "";

  state.moods.forEach((mood, index) => {
    const chip = document.createElement("button");
    chip.className = "mood-chip";
    chip.textContent = mood.label;
    chip.dataset.moodId = mood.id;
    chip.dataset.glow = CHIP_GLOW_PALETTE[index % CHIP_GLOW_PALETTE.length];
    chip.style.setProperty("--chip-accent", chip.dataset.glow);

    chip.addEventListener("click", () => selectMood(mood, chip));

    moodChipsEl.appendChild(chip);
  });
}

function setActiveChip(moodId) {
  moodChipsEl.querySelectorAll(".mood-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.moodId === moodId);
  });
}

// ---- mood search / filtering ----------------------------------------------
function filterChipsBySearch(term) {
  const query = term.trim().toLowerCase();

  moodChipsEl.querySelectorAll(".mood-chip").forEach((chip) => {
    const mood = state.moods.find((m) => m.id === chip.dataset.moodId);
    const haystack = [mood.label, ...(mood.aliases || [])].join(" ").toLowerCase();
    const matches = query === "" || haystack.includes(query);
    chip.classList.toggle("is-hidden", !matches);
  });
}

// ---- toggles ----------------------------------------------------------------
function wireToggleGroup(groupEl, onChange) {
  groupEl.querySelectorAll(".toggle-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      groupEl.querySelectorAll(".toggle-pill").forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      onChange(pill.dataset.value);
    });
  });
}

// ---- recommendation flow ------------------------------------------------------
function recompute() {
  const filtered = filterBeverages(state.beverages, {
    temperature: state.temperature,
    alcohol: state.alcohol,
  });

  let beverage = null;

  if (state.mode === "mood" && state.selectedMood) {
    beverage = findBestMatch(filtered, state.selectedMood.tags);
  } else if (state.mode === "surprise") {
    beverage = randomBeverage(filtered);
  }

  state.currentBeverage = beverage;
  state.simplified = false;

  if (beverage) {
    setBaseColor(beverage.visuals.color_hex);
    renderResult(beverage, state.ingredientsMap, state.simplified);
  } else if (state.mode !== null) {
    // No beverage matches the current filters — gently relax and try again
    // by ignoring the alcohol filter, then the temperature filter.
    showEmpty();
  }
}

function selectMood(mood, chipEl) {
  state.selectedMood = mood;
  state.mode = "mood";
  setActiveChip(mood.id);
  recompute();
}

function selectSurprise() {
  state.selectedMood = null;
  state.mode = "surprise";
  setActiveChip(null);
  recompute();
}

// ---- simplify toggle -------------------------------------------------------------
function toggleSimplified() {
  if (!state.currentBeverage) return;
  state.simplified = !state.simplified;
  renderResult(state.currentBeverage, state.ingredientsMap, state.simplified);
}

// ---- init ------------------------------------------------------------------------
async function init() {
  await loadData();
  renderMoodChips();

  moodSearch.addEventListener("input", (e) => filterChipsBySearch(e.target.value));

  clearSearch.addEventListener("click", () => {
    moodSearch.value = "";
    filterChipsBySearch("");
    moodSearch.focus();
  });

  wireToggleGroup(tempToggle, (value) => {
    state.temperature = value;
    if (state.mode) recompute();
  });

  wireToggleGroup(alcToggle, (value) => {
    state.alcohol = value;
    if (state.mode) recompute();
  });

  surpriseBtn.addEventListener("click", selectSurprise);
  simplifyBtn.addEventListener("click", toggleSimplified);
}

init();
