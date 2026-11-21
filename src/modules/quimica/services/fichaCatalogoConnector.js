import { QUIMICA_ROUTES } from '../routes';
import {
  obtenerElementoPorIdOSimbolo,
  obtenerElementosQuimicos,
} from './catalogoElementosService';
import { normalizarElemento } from './validacionElementos';

/**
 * Obtiene la lista inicial del catálogo desde la fuente única local (Q-24).
 * @returns {Array<object>}
 */
export function obtenerElementosCatalogoConectado() {
  return obtenerElementosQuimicos();
}

/**
 * Resuelve un elemento de forma segura para abrir o mostrar en FichaElementoScreen.
 * Maneja objeto directo, búsqueda por id/símbolo, campos faltantes y elementos inexistentes.
 *
 * @param {object|string|number|null|undefined} entrada
 * @returns {{ elemento: object|null, motivo: 'ok'|'no-encontrado'|'invalido'|'sin-datos' }}
 */
export function resolverElementoParaFicha(entrada) {
  if (entrada === null || entrada === undefined || entrada === '') {
    return { elemento: null, motivo: 'sin-datos' };
  }

  if (typeof entrada === 'object') {
    const { elemento } = normalizarElemento(entrada);
    return elemento
      ? { elemento, motivo: 'ok' }
      : { elemento: null, motivo: 'invalido' };
  }

  const encontrado = obtenerElementoPorIdOSimbolo(entrada);
  if (!encontrado) {
    return { elemento: null, motivo: 'no-encontrado' };
  }

  const { elemento } = normalizarElemento(encontrado);
  return elemento
    ? { elemento, motivo: 'ok' }
    : { elemento: null, motivo: 'invalido' };
}

/**
 * Maneja la selección de un elemento desde el catálogo para abrir su ficha.
 * Prioriza `onSelectElement(elementoNormalizado)` y, si no está disponible,
 * usa `navigation.navigate` hacia `QUIMICA_ROUTES.fichaElemento`.
 *
 * @param {object} elementoSeleccionado
 * @param {{
 *   onSelectElement?: (elemento: object|null, estado: object) => void,
 *   navigation?: { navigate?: Function },
 *   routeName?: string,
 * }} [opciones]
 * @returns {{ accion: 'callback'|'navigation'|'no-encontrado'|'invalido'|'sin-datos', elemento: object|null }}
 */
export function abrirFichaDeElemento(elementoSeleccionado, opciones = {}) {
  const {
    onSelectElement,
    navigation,
    routeName = QUIMICA_ROUTES.fichaElemento,
  } = opciones;

  const resuelto = resolverElementoParaFicha(elementoSeleccionado);

  if (!resuelto.elemento) {
    if (typeof onSelectElement === 'function') {
      onSelectElement(null, resuelto);
    }
    return { accion: resuelto.motivo, elemento: null };
  }

  if (typeof onSelectElement === 'function') {
    onSelectElement(resuelto.elemento, resuelto);
    return { accion: 'callback', elemento: resuelto.elemento };
  }

  if (navigation && typeof navigation.navigate === 'function') {
    navigation.navigate(routeName, {
      elemento: resuelto.elemento,
      elementoId: resuelto.elemento.id,
    });
    return { accion: 'navigation', elemento: resuelto.elemento };
  }

  return { accion: 'sin-datos', elemento: resuelto.elemento };
}