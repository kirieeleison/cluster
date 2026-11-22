/**
 * Сторінка справи: case.html?id=<id>
 * Заповнює 5 фіксованих розділів шаблону даними з data/cases/<id>.json.
 */

import { loadCase, loadIndex, isValidId } from "./modules/data.js";
import { initSettings } from "./modules/settings.js";
import { createStrings } from "./modules/strings.js";

const $ = (selector) => document.querySelector(selector);

/** Розділ: { "text": ["абзац", ...], "list": ["пункт", ...] } — обидва поля необов'язкові. */
function renderSection(container, section = {}) {
  const parts = [];
  for (const paragraph of section.text ?? []) {
    const p = document.createElement("p");
    p.textContent = paragraph;
    parts.push(p);
  }
  if (section.list?.length) {
    const ul = document.createElement("ul");
    for (const item of section.list) {
      const li = document.createElement("li");
      li.textContent = item;
      ul.append(li);
    }
    parts.push(ul);
  }
  container.replaceChildren(...parts);
}

function showNotFound() {
  document.title = "Справу не знайдено — Cluster";
  $("[data-case-title]").textContent = "Справу не знайдено";
  $("[data-case-board]").hidden = true;
  $("[data-case-meta]").hidden = true;
  $("[data-case-error]").hidden = false;
}

function renderNav(index, id) {
  const position = index.cases.findIndex((item) => item.id === id);
  const prev = index.cases[position - 1];
  const next = index.cases[position + 1];
  const setLink = (selector, item, label) => {
    const link = $(selector);
    if (!item) return;
    link.href = `case.html?id=${encodeURIComponent(item.id)}`;
    link.textContent = label.replace("{title}", item.title);
    link.hidden = false;
  };
  setLink("[data-nav-prev]", prev, "← {title}");
  setLink("[data-nav-next]", next, "{title} →");
}

async function init() {
  initSettings();

  const id = new URLSearchParams(location.search).get("id");
  if (!isValidId(id)) {
    showNotFound();
    return;
  }

  try {
    const [index, data] = await Promise.all([loadIndex(), loadCase(id)]);

    document.title = `${data.title} — Cluster`;
    $("[data-case-number]").textContent = data.number;
    $("[data-case-title]").textContent = data.title;
    $("[data-meta='date']").textContent = data.date;
    $("[data-meta='threat']").textContent = data.threat;
    $("[data-meta='level']").textContent = data.level;

    const img = $("[data-case-image]");
    img.src = data.image.src;
    img.alt = data.image.alt;
    $("[data-case-caption]").textContent = data.image.caption ?? "";

    document.querySelectorAll("[data-section]").forEach((note) => {
      renderSection(note.querySelector(".note__body"), data.sections?.[note.dataset.section]);
    });

    renderNav(index, id);

    // Нитка проходить через фото-доказ і всі 5 розділів по черзі
    const board = $("[data-case-board]");
    const items = [...board.querySelectorAll(".evidence, .note")];
    createStrings(board, () => items.slice(1).map((item, i) => [items[i], item]));
  } catch (error) {
    console.error(error);
    showNotFound();
  }
}

init();
