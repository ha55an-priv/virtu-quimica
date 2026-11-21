/**
 * Pruebas puras de integración de RF-Q-02.
 * Ejecutar: node src/modules/quimica/services/catalogoIntegration.test.cjs
 */

const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const sourcePath = require.resolve('./catalogoIntegration.js');
const source = fs.readFileSync(sourcePath, 'utf8').replace(/^export /gm, '');
const context = vm.createContext({ Array, console });
vm.runInContext(
  `${source}\n;globalThis.__integracion = { resolverElementos, notificarSeleccion };`,
  context,
);

const { resolverElementos, notificarSeleccion } = context.__integracion;

const elementos = [
  { id: 1, nombre: 'Oxígeno', simbolo: 'O', numeroAtomico: 8 },
  { id: 2, nombre: 'Elemento Demo', simbolo: 'Xd', numeroAtomico: 999 },
];

const sinFiltro = resolverElementos(elementos, 'ox', undefined);
assert.equal(sinFiltro, elementos);
console.log('PASS: sin filtro se devuelve la lista original');

let argsRecibidos;
const filtro = (lista, consulta) => {
  argsRecibidos = [lista, consulta];
  return lista.filter((item) => item.simbolo === 'O');
};
const filtrados = resolverElementos(elementos, 'O', filtro);
assert.equal(filtrados.length, 1);
assert.equal(filtrados[0].simbolo, 'O');
assert.equal(argsRecibidos[1], 'O');
console.log('PASS: se delega en el filtro inyectado');

assert.deepEqual(
  resolverElementos(elementos, 'O', () => null),
  [],
);
assert.deepEqual(resolverElementos(null, '', undefined), []);
console.log('PASS: resultados inválidos y lista nula se normalizan');

const filtroSourcePath = require.resolve('./filtrarElementos.js');
const filtroSource = fs.readFileSync(filtroSourcePath, 'utf8').replace(/^export /gm, '');
const filtroContext = vm.createContext({ Array, String, TypeError, RegExp, Object, console });
vm.runInContext(`${filtroSource}\n;globalThis.__filtroReal = filtrarElementos;`, filtroContext);
const filtrarElementosReal = filtroContext.__filtroReal;

assert.equal(resolverElementos(elementos, 'oxigeno', filtrarElementosReal).length, 1);
assert.equal(resolverElementos(elementos, 'OXÍGENO', filtrarElementosReal).length, 1);
assert.deepEqual(resolverElementos(elementos, 'no-existe', filtrarElementosReal), []);
console.log('PASS: integración con el filtro real de RF-Q-05 (tildes y sin coincidencias)');

let seleccionado;
const modoCallback = notificarSeleccion(elementos[0], (elemento) => {
  seleccionado = elemento;
});
assert.equal(modoCallback, 'callback');
assert.equal(seleccionado, elementos[0]);
console.log('PASS: selección usa onSelectElement cuando existe');

let navegacion;
const modoNavegacion = notificarSeleccion(
  elementos[0],
  undefined,
  { navigate: (ruta, params) => (navegacion = { ruta, params }) },
  'FichaElemento',
);
assert.equal(modoNavegacion, 'navigation');
assert.deepEqual(navegacion, {
  ruta: 'FichaElemento',
  params: { elementoId: 1 },
});
console.log('PASS: selección cae a navigation.navigate con elementoId');

assert.equal(notificarSeleccion(elementos[0]), 'none');
console.log('PASS: selección sin handler es segura');

console.log('Todas las pruebas de integración del catálogo pasaron.');
