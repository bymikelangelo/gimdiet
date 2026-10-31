import { useEffect, useMemo, useState } from 'react';
import { IconBack, IconClose } from '../components/Icons.jsx';
import { FOODS, analyzeDish, fmt, macrosFor, totals } from '../data/mockAnalysis.js';

const STEP = 10; // gramos por pulsación de ±

function mealLabel(date) {
  const h = date.getHours();
  if (h < 11) return 'Desayuno';
  if (h < 17) return 'Comida';
  if (h < 20) return 'Merienda';
  return 'Cena';
}

/**
 * Pantalla 2 · Resultado.
 * Muestra la foto, los macros totales y la lista de ingredientes editable.
 * Los datos vienen de analyzeDish() (de muestra en el prototipo).
 */
export default function ResultScreen({ photo, onRetake, onSave }) {
  const [result, setResult] = useState(null); // null mientras «analiza»
  const [items, setItems] = useState([]);
  const [picker, setPicker] = useState(false);
  const [capturedAt] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    analyzeDish(photo).then((r) => {
      if (!alive) return;
      setResult(r);
      setItems(r.items);
    });
    return () => { alive = false; };
  }, [photo]);

  const t = useMemo(() => totals(items), [items]);

  const setGrams = (id, grams) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, grams: Math.max(0, Math.min(600, grams)) } : x)));
  const remove = (id) => setItems((xs) => xs.filter((x) => x.id !== id));
  const add = (id) => {
    setItems((xs) => [...xs, { id, grams: 100 }]);
    setPicker(false);
  };

  const available = Object.keys(FOODS).filter((id) => !items.some((x) => x.id === id));
  const time = capturedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="result">
      <div className="result-photo">
        <img src={photo} alt="Foto del plato" />
        <button className="round-btn result-back" aria-label="Volver a la cámara" onClick={onRetake}>
          <IconBack />
        </button>
      </div>

      <section className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-scroll">
          {!result ? (
            <Analyzing />
          ) : (
            <>
              <div className="result-head">
                <div>
                  <div className="kicker">{mealLabel(capturedAt)} · {time}</div>
                  <h1 className="result-title">{result.name}</h1>
                </div>
                <span className="tag tag-accent-2">{Math.round(result.confidence * 100)}% seguro</span>
              </div>

              <div className="macros">
                <div className="macro macro-kcal">
                  <div className="macro-val">{fmt(t.kcal)}</div>
                  <div className="macro-lbl">kcal</div>
                </div>
                <div className="macro macro-p">
                  <div className="macro-val">{fmt(t.p)}</div>
                  <div className="macro-lbl">prot. g</div>
                </div>
                <div className="macro macro-c">
                  <div className="macro-val">{fmt(t.c)}</div>
                  <div className="macro-lbl">carb. g</div>
                </div>
                <div className="macro macro-f">
                  <div className="macro-val">{fmt(t.f)}</div>
                  <div className="macro-lbl">grasa g</div>
                </div>
              </div>

              <div className="section-head">
                <span>Ingredientes</span>
                <span className="muted">Ajusta con ±</span>
              </div>

              <ul className="ingredients">
                {items.map((it) => {
                  const m = macrosFor(it.id, it.grams);
                  return (
                    <li key={it.id} className="ingredient">
                      <div className="ingredient-info">
                        <div className="ingredient-name">{FOODS[it.id].name}</div>
                        <div className="ingredient-meta">
                          {fmt(m.kcal)} kcal · P {fmt(m.p)} · C {fmt(m.c)} · G {fmt(m.f)}
                        </div>
                      </div>
                      <div className="stepper">
                        <button aria-label={`Quitar ${STEP} g`} onClick={() => setGrams(it.id, it.grams - STEP)}>−</button>
                        <span>{it.grams} g</span>
                        <button aria-label={`Añadir ${STEP} g`} onClick={() => setGrams(it.id, it.grams + STEP)}>+</button>
                      </div>
                      <button className="remove-btn" aria-label={`Quitar ${FOODS[it.id].name}`} onClick={() => remove(it.id)}>
                        <IconClose size={14} />
                      </button>
                    </li>
                  );
                })}
                {items.length === 0 && <li className="empty">No hay ingredientes. Añade alguno.</li>}
              </ul>

              {!picker ? (
                available.length > 0 && (
                  <button className="btn btn-ghost add-btn" onClick={() => setPicker(true)}>
                    + Añadir ingrediente
                  </button>
                )
              ) : (
                <div className="picker">
                  <div className="picker-head">
                    <span>Elige un ingrediente</span>
                    <button className="btn btn-ghost" onClick={() => setPicker(false)}>Cancelar</button>
                  </div>
                  <div className="picker-chips">
                    {available.map((id) => (
                      <button key={id} className="chip" onClick={() => add(id)}>
                        {FOODS[id].name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="sheet-actions">
          <button className="btn btn-secondary" onClick={onRetake}>Repetir foto</button>
          <button className="btn btn-primary" disabled={!result || items.length === 0} onClick={() => onSave(t)}>
            Añadir a comida
          </button>
        </footer>
      </section>
    </div>
  );
}

function Analyzing() {
  return (
    <div className="analyzing" aria-live="polite">
      <div className="spinner" />
      <div className="analyzing-title">Analizando tu plato…</div>
      <div className="muted">Detectando ingredientes y porciones</div>
      <div className="skeleton-grid">
        <div className="sk sk-dark" /><div className="sk" /><div className="sk" /><div className="sk" />
      </div>
      <div className="sk sk-row" /><div className="sk sk-row" /><div className="sk sk-row" />
    </div>
  );
}
