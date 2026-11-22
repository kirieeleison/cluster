/**
 * Налаштування відображення: «Підсвітити все» та «Без ефектів».
 *
 * Стан записується в атрибути <html>:
 *   data-motion="on|off" — анімації увімкнено/вимкнено;
 *   data-torch="on|off"  — ліхтарик активний чи ні (обчислюється).
 * CSS реагує на ці атрибути, JS-модулі — на подію "cluster:settings".
 */

const STORAGE_KEY = "cluster:settings";

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
// Ліхтарик має сенс лише для точного вказівника (миша/тачпад)
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

/** Зчитує збережений вибір користувача (localStorage може бути недоступним). */
function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* приватний режим тощо — просто не зберігаємо */
  }
}

/** Значення за замовчуванням залежать від пристрою та системних налаштувань. */
function defaults() {
  return {
    illuminateAll: !finePointerQuery.matches || reducedMotionQuery.matches,
    noEffects: reducedMotionQuery.matches,
  };
}

let state = { ...defaults(), ...readSaved() };

/** Чи має зараз світити ліхтарик. */
export function isTorchActive() {
  return !state.illuminateAll && !state.noEffects && finePointerQuery.matches;
}

export function getSettings() {
  return { ...state };
}

function apply() {
  const root = document.documentElement;
  root.dataset.motion = state.noEffects ? "off" : "on";
  root.dataset.torch = isTorchActive() ? "on" : "off";

  document.querySelectorAll("[data-setting]").forEach((button) => {
    button.setAttribute("aria-pressed", String(Boolean(state[button.dataset.setting])));
  });

  document.dispatchEvent(new CustomEvent("cluster:settings", { detail: getSettings() }));
}

/**
 * Підключає кнопки-перемикачі з атрибутом data-setting="illuminateAll|noEffects".
 * Викликайте один раз після завантаження сторінки.
 */
export function initSettings() {
  document.querySelectorAll("[data-setting]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.setting;
      state = { ...state, [key]: !state[key] };
      save(state);
      apply();
    });
  });

  // Якщо користувач змінив системні налаштування або підключив мишу
  finePointerQuery.addEventListener("change", apply);
  reducedMotionQuery.addEventListener("change", () => {
    state = { ...defaults(), ...readSaved() };
    apply();
  });

  apply();
}
