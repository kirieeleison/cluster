/**
 * Ефект ліхтарика: темний шар над дошкою з «вікном» навколо курсора.
 *
 * - Позиція оновлюється не частіше одного разу на кадр (requestAnimationFrame).
 * - Для клавіатури: при фокусі на картці світло переходить на неї.
 * - Шар має pointer-events: none і aria-hidden — він не заважає ні кліку,
 *   ні екранним читачам. Видимість керується CSS через html[data-torch].
 */

export function createFlashlight(boardEl) {
  const overlay = document.createElement("div");
  overlay.className = "flashlight";
  overlay.setAttribute("aria-hidden", "true");
  boardEl.append(overlay);

  let frame = 0;
  let x = 0;
  let y = 0;

  function render() {
    frame = 0;
    overlay.style.setProperty("--fx-x", `${x}px`);
    overlay.style.setProperty("--fx-y", `${y}px`);
  }

  function moveTo(clientX, clientY) {
    const rect = boardEl.getBoundingClientRect();
    x = clientX - rect.left;
    y = clientY - rect.top;
    if (!frame) frame = requestAnimationFrame(render);
  }

  function onPointerMove(event) {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      moveTo(event.clientX, event.clientY);
    }
  }

  function onFocusIn(event) {
    const target = event.target.closest(".card") || event.target;
    const rect = target.getBoundingClientRect();
    moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function centre() {
    const rect = boardEl.getBoundingClientRect();
    moveTo(rect.left + rect.width / 2, rect.top + rect.height * 0.4);
  }

  boardEl.addEventListener("pointermove", onPointerMove, { passive: true });
  boardEl.addEventListener("focusin", onFocusIn);
  centre();

  return { centre };
}
