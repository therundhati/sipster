// render.js
// Builds the result card DOM from a beverage object.

const TEMP_LABELS = {
  hot: "🔥 hot",
  cold: "❄️ cold",
  either: "🔥❄️ hot or cold",
};

const els = {
  empty: document.getElementById("resultEmpty"),
  card: document.getElementById("resultCard"),
  blob: document.getElementById("resultBlob"),
  garnish: document.getElementById("resultGarnish"),
  name: document.getElementById("resultName"),
  desc: document.getElementById("resultDesc"),
  tags: document.getElementById("resultTags"),
  meta: document.getElementById("resultMeta"),
  ingredients: document.getElementById("resultIngredients"),
  simplifyBtn: document.getElementById("simplifyBtn"),
};

/**
 * Render a beverage into the result card.
 * @param {object} beverage - a beverage entry from beverages.json
 * @param {Map} ingredientsMap - id -> ingredient object from ingredients.json
 * @param {boolean} simplified - whether to hide optional ingredients / use simplified name
 */
export function renderResult(beverage, ingredientsMap, simplified) {
  if (!beverage) {
    showEmpty();
    return;
  }

  els.empty.hidden = true;
  els.card.hidden = false;

  // Re-trigger the rise animation on each new result.
  els.card.style.animation = "none";
  // eslint-disable-next-line no-unused-expressions
  els.card.offsetHeight;
  els.card.style.animation = "";

  const showSimplified = simplified && !!beverage.simplified_name;
  const displayName = showSimplified ? beverage.simplified_name : beverage.name;

  els.name.textContent = displayName;
  els.desc.textContent = beverage.description;

  // visual blob
  els.blob.style.setProperty("--drink-color", beverage.visuals.color_hex);
  els.garnish.textContent = beverage.visuals.garnish
    ? `garnish: ${beverage.visuals.garnish}`
    : "";

  // tags
  els.tags.innerHTML = "";
  beverage.tags.forEach((tag) => {
    const pill = document.createElement("span");
    pill.className = "tag-pill";
    pill.textContent = tag;
    els.tags.appendChild(pill);
  });

  // meta row
  els.meta.innerHTML = "";
  const metaItems = [
    TEMP_LABELS[beverage.temperature] || beverage.temperature,
    beverage.alcoholic ? "🍸 alcoholic" : "🚫 non-alcoholic",
  ];
  if (beverage.caffeine) metaItems.push("☕ caffeinated");
  metaItems.push(`⏱ ~${beverage.prep_time_minutes} min`);

  metaItems.forEach((text) => {
    const span = document.createElement("span");
    span.textContent = text;
    els.meta.appendChild(span);
  });

  // ingredients
  els.ingredients.innerHTML = "";
  const hasOptional = beverage.ingredients.some((i) => i.optional);

  beverage.ingredients.forEach((entry) => {
    if (showSimplified && entry.optional) return; // hide optional items in simplified view

    const ingredient = ingredientsMap.get(entry.id);
    if (!ingredient) return;

    const li = document.createElement("li");
    if (entry.optional) li.classList.add("is-optional");

    const nameSpan = document.createElement("span");
    nameSpan.className = "ingredient-name";
    nameSpan.textContent = ingredient.name;
    li.appendChild(nameSpan);

    if (entry.optional && entry.note && !showSimplified) {
      const noteSpan = document.createElement("span");
      noteSpan.className = "ingredient-note";
      noteSpan.textContent = `(${entry.note})`;
      li.appendChild(noteSpan);
    }

    els.ingredients.appendChild(li);
  });

  // simplify / full recipe toggle button
  if (hasOptional) {
    els.simplifyBtn.hidden = false;
    els.simplifyBtn.textContent = showSimplified
      ? "show the full recipe"
      : beverage.simplified_name
        ? `don't have everything? show me the ${beverage.simplified_name.toLowerCase()} version`
        : "don't have everything? show the simpler version";
  } else {
    els.simplifyBtn.hidden = true;
  }
}

export function showEmpty() {
  els.empty.hidden = false;
  els.card.hidden = true;
}
