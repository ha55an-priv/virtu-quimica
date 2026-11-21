/**
 * Pruebas puras de los mapeos de Q-13. No requieren React Native ni red.
 * Ejecutar: node src/modules/quimica/services/contenidoMappers.test.cjs
 *
 * Los payloads son copias literales de las respuestas reales verificadas contra el
 * backend de producción el 2026-11-20 (ver docs/Q-13-unidades-lecciones-api.md).
 */

const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const sourcePath = require.resolve('./contenidoMappers.js');
const source = fs.readFileSync(sourcePath, 'utf8').replace(/^export /gm, '');
const context = vm.createContext({ Array, Number, console });
vm.runInContext(
  `${source}\n;globalThis.__mapeos = {
    mapearContenido,
    mapearUnidad,
    mapearLeccionResumen,
    mapearLeccionDetalle,
    mensajeErrorContenido,
  };`,
  context,
);
const { mapearContenido, mapearLeccionDetalle, mensajeErrorContenido } = context.__mapeos;

const contenidoReal = {
  status: 'success',
  data: {
    id: 4,
    nombre: 'Química',
    slug: 'quimica',
    resumen:
      'Exploración de la estructura atómica, enlaces moleculares, estequiometría y reacciones químicas.',
    estaHabilitado: true,
    unidades: [
      {
        id: 4,
        titulo: 'Unidad 1: Estructura Atómica y Enlaces',
        descripcion: null,
        orden: 1,
        estadoUnidad: 'PENDIENTE',
        totalLecciones: 1,
        lecciones: [
          {
            id: 4,
            titulo: 'Enlaces Covalentes e Iónicos',
            orden: 1,
            tieneCuestionario: false,
            cuestionarioId: null,
            estado: 'PENDIENTE',
          },
        ],
      },
    ],
  },
};

const contenido = mapearContenido(contenidoReal);
assert.equal(contenido.id, 4);
assert.equal(contenido.slug, 'quimica');
assert.equal(contenido.unidades.length, 1);
assert.equal(contenido.unidades[0].lecciones.length, 1);
assert.equal(contenido.unidades[0].lecciones[0].id, 4);
assert.equal(contenido.unidades[0].lecciones[0].unidadId, 4);
assert.equal(contenido.unidades[0].descripcion, null);
assert.equal(Object.hasOwn(contenido.unidades[0].lecciones[0], 'estado'), false);
assert.equal(Object.hasOwn(contenido.unidades[0], 'estadoUnidad'), false);
console.log('PASS: mapeo del contenido real de Química sin campos de progreso');

const leccionReal = {
  status: 'success',
  data: {
    id: 4,
    titulo: 'Enlaces Covalentes e Iónicos',
    definicion:
      'Los enlaces químicos son fuerzas que mantienen unidos los átomos. El enlace iónico implica la transferencia completa de electrones, mientras que el covalente se basa en compartir electrones.',
    ejemplo:
      'El cloruro de sodio (sal común, NaCl) es un enlace iónico, mientras que la molécula de agua (H2O) está unida mediante enlaces covalentes.',
    orden: 1,
    unidad: {
      id: 4,
      titulo: 'Unidad 1: Estructura Atómica y Enlaces',
      materia: 'Química',
      materiaSlug: 'quimica',
    },
    tieneCuestionario: false,
    cuestionarioId: null,
    tiempoLimiteSegundos: null,
    estadoEstudiante: 'PENDIENTE',
  },
};

const leccion = mapearLeccionDetalle(leccionReal);
assert.equal(leccion.id, 4);
assert.ok(leccion.definicion.includes('enlaces químicos'));
assert.ok(leccion.ejemplo.includes('NaCl'));
assert.equal(leccion.unidad.materiaSlug, 'quimica');
assert.equal(leccion.tiempoLimiteSegundos, null);
assert.equal(Object.hasOwn(leccion, 'estadoEstudiante'), false);
console.log('PASS: mapeo del detalle real sin progreso ni cuestionario');

const vacio = mapearContenido({ status: 'success', data: { ...contenidoReal.data, unidades: [] } });
assert.deepEqual(vacio.unidades, []);
console.log('PASS: un arreglo vacío real se conserva como estado vacío');

assert.equal(mapearContenido({ status: 'error', data: {} }), null);
assert.equal(mapearContenido({ status: 'success', data: null }), null);
assert.equal(mapearLeccionDetalle(null), null);
console.log('PASS: respuestas inválidas se rechazan sin inventar datos');

assert.equal(
  mensajeErrorContenido({ response: { status: 401 } }),
  'Tu sesión no es válida. Vuelve a iniciar sesión.',
);
assert.equal(
  mensajeErrorContenido({ response: { status: 403 } }),
  'El contenido académico no está habilitado para tu perfil.',
);
assert.equal(
  mensajeErrorContenido({ response: { status: 404 } }),
  'No se encontró el contenido solicitado.',
);
assert.ok(mensajeErrorContenido({ code: 'ECONNABORTED' }).includes('tardó'));
assert.ok(mensajeErrorContenido({ code: 'ERR_NETWORK' }).includes('conectar'));
assert.equal(
  mensajeErrorContenido({ response: { data: { message: 'Lección no encontrada' } } }),
  'Lección no encontrada',
);
assert.ok(mensajeErrorContenido(new Error('otro')).includes('No se pudo cargar'));
console.log('PASS: mensajes de error para estados reales de la API');

console.log('Todas las pruebas de mapeo Q-13 pasaron.');
