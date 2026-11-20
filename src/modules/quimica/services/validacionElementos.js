/**
 * Validación del catálogo de elementos (Q-24 / RF-Q-01).
 * Lógica pura: sin imports de datos ni de React Native.
 *
 * Capa 1 – CONTRATO (definido por Randall en RF-Q-01), aplica a cualquier dato:
 *   id (string | number), nombre, simbolo, numeroAtomico (number entero > 0, sin coerción)
 *   son requeridos; clasificacion y descripcion son opcionales (+ ejemploOpcional).
 *   Un campo opcional ausente se OMITE del objeto (no se inventa ni se rellena con null).
 *
 * Capa 2 – DATOS REALES, solo para data/elementosQuimicos.json (no para fixtures):
 *   Z entre 1 y 118, formato de símbolo químico e id coherente con Z.
 */

export const ESQUEMA_VERSION = '1.0.0';

const SIMBOLO_REAL_RE = /^[A-Z][a-z]{0,2}$/;

const esTexto = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * @param {object} raw
 * @returns {{ elemento: object|null, errores: string[] }}
 */
export function normalizarElemento(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { elemento: null, errores: ['El registro no es un objeto.'] };
  }

  const errores = [];
  const idValido = esTexto(raw.id) || (typeof raw.id === 'number' && Number.isFinite(raw.id));

  if (!idValido) errores.push('id inválido (string o number).');
  if (!esTexto(raw.nombre)) errores.push('nombre es requerido (string).');
  if (!esTexto(raw.simbolo)) errores.push('simbolo es requerido (string).');
  if (!(typeof raw.numeroAtomico === 'number' && Number.isInteger(raw.numeroAtomico) && raw.numeroAtomico > 0)) {
    errores.push('numeroAtomico debe ser un number entero mayor que 0.');
  }

  if (errores.length > 0) return { elemento: null, errores };

  const elemento = {
    id: typeof raw.id === 'string' ? raw.id.trim() : raw.id,
    nombre: raw.nombre.trim(),
    simbolo: raw.simbolo.trim(),
    numeroAtomico: raw.numeroAtomico,
  };

  if (esTexto(raw.clasificacion)) elemento.clasificacion = raw.clasificacion.trim();
  if (esTexto(raw.descripcion)) elemento.descripcion = raw.descripcion.trim();
  if (esTexto(raw.ejemploOpcional)) elemento.ejemploOpcional = raw.ejemploOpcional.trim();

  return { elemento, errores: [] };
}

/**
 * Reglas adicionales para elementos químicos reales (elementosQuimicos.json).
 * @param {object} elemento ya normalizado
 * @returns {string[]}
 */
export function verificarElementoReal(elemento) {
  const errores = [];

  if (elemento.numeroAtomico > 118) {
    errores.push(`${elemento.simbolo}: numeroAtomico ${elemento.numeroAtomico} fuera del rango 1..118.`);
  }
  if (!SIMBOLO_REAL_RE.test(elemento.simbolo)) {
    errores.push(`${elemento.simbolo}: formato de símbolo no válido (ej. H, He, Uue).`);
  }
  const idEsperado = `elem-${String(elemento.numeroAtomico).padStart(3, '0')}`;
  if (elemento.id !== idEsperado) {
    errores.push(`${elemento.simbolo}: id "${elemento.id}" no coincide con el esperado "${idEsperado}".`);
  }
  return errores;
}

/**
 * Valida una lista completa: contrato, unicidad y (opcionalmente) reglas de datos reales.
 * @param {Array<object>} lista
 * @param {{ datosReales?: boolean }} [opciones]
 * @returns {{ valido: boolean, errores: string[], elementosValidos: object[] }}
 */
export function validarCatalogoElementos(lista, { datosReales = false } = {}) {
  if (!Array.isArray(lista)) {
    return { valido: false, errores: ['La fuente de elementos no es un arreglo.'], elementosValidos: [] };
  }

  const errores = [];
  const elementosValidos = [];
  const ids = new Set();
  const simbolos = new Set();
  const numeros = new Set();

  lista.forEach((item, indice) => {
    const { elemento, errores: erroresContrato } = normalizarElemento(item);

    if (!elemento) {
      erroresContrato.forEach((e) => errores.push(`[${indice}] ${e}`));
      return;
    }

    const erroresReales = datosReales ? verificarElementoReal(elemento) : [];
    if (erroresReales.length > 0) {
      erroresReales.forEach((e) => errores.push(`[${indice}] ${e}`));
      return;
    }

    const idKey = String(elemento.id);
    const simboloKey = elemento.simbolo.toLowerCase();

    if (ids.has(idKey)) return errores.push(`[${indice}] id duplicado: ${idKey}`);
    if (simbolos.has(simboloKey)) return errores.push(`[${indice}] símbolo duplicado: ${elemento.simbolo}`);
    if (numeros.has(elemento.numeroAtomico)) {
      return errores.push(`[${indice}] numeroAtomico duplicado: ${elemento.numeroAtomico}`);
    }

    ids.add(idKey);
    simbolos.add(simboloKey);
    numeros.add(elemento.numeroAtomico);
    elementosValidos.push(elemento);
  });

  return { valido: errores.length === 0, errores, elementosValidos };
}
