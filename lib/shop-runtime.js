// Browser script inlined into every rendered page (see lib/render.js): makes search and filter buttons work.
// render.js marks product cards with data-shop-item="<index>" and filter buttons with data-shop-filter="<name>",
// and puts the product list in <script id="shop-data">. The script takes over those clicks, so a template's own
// (visual-only or half-working) filter code does not fight with it.
(() => {
  const dataEl = document.getElementById("shop-data");
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const T = {
    nl: { search: "Zoek in de producten…", none: "Geen producten gevonden." },
    en: { search: "Search products…", none: "No products found." },
    de: { search: "Produkte durchsuchen…", none: "Keine Produkte gefunden." },
    fr: { search: "Rechercher un produit…", none: "Aucun produit trouvé." },
    es: { search: "Buscar productos…", none: "No se encontraron productos." },
  };
  const t = T[data.lang] || T.en;
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const isSearchInput = (el) => el.matches("[data-shop-search]") || (el.matches('input[type=search], input[type=text], input:not([type])') &&
    !el.closest("footer") && /zoek|search|such|cherch|busc|find|vind|filter|sku/i.test([el.placeholder, el.getAttribute("aria-label"), el.name, el.id].join(" ")));
  const searches = [...document.querySelectorAll("input")].filter(isSearchInput);

  // Homepage: a search field sends the visitor to the catalogue with the query.
  if (data.page !== "catalog") {
    for (const input of searches) {
      const go = (e) => { e.preventDefault(); e.stopImmediatePropagation(); location.href = "catalog.html?q=" + encodeURIComponent(input.value.trim()); };
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") go(e); }, true);
      input.form?.addEventListener("submit", go, true);
    }
    return;
  }

  const items = [...document.querySelectorAll("[data-shop-item]")];
  if (!items.length) return;
  const ALL = /\b(all|alle|alles|tout|tous|todos?|tutti|omnia)\b/i;
  const tagged = [...document.querySelectorAll("[data-shop-filter]")];
  // A filter named "All"/"Alles" (it happens in crawled content) acts as the reset button, not as a filter.
  const chips = tagged.filter((c) => !ALL.test(c.dataset.shopFilter));
  // Filter bars: the container of each filter group (a template may show the filters in more than one place).
  const bars = [...new Set(tagged.map((c) => (c.parentElement.tagName === "LI" ? c.parentElement.parentElement : c.parentElement)))];
  const bar = bars[0];
  // The template's own "all" button resets the filters: it says "all" in some language, or it looks exactly like a
  // filter button (same element and classes, ignoring "active" state classes) without being one.
  const STATE = /^(on|is-on|active|is-active|selected|is-selected|current|is-current)$/;
  const look = (el) => `${el.tagName}.${[...el.classList].filter((k) => !STATE.test(k)).sort().join(".")}`;
  const chipLooks = new Set(chips.map(look));
  const resets = bars.flatMap((b) => [...b.querySelectorAll("button, a, [role=button]")]).filter((b) =>
    !chips.some((c) => c === b || c.contains(b) || b.contains(c)) &&
    ((b.textContent.trim().length <= 24 && ALL.test(b.textContent)) || chipLooks.has(look(b))));

  // The list that holds most product cards gets the "nothing found" message.
  const lists = new Map();
  for (const el of items) lists.set(el.parentElement, (lists.get(el.parentElement) || 0) + 1);
  const mainList = [...lists].sort((a, b) => b[1] - a[1])[0][0];

  const style = document.createElement("style");
  style.textContent = `
    .shop-search { display: block; box-sizing: border-box; width: min(100%, 26rem); min-width: min(100%, 16rem); flex: 0 1 26rem; grid-column: 1 / -1;
      margin: 0 0 1.25rem; padding: .75em 1em; font: inherit;
      color: inherit; background: color-mix(in srgb, currentColor 6%, transparent); border: 1px solid color-mix(in srgb, currentColor 30%, transparent); border-radius: .5em; }
    .shop-search:focus { outline: 2px solid var(--c-primary, currentColor); outline-offset: 2px; }
    .shop-empty { padding: 2.5rem 1rem; text-align: center; opacity: .75; font: inherit; }`;
  document.head.appendChild(style);

  let input = searches[0];
  if (!input) {
    input = document.createElement("input");
    input.type = "search";
    input.className = "shop-search";
    input.placeholder = t.search;
    input.setAttribute("aria-label", t.search);
    const anchor = bar || mainList;
    anchor.parentElement.insertBefore(input, anchor);
  }
  const empty = document.createElement("p");
  empty.className = "shop-empty";
  empty.textContent = t.none;
  empty.hidden = true;
  mainList.after(empty);

  const countEl = data.count ? [...document.querySelectorAll("body *")].find((el) => !el.children.length && el.textContent.trim() === data.count) : null;

  let active = null;
  let query = new URLSearchParams(location.search).get("q") || "";
  input.value = query;

  const setOn = (el, on) => {
    el.setAttribute("aria-pressed", String(on));
    for (const k of ["on", "is-on", "is-active", "active"]) el.classList.toggle(k, on);
  };
  const fits = (p) => {
    if (active && !(p.category ? norm(p.category) === norm(active) : norm(`${p.name} ${p.tag}`).includes(norm(active)))) return false;
    const q = norm(query.trim());
    return !q || norm(`${p.name} ${p.tag} ${p.category}`).includes(q);
  };
  function apply() {
    const shown = new Set();
    for (const el of items) {
      const p = data.products[Number(el.dataset.shopItem)] || {};
      if (fits(p)) { el.style.removeProperty("display"); shown.add(el.dataset.shopItem); }
      else el.style.setProperty("display", "none", "important");
    }
    for (const c of chips) setOn(c, !!active && norm(c.dataset.shopFilter) === norm(active));
    for (const r of resets) setOn(r, !active);
    if (countEl) countEl.textContent = /\d/.test(data.count) ? data.count.replace(/\d+/, shown.size) : `${shown.size} · ${data.count}`;
    empty.hidden = shown.size > 0;
    // Let scroll-reveal code notice cards that just came into view.
    window.dispatchEvent(new Event("scroll"));
  }

  // Capture on window: runs before the template's own handlers, which are then skipped for these controls.
  window.addEventListener("click", (e) => {
    const chip = chips.find((c) => c.contains(e.target));
    const reset = !chip && resets.find((r) => r.contains(e.target));
    if (!chip && !reset) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    active = chip && norm(chip.dataset.shopFilter) !== norm(active) ? chip.dataset.shopFilter : null;
    apply();
  }, true);
  window.addEventListener("input", (e) => {
    if (e.target !== input) return;
    e.stopImmediatePropagation();
    query = input.value;
    apply();
  }, true);
  window.addEventListener("keydown", (e) => {
    if (e.target === input && e.key === "Enter") { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  input.form?.addEventListener("submit", (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, true);

  apply();
})();
