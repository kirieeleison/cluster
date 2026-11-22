/**
 * Завантаження даних справ із папки data/.
 *
 * data/cases.json        — перелік справ, позиції на дошці та зв'язки-нитки;
 * data/cases/<id>.json   — повний текст однієї справи.
 *
 * Шляхи відносні, тому сайт працює і локально, і на GitHub Pages
 * (https://<user>.github.io/cluster/).
 */

const ID_PATTERN = /^[a-z0-9-]{1,64}$/;

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Не вдалося завантажити ${url} (${response.status})`);
  }
  return response.json();
}

/** @returns {Promise<{cases: Array, links: Array<[string, string]>}>} */
export function loadIndex() {
  return getJson("data/cases.json");
}

/** Повертає дані однієї справи. Ідентифікатор перевіряється, щоб не дати підставити довільний шлях. */
export function loadCase(id) {
  if (!ID_PATTERN.test(id)) {
    return Promise.reject(new Error("Некоректний ідентифікатор справи"));
  }
  return getJson(`data/cases/${id}.json`);
}

export function isValidId(id) {
  return typeof id === "string" && ID_PATTERN.test(id);
}
