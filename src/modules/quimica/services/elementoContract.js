/**
 * Contrato interno del catálogo de Química (Q-23 / RF-Q-01).
 *
 * Esta definición es del frontend. No inventa campos del backend: `descripcion` no
 * existe en `GET /glosarios/quimica`, por eso es opcional y se normaliza a `null`.
 *
 * @typedef {Object} ElementoQuimico
 * @property {number|string} id Identificador devuelto por la fuente.
 * @property {string} nombre Nombre legible del elemento.
 * @property {string} simbolo Símbolo químico.
 * @property {number} numeroAtomico Número atómico, entero mayor o igual que 1.
 * @property {string|null} [clasificacion] Clasificación química cuando existe.
 * @property {string|null} [descripcion] Descripción cuando la fuente la provee.
 */

export const CAMPOS_ELEMENTO = Object.freeze({
  id: Object.freeze({ tipo: 'number|string', obligatorio: true, origen: 'glosario.id' }),
  nombre: Object.freeze({
    tipo: 'string',
    obligatorio: true,
    origen: 'glosario.nombre | glosario.elementoQuimico',
  }),
  simbolo: Object.freeze({ tipo: 'string', obligatorio: true, origen: 'glosario.simbolo' }),
  numeroAtomico: Object.freeze({
    tipo: 'number',
    obligatorio: true,
    origen: 'glosario.numeroAtomico',
  }),
  clasificacion: Object.freeze({
    tipo: 'string|null',
    obligatorio: false,
    origen: 'glosario.clasificacion',
  }),
  descripcion: Object.freeze({
    tipo: 'string|null',
    obligatorio: false,
    origen: 'sin fuente confirmada (Q-24)',
  }),
});

function textoValido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function idValido(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor);
  return textoValido(valor);
}

function opcionalTexto(valor) {
  return valor === null || typeof valor === 'string';
}

/**
 * Convierte un registro de `GET /glosarios/quimica` al contrato canónico.
 *
 * @param {Object|null|undefined} registro Registro crudo del glosario.
 * @returns {ElementoQuimico|null} El elemento normalizado, o `null` si faltan campos
 * obligatorios. `formulaEjemplo` no se copia porque no equivale a `descripcion`.
 */
export function normalizarElementoDesdeGlosario(registro) {
  if (!registro || typeof registro !== 'object') return null;

  const nombre = textoValido(registro.nombre) ? registro.nombre : registro.elementoQuimico;
  const simbolo = registro.simbolo;
  const numeroAtomico = registro.numeroAtomico;

  if (!idValido(registro.id)) return null;
  if (!textoValido(nombre)) return null;
  if (!textoValido(simbolo)) return null;
  if (!Number.isInteger(numeroAtomico) || numeroAtomico < 1) return null;

  return {
    id: registro.id,
    nombre: nombre.trim(),
    simbolo: simbolo.trim(),
    numeroAtomico,
    clasificacion: textoValido(registro.clasificacion) ? registro.clasificacion.trim() : null,
    descripcion: textoValido(registro.descripcion) ? registro.descripcion.trim() : null,
  };
}

/**
 * Devuelve los errores de forma de un elemento ya normalizado.
 *
 * @param {ElementoQuimico|Object|null|undefined} elemento Elemento a validar.
 * @returns {string[]} Mensajes en español; array vacío cuando es válido.
 */
export function obtenerErroresElemento(elemento) {
  if (!elemento || typeof elemento !== 'object') {
    return ['El elemento debe ser un objeto.'];
  }

  const errores = [];
  if (!idValido(elemento.id)) errores.push('El campo id es obligatorio.');
  if (!textoValido(elemento.nombre)) errores.push('El campo nombre es obligatorio.');
  if (!textoValido(elemento.simbolo)) errores.push('El campo simbolo es obligatorio.');
  if (!Number.isInteger(elemento.numeroAtomico) || elemento.numeroAtomico < 1) {
    errores.push('El campo numeroAtomico debe ser un entero mayor o igual que 1.');
  }
  if (!opcionalTexto(elemento.clasificacion)) {
    errores.push('El campo clasificacion debe ser texto o null.');
  }
  if (!opcionalTexto(elemento.descripcion)) {
    errores.push('El campo descripcion debe ser texto o null.');
  }
  return errores;
}

/**
 * @param {ElementoQuimico|Object|null|undefined} elemento Elemento a validar.
 * @returns {boolean} `true` cuando no hay errores de forma.
 */
export function esElementoValido(elemento) {
  return obtenerErroresElemento(elemento).length === 0;
}
