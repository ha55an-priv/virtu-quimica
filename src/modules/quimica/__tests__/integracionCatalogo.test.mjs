// RF-Q-08. Ejecutar con (Node 20.19+ / 22.7+, sin dependencias):
//   node --import ./src/modules/quimica/__tests__/registrarJsonLoader.mjs --test src/modules/quimica/__tests__/integracionCatalogo.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  obtenerElementoPorIdOSimbolo,
  obtenerElementosQuimicos,
  obtenerErroresCatalogo,
  obtenerMetadatosCatalogo,
} from '../services/catalogoElementosService.js';
import { esElementoValido, normalizarElementoDesdeGlosario } from '../services/elementoContract.js';

const json = JSON.parse(
  fs.readFileSync(new URL('../data/elementosQuimicos.json', import.meta.url), 'utf8'),
);

// Copia literal de GET /glosarios/quimica verificada en Q-23 (docs/Q-23-RF-Q-01-contrato-api-catalogo.md).
const REGISTRO_GLOSARIO_Q23 = {
  id: 1,
  contenidoId: 4,
  elementoQuimico: 'Oxígeno',
  nombre: 'Oxígeno',
  simbolo: 'O',
  numeroAtomico: 8,
  clasificacion: 'No metal',
  formulaEjemplo: 'H2O',
};

test('la fuente única carga sin errores y no está vacía', () => {
  assert.deepEqual(obtenerErroresCatalogo(), []);
  assert.ok(obtenerElementosQuimicos().length > 0);
  assert.equal(
    obtenerElementosQuimicos().length,
    json.elementos.length,
    'ningún elemento fue descartado',
  );
});

test('catálogo → ficha: cada elemento se recupera por su id (lo que hace la ficha con { elementoId })', () => {
  for (const el of obtenerElementosQuimicos()) {
    assert.deepEqual(
      obtenerElementoPorIdOSimbolo(el.id),
      el,
      `${el.simbolo}: la ficha mostraría otros datos`,
    );
  }
});

test('cada elemento también se recupera por símbolo, sin distinguir mayúsculas', () => {
  for (const el of obtenerElementosQuimicos()) {
    assert.equal(obtenerElementoPorIdOSimbolo(el.simbolo.toLowerCase())?.id, el.id);
    assert.equal(obtenerElementoPorIdOSimbolo(el.simbolo.toUpperCase())?.id, el.id);
  }
});

test('los ids del catálogo son únicos y de tipo string', () => {
  const ids = obtenerElementosQuimicos().map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  ids.forEach((id) => assert.equal(typeof id, 'string'));
});

test('un id inexistente o de la API (1) no resuelve: la ficha mostrará "no encontrado", sin excepción', () => {
  assert.equal(obtenerElementoPorIdOSimbolo(1), null);
  assert.equal(obtenerElementoPorIdOSimbolo('elem-999'), null);
  assert.equal(obtenerElementoPorIdOSimbolo(''), null);
  assert.equal(obtenerElementoPorIdOSimbolo(undefined), null);
});

test('los elementos reales cumplen el contrato de Randall (esElementoValido)', () => {
  for (const el of obtenerElementosQuimicos()) {
    assert.deepEqual(esElementoValido(el), true, `${el.simbolo} no cumple elementoContract`);
  }
});

test('cruce con el glosario real (Q-23): el único elemento común coincide en los 4 campos del glosario', () => {
  const delGlosario = normalizarElementoDesdeGlosario(REGISTRO_GLOSARIO_Q23);
  const local = obtenerElementoPorIdOSimbolo(delGlosario.simbolo);
  assert.ok(local, 'Oxígeno debe existir en el catálogo local');
  for (const campo of ['nombre', 'simbolo', 'numeroAtomico', 'clasificacion']) {
    assert.equal(
      local[campo],
      delGlosario[campo],
      `campo ${campo} difiere entre glosario y catálogo local`,
    );
  }
  // La descripción solo existe en la fuente local (el glosario no la provee).
  assert.equal(delGlosario.descripcion, null);
  assert.ok(local.descripcion);
});

test('la fuente declara su alcance sin afirmar los 118 elementos', () => {
  const m = obtenerMetadatosCatalogo();
  assert.equal(m.completo, false);
  assert.equal(m.totalElementos, obtenerElementosQuimicos().length);
  assert.ok(obtenerElementosQuimicos().length < 118);
});