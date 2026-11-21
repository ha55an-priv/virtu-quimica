/**
 * Mapeos puros de Q-13: convierten la forma real de la API al modelo de la app.
 *
 * Forma real verificada (Swagger 3.0.3 + backend de producción, 2026-11-20):
 * - GET /contenidos/quimica -> { status: 'success', data: { id, nombre, slug, resumen,
 *   estaHabilitado, unidades: [{ id, titulo, descripcion, orden, totalLecciones,
 *   lecciones: [{ id, titulo, orden, tieneCuestionario, cuestionarioId, estado }] }] } }
 * - GET /lecciones/:id -> { status: 'success', data: { id, titulo, definicion, ejemplo,
 *   orden, unidad: { id, titulo, materia, materiaSlug }, tieneCuestionario,
 *   cuestionarioId, tiempoLimiteSegundos, estadoEstudiante } }
 *
 * `estado` y `estadoEstudiante` se descartan deliberadamente: progreso es Sprint 2.
 */

function texto(valor, fallback = '') {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : fallback;
}

function entero(valor) {
  return Number.isInteger(valor) ? valor : null;
}

function datos(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.status && payload.status !== 'success') return null;
  const data = payload.data;
  return data && typeof data === 'object' ? data : null;
}

export function mapearLeccionResumen(raw, unidadId = null) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id ?? null,
    titulo: texto(raw.titulo, 'Lección sin título'),
    orden: entero(raw.orden),
    unidadId: raw.unidadId ?? unidadId ?? null,
    tieneCuestionario: raw.tieneCuestionario === true,
    cuestionarioId: raw.cuestionarioId ?? null,
  };
}

export function mapearUnidad(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const lecciones = Array.isArray(raw.lecciones)
    ? raw.lecciones.map((leccion) => mapearLeccionResumen(leccion, raw.id)).filter(Boolean)
    : [];
  return {
    id: raw.id ?? null,
    titulo: texto(raw.titulo, 'Unidad sin título'),
    descripcion: texto(raw.descripcion) || null,
    orden: entero(raw.orden),
    totalLecciones: entero(raw.totalLecciones) ?? lecciones.length,
    lecciones,
  };
}

export function mapearContenido(payload) {
  const data = datos(payload);
  if (!data) return null;
  return {
    id: data.id ?? null,
    nombre: texto(data.nombre, 'Materia'),
    slug: texto(data.slug, 'quimica'),
    resumen: texto(data.resumen) || null,
    estaHabilitado: data.estaHabilitado === true,
    unidades: Array.isArray(data.unidades) ? data.unidades.map(mapearUnidad).filter(Boolean) : [],
  };
}

export function mapearLeccionDetalle(payload) {
  const data = datos(payload);
  if (!data) return null;
  const unidad = data.unidad && typeof data.unidad === 'object' ? data.unidad : null;
  return {
    id: data.id ?? null,
    titulo: texto(data.titulo, 'Lección sin título'),
    definicion: texto(data.definicion) || null,
    ejemplo: texto(data.ejemplo) || null,
    orden: entero(data.orden),
    unidad: unidad
      ? {
          id: unidad.id ?? null,
          titulo: texto(unidad.titulo, 'Unidad sin título'),
          materia: texto(unidad.materia) || null,
          materiaSlug: texto(unidad.materiaSlug) || null,
        }
      : null,
    tieneCuestionario: data.tieneCuestionario === true,
    cuestionarioId: data.cuestionarioId ?? null,
    tiempoLimiteSegundos: entero(data.tiempoLimiteSegundos),
  };
}

export function mensajeErrorContenido(error) {
  const status = error?.response?.status;
  if (status === 401) return 'Tu sesión no es válida. Vuelve a iniciar sesión.';
  if (status === 403) return 'El contenido académico no está habilitado para tu perfil.';
  if (status === 404) return 'No se encontró el contenido solicitado.';
  if (error?.code === 'ECONNABORTED') return 'El servidor tardó demasiado. Intenta de nuevo.';
  if (error?.code === 'ERR_NETWORK') return 'No se pudo conectar con el servidor.';
  const delApi = error?.response?.data?.message;
  if (typeof delApi === 'string' && delApi.trim()) return delApi.trim();
  return 'No se pudo cargar la información. Intenta de nuevo.';
}
