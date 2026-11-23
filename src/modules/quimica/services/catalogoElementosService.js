/**
 * Fuente única del catálogo de elementos (Q-24).
 * Fuente: archivo local versionado data/elementosQuimicos.json (sin endpoint remoto).
 * Consumen este servicio: RF-Q-02 (Randall), RF-Q-04/05 (Rodrigo), RF-Q-03 (Mateo), RF-Q-07/08 (Eduardo).
 *
 * API síncrona a propósito: la fuente es local, no se simula carga de red.
 * La búsqueda por nombre/símbolo NO está aquí: es responsabilidad de RF-Q-04/05 (filtrarElementos).
 */
import catalogoData from '../data/elementosQuimicos.json';
import { validarCatalogoElementos } from './validacionElementos';

let cache = null;

function cargarCatalogo() {
  if (cache) return cache;

  const lista = Array.isArray(catalogoData?.elementos) ? catalogoData.elementos : [];
  const { elementosValidos, errores } = validarCatalogoElementos(lista, { datosReales: true });

  if (errores.length > 0 && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn('[catalogoElementos] Datos inválidos en elementosQuimicos.json:\n' + errores.join('\n'));
  }

  cache = {
    elementos: [...elementosValidos].sort((a, b) => a.numeroAtomico - b.numeroAtomico),
    errores,
  };
  return cache;
}

/** Elementos válidos ordenados por número atómico (copia: no mutar el catálogo). */
export function obtenerElementosQuimicos() {
  return [...cargarCatalogo().elementos];
}

/** Errores de validación de la fuente (vacío si todo es válido). Útil para el estado de error de RF-Q-03. */
export function obtenerErroresCatalogo() {
  return [...cargarCatalogo().errores];
}

/** Metadatos de procedencia y alcance (metadata.completo indica si hay 118 elementos verificados). */
export function obtenerMetadatosCatalogo() {
  return catalogoData?.metadata ?? { origen: 'Fuente local no especificada', completo: false };
}

/** Busca por id (string o number) o por símbolo, sin distinguir mayúsculas. Para RF-Q-07/08. */
export function obtenerElementoPorIdOSimbolo(idOSimbolo) {
  if (idOSimbolo === null || idOSimbolo === undefined) return null;
  const criterio = String(idOSimbolo).trim().toLowerCase();
  if (!criterio) return null;

  return (
    cargarCatalogo().elementos.find(
      (el) => String(el.id).toLowerCase() === criterio || el.simbolo.toLowerCase() === criterio
    ) ?? null
  );
}
