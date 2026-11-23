/**
 * Pruebas del contrato Q-23 / RF-Q-01.
 *
 * El proyecto no define un runner de pruebas ni "type": "module" en package.json,
 * así que este archivo evalúa el mismo código fuente de elementoContract.js después de
 * quitar las palabras `export`. No duplica la lógica: si el módulo cambia, estas
 * pruebas fallan. Ejecutar con:
 *
 *   node src/modules/quimica/services/elementoContract.test.cjs
 */

const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const sourcePath = require.resolve('./elementoContract.js');
const source = fs.readFileSync(sourcePath, 'utf8').replace(/^export /gm, '');
const context = vm.createContext({ Object, Number, console });
vm.runInContext(
  `${source}\n;globalThis.__contrato = {
    CAMPOS_ELEMENTO,
    normalizarElementoDesdeGlosario,
    obtenerErroresElemento,
    esElementoValido,
  };`,
  context,
);

const {
  CAMPOS_ELEMENTO,
  normalizarElementoDesdeGlosario,
  obtenerErroresElemento,
  esElementoValido,
} = context.__contrato;

const registroReal = {
  id: 1,
  contenidoId: 4,
  elementoQuimico: 'Oxígeno',
  nombre: 'Oxígeno',
  simbolo: 'O',
  numeroAtomico: 8,
  clasificacion: 'No metal',
  formulaEjemplo: 'H2O',
};

const normalizado = normalizarElementoDesdeGlosario(registroReal);
assert.deepEqual(normalizado, {
  id: 1,
  nombre: 'Oxígeno',
  simbolo: 'O',
  numeroAtomico: 8,
  clasificacion: 'No metal',
  descripcion: null,
});
assert.equal(Object.hasOwn(normalizado, 'formulaEjemplo'), false);
assert.equal(esElementoValido(normalizado), true);
console.log('PASS: normalización del registro real de Oxígeno');

const ficticio = {
  id: 'demo-999',
  nombre: 'ElementoDemostracion',
  simbolo: 'Xd',
  numeroAtomico: 999,
  clasificacion: 'Ejemplo de contrato',
  descripcion: 'Solo para probar renderizado.',
};
assert.equal(esElementoValido(ficticio), true);
console.log('PASS: ejemplo ficticio cumple el contrato');

assert.equal(normalizarElementoDesdeGlosario(null), null);
assert.equal(normalizarElementoDesdeGlosario({ ...registroReal, numeroAtomico: 0 }), null);
assert.equal(normalizarElementoDesdeGlosario({ simbolo: 'H', numeroAtomico: 1 }), null);
console.log('PASS: registros incompletos se rechazan');

assert.ok(
  obtenerErroresElemento({ ...ficticio, simbolo: '' }).some((mensaje) =>
    mensaje.includes('simbolo'),
  ),
);
assert.ok(
  obtenerErroresElemento({ ...ficticio, descripcion: 42 }).some((mensaje) =>
    mensaje.includes('descripcion'),
  ),
);
console.log('PASS: validador reporta errores de forma');

assert.equal(CAMPOS_ELEMENTO.descripcion.obligatorio, false);
assert.equal(CAMPOS_ELEMENTO.numeroAtomico.obligatorio, true);
console.log('PASS: metadatos del contrato');

console.log('Todas las pruebas del contrato pasaron.');
