// ─────────────────────────────────────────────────────────────────────────────
// Datos de muestra. En el prototipo NO hay IA: analyzeDish() devuelve siempre el
// mismo plato tras una pequeña espera, para simular la llamada al agente.
// Cuando conectéis la IA, solo hay que reemplazar el cuerpo de analyzeDish()
// por la llamada real y devolver el mismo formato.
// ─────────────────────────────────────────────────────────────────────────────

// Valores nutricionales por cada 100 g.
export const FOODS = {
  pollo: { name: 'Pechuga de pollo', kcal: 165, p: 31, c: 0, f: 3.6 },
  arroz: { name: 'Arroz blanco', kcal: 130, p: 2.7, c: 28, f: 0.3 },
  brocoli: { name: 'Brócoli', kcal: 34, p: 2.8, c: 7, f: 0.4 },
  aceite: { name: 'Aceite de oliva', kcal: 884, p: 0, c: 0, f: 100 },
  // Extras para «+ Añadir ingrediente»
  huevo: { name: 'Huevo', kcal: 155, p: 13, c: 1.1, f: 11 },
  aguacate: { name: 'Aguacate', kcal: 160, p: 2, c: 9, f: 15 },
  tomate: { name: 'Tomate', kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
  pasta: { name: 'Pasta cocida', kcal: 131, p: 5, c: 25, f: 1.1 },
  salmon: { name: 'Salmón', kcal: 208, p: 20, c: 0, f: 13 },
};

// Objetivo del día (supuesto: día de pierna) y lo que ya se ha comido.
export const DAY = {
  label: 'Día de pierna',
  target: { kcal: 2850, p: 170, c: 360, f: 80 },
  eaten: { kcal: 1420, p: 92, c: 160, f: 38 },
};

export const MOCK_RESULT = {
  name: 'Pollo con arroz',
  confidence: 0.94,
  items: [
    { id: 'pollo', grams: 150 },
    { id: 'arroz', grams: 180 },
    { id: 'brocoli', grams: 90 },
    { id: 'aceite', grams: 10 },
  ],
};

/**
 * Simula el análisis de la foto por un agente de IA.
 * @param {string} _photoDataUrl  foto capturada (data URL JPEG) — sin usar en el prototipo
 * @returns {Promise<typeof MOCK_RESULT>}
 */
export function analyzeDish(_photoDataUrl) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(MOCK_RESULT)), 1400);
  });
}

/** Calcula los macros de un ingrediente según sus gramos. */
export function macrosFor(id, grams) {
  const f = FOODS[id];
  const r = grams / 100;
  return { kcal: f.kcal * r, p: f.p * r, c: f.c * r, f: f.f * r };
}

/** Suma los macros de una lista de ingredientes. */
export function totals(items) {
  return items.reduce(
    (acc, it) => {
      const m = macrosFor(it.id, it.grams);
      acc.kcal += m.kcal; acc.p += m.p; acc.c += m.c; acc.f += m.f;
      return acc;
    },
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
}

// Formato español con punto de miles también en 4 cifras (1.430), como en el diseño.
export const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
