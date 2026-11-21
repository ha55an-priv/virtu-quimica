// RF-Q-09 · verificación de la lógica catálogo → selección → ficha (Node, sin dispositivo).
// NO sustituye la prueba visual de la ficha ni la comparación manual con IUPAC (ver docs/RF-Q-09-*.md).
//   node --import ./src/modules/quimica/__tests__/registrarJsonLoader.mjs --test src/modules/quimica/__tests__/verificacionRfQ09.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { ELEMENTO_FICTICIO_MINIMO } from '../data/fixtures/elementosFicticios.js';
import {
  obtenerElementoPorIdOSimbolo,
  obtenerElementosQuimicos,
} from '../services/catalogoElementosService.js';
import { notificarSeleccion } from '../services/catalogoIntegration.js';
import { normalizarElemento } from '../services/validacionElementos.js';

const json = JSON.parse(fs.readFileSync(new URL('../data/elementosQuimicos.json', import.meta.url), 'utf8'));
const RUTA = 'FichaElemento';

test('selección: cada elemento navega con su id y la ficha lo recupera idéntico (por id y por símbolo)', () => {
  for (const el of obtenerElementosQuimicos()) {
    let llamada = null;
    const navigation = { navigate: (ruta, params) => (llamada = { ruta, params }) };

    assert.equal(notificarSeleccion(el, undefined, navigation, RUTA), 'navigation');
    assert.deepEqual(llamada, { ruta: RUTA, params: { elementoId: el.id } });

    assert.deepEqual(obtenerElementoPorIdOSimbolo(llamada.params.elementoId), el, `${el.simbolo}: difiere por id`);
    assert.deepEqual(obtenerElementoPorIdOSimbolo(el.simbolo.toLowerCase()), el, `${el.simbolo}: difiere por símbolo`);
  }
});

test('selección: el callback tiene prioridad y recibe solo el elemento; sin handler no lanza', () => {
  const [primero] = obtenerElementosQuimicos();
  let recibido;
  let navegado = false;
  const navigation = { navigate: () => (navegado = true) };

  assert.equal(notificarSeleccion(primero, (e) => (recibido = e), navigation, RUTA), 'callback');
  assert.deepEqual(recibido, primero);
  assert.equal(navegado, false);

  assert.equal(notificarSeleccion(primero, undefined, undefined, RUTA), 'none');
  assert.equal(notificarSeleccion(primero, undefined, {}, RUTA), 'none');
});

test('opcionales reales: He, Be y F no traen ejemploOpcional; todos traen clasificación y descripción', () => {
  const sinEjemplo = ['He', 'Be', 'F'];
  for (const el of obtenerElementosQuimicos()) {
    assert.equal('ejemploOpcional' in el, !sinEjemplo.includes(el.simbolo), `${el.simbolo}: ejemploOpcional inesperado`);
    assert.ok(el.clasificacion && el.descripcion, `${el.simbolo}: falta clasificación o descripción`);
  }
});

test('opcionales ausentes: un elemento mínimo es válido y no se rellena con valores inventados', () => {
  const { elemento, errores } = normalizarElemento(ELEMENTO_FICTICIO_MINIMO);
  assert.deepEqual(errores, []);
  for (const campo of ['clasificacion', 'descripcion', 'ejemploOpcional']) {
    assert.equal(campo in elemento, false, `${campo} no debería existir`);
  }
});

test('errores: ids inexistentes y registros inválidos devuelven null sin lanzar excepciones', () => {
  for (const id of ['elem-999', 1, 0, '', '   ', null, undefined, {}, []]) {
    assert.doesNotThrow(() => obtenerElementoPorIdOSimbolo(id));
    assert.equal(obtenerElementoPorIdOSimbolo(id), null, `id ${JSON.stringify(id)} debió dar null`);
  }
  for (const malo of [null, undefined, [], 'x', 42, {}, { id: 'a' }, { id: 1, nombre: 'X', simbolo: 'X', numeroAtomico: '6' }]) {
    assert.doesNotThrow(() => normalizarElemento(malo));
    assert.equal(normalizarElemento(malo).elemento, null);
  }
});

test('alcance honesto: completo=false, total coincide, sin ficticios y verificación coherente', () => {
  const { metadata, elementos } = json;
  assert.equal(metadata.completo, false);
  assert.equal(metadata.totalElementos, elementos.length);
  assert.equal(elementos.some((e) => /ficticio|mínimo/i.test(e.nombre)), false);

  const v = metadata.verificacion;
  if (v.estado !== 'pendiente-contraste-manual') {
    assert.ok(v.verificadoPor && v.fechaVerificacion, 'verificado sin responsable ni fecha');
  }
});
