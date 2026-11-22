/**
 * Головна сторінка — «Дошка розслідувань».
 * Будує картки з data/cases.json за шаблоном <template id="card-template">,
 * натягує нитки та вмикає ліхтарик.
 */

import { loadIndex } from "./modules/data.js";
import { initSettings } from "./modules/settings.js";
import { createFlashlight } from "./modules/flashlight.js";
import { createStrings } from "./modules/strings.js";

const board = document.querySelector("[data-board]");
const list = document.querySelector("[data-board-cards]");
const template = document.getElementById("card-template");

/** Заповнює одну картку. Увесь текст — через textContent (жодного innerHTML з даних). */
function renderCard(item, index) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.caseId = item.id;
  node.style.setProperty("--x", `${item.position?.x ?? 50}%`);
  node.style.setProperty("--y", `${item.position?.y ?? 10}%`);

  const img = node.querySelector(".card__photo");
  img.src = item.image.src;
  img.alt = item.image.alt;
  // Перше фото — найважливіше для швидкого показу, інші завантажуються ліниво
  if (index === 0) {
    img.loading = "eager";
    img.fetchPriority = "high";
  }

  node.querySelector(".card__number").textContent = item.number;
  const link = node.querySelector(".card__link");
  link.textContent = item.title;
  link.href = `case.html?id=${encodeURIComponent(item.id)}`;
  node.querySelector(".card__summary").textContent = item.summary;
  node.querySelector(".card__tag").textContent = item.threat;
  return node;
}

async function init() {
  initSettings();

  try {
    const { cases, links = [] } = await loadIndex();
    list.replaceChildren(...cases.map(renderCard));

    const byId = (id) => list.querySelector(`[data-case-id="${CSS.escape(id)}"]`);
    createStrings(board, () =>
      links.map(([a, b]) => [byId(a), byId(b)]).filter(([a, b]) => a && b),
    );
  } catch (error) {
    console.error(error);
    list.innerHTML = "";
    const message = document.createElement("p");
    message.className = "status-message";
    message.textContent =
      "Не вдалося завантажити справи. Якщо ви відкрили файл напряму, запустіть локальний сервер (див. README).";
    board.append(message);
  }

  createFlashlight(board);
}

init();
