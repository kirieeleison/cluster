/**
 * Червоні нитки між шпильками (SVG).
 *
 * Координати рахуються від реальних позицій елементів .pin, тому нитки
 * автоматично підлаштовуються під будь-яку верстку (десктоп чи мобільний).
 * Перемальовування — при зміні розміру дошки або будь-якого елемента.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * @param {HTMLElement} container — елемент із position: relative (дошка)
 * @param {() => Array<[HTMLElement, HTMLElement]>} getPairs — пари елементів для з'єднання
 */
export function createStrings(container, getPairs) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("strings");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  container.prepend(svg);

  let frame = 0;

  function pinCentre(element, box) {
    const pin = element.querySelector(".pin") || element;
    const rect = pin.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - box.left,
      y: rect.top + rect.height / 2 - box.top,
    };
  }

  function makePath(d, className) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", className);
    path.setAttribute("pathLength", "1"); // для анімації stroke-dashoffset
    return path;
  }

  function draw() {
    frame = 0;
    const box = container.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);

    const fragment = document.createDocumentFragment();
    for (const [from, to] of getPairs()) {
      const a = pinCentre(from, box);
      const b = pinCentre(to, box);
      // Нитка трохи провисає: контрольна точка нижче середини
      const sag = Math.min(60, Math.hypot(b.x - a.x, b.y - a.y) * 0.12);
      const d = `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + sag} ${b.x} ${b.y}`;
      fragment.append(makePath(d, "strings__shadow"), makePath(d, "strings__line"));
    }
    svg.replaceChildren(fragment);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(schedule);
  observer.observe(container);
  container.querySelectorAll(".pin").forEach((pin) => {
    observer.observe(pin.parentElement);
  });
  // Зображення можуть змінити висоту карток після завантаження
  container.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", schedule, { once: true });
  });

  // Анімація натягування — лише при першій появі
  svg.classList.add("is-animating");
  setTimeout(() => svg.classList.remove("is-animating"), 2000);

  draw();
  return { redraw: schedule };
}
