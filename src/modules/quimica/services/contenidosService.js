import { httpClient } from '../../../shared/services/httpClient';
import { mapearContenido, mapearLeccionDetalle } from './contenidoMappers';

export const SLUG_QUIMICA = 'quimica';

/**
 * GET /contenidos/:slug con el slug real de Química.
 * El token lo inyecta el interceptor de `httpClient` a partir de la sesión.
 */
export async function obtenerContenidoQuimica({ signal } = {}) {
  const { data } = await httpClient.get(`/contenidos/${SLUG_QUIMICA}`, { signal });
  const contenido = mapearContenido(data);
  if (!contenido) {
    throw new Error('La API devolvió una estructura de contenido no reconocida.');
  }
  return contenido;
}

/** GET /lecciones/:id para una lección derivada del árbol de /contenidos/quimica. */
export async function obtenerLeccion(idLeccion, { signal } = {}) {
  if (idLeccion === null || idLeccion === undefined || String(idLeccion).trim() === '') {
    throw new Error('Falta el identificador de la lección.');
  }
  const id = encodeURIComponent(String(idLeccion));
  const { data } = await httpClient.get(`/lecciones/${id}`, { signal });
  const leccion = mapearLeccionDetalle(data);
  if (!leccion) {
    throw new Error('La API devolvió una estructura de lección no reconocida.');
  }
  return leccion;
}
