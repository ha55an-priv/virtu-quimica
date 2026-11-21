// Ejecutar con: node --test src/modules/quimica/__tests__/   (Node 20.19+ / 22.7+, sin dependencias)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizarElemento, verificarElementoReal, validarCatalogoElementos } from '../services/validacionElementos.js';
import { ELEMENTO_FICTICIO, ELEMENTO_FICTICIO_MINIMO } from '../data/fixtures/elementosFicticios.js';

const catalogo = JSON.parse(fs.readFileSync(new URL('../data/elementosQuimicos.json', import.meta.url), 'utf8'));
const { metadata, elementos } = catalogo;

// Tabla de referencia DEL TEST (Z <-> símbolo). Contrastar con la tabla IUPAC antes de cerrar Q-24.
const REFERENCIA = { H: 1, He: 2, C: 6, O: 8, Na: 11 };

test('el catálogo real cumple contrato y reglas de datos reales (5 elementos)', () => {
  const r = validarCatalogoElementos(elementos, { datosReales: true });
  assert.deepEqual(r.errores, []);
  assert.equal(r.elementosValidos.length, 5);
});

test('cada elemento trae los campos requeridos y coincide con la tabla de referencia', () => {
  for (const e of elementos) {
    assert.equal(REFERENCIA[e.simbolo], e.numeroAtomico, `${e.simbolo}: Z no coincide`);
    assert.ok(e.nombre && e.clasificacion && e.descripcion, `${e.simbolo}: faltan campos`);
  }
});

test('metadata es honesta: completo=false y totalElementos coincide con la lista', () => {
  assert.equal(metadata.totalElementos, elementos.length);
  if (metadata.completo === true) {
    const zs = elementos.map((e) => e.numeroAtomico).sort((a, b) => a - b);
    assert.equal(zs.length, 118, 'completo=true exige 118 elementos');
    zs.forEach((z, i) => assert.equal(z, i + 1, 'completo=true exige Z contiguos 1..118'));
  } else {
    assert.ok(elementos.length < 118);
  }
  assert.equal(metadata.verificacion.estado === 'pendiente-contraste-manual' || metadata.verificacion.verificadoPor !== null, true);
});

test('un campo opcional ausente se omite (no se inventa)', () => {
  const { elemento } = normalizarElemento(ELEMENTO_FICTICIO_MINIMO);
  assert.ok(elemento);
  assert.equal('clasificacion' in elemento, false);
  assert.equal('descripcion' in elemento, false);
  const helio = validarCatalogoElementos(elementos).elementosValidos.find((e) => e.simbolo === 'He');
  assert.equal('ejemploOpcional' in helio, false);
});

test('el ficticio de Randall cumple el contrato pero NO es dato real', () => {
  const { elemento, errores } = normalizarElemento(ELEMENTO_FICTICIO);
  assert.deepEqual(errores, []);
  assert.ok(verificarElementoReal(elemento).length > 0);
});

test('ningún elemento ficticio está en el catálogo real', () => {
  for (const f of [ELEMENTO_FICTICIO, ELEMENTO_FICTICIO_MINIMO]) {
    assert.equal(elementos.some((e) => e.simbolo === f.simbolo || e.numeroAtomico === f.numeroAtomico), false);
  }
  assert.equal(elementos.some((e) => /ficticio/i.test(e.nombre)), false);
});

test('el contrato rechaza coerciones y campos requeridos ausentes', () => {
  const base = { id: 1, nombre: 'X', simbolo: 'X' };
  for (const z of ['6', true, 0, -1, 1.5, null, undefined]) {
    assert.equal(normalizarElemento({ ...base, numeroAtomico: z }).elemento, null, `Z=${String(z)} debió rechazarse`);
  }
  assert.equal(normalizarElemento({ ...base, id: undefined, numeroAtomico: 1 }).elemento, null);
  assert.equal(normalizarElemento({ ...base, nombre: '  ', numeroAtomico: 1 }).elemento, null);
  assert.equal(normalizarElemento(null).elemento, null);
});

test('id acepta string o number', () => {
  assert.ok(normalizarElemento({ id: 'elem-001', nombre: 'a', simbolo: 'A', numeroAtomico: 1 }).elemento);
  assert.ok(normalizarElemento({ id: 7, nombre: 'a', simbolo: 'A', numeroAtomico: 1 }).elemento);
});

test('datos reales: rechaza Z>118, símbolo mal formado e id incoherente', () => {
  const mk = (o) => validarCatalogoElementos([{ id: 'elem-005', nombre: 'B', simbolo: 'B', numeroAtomico: 5, ...o }], { datosReales: true });
  assert.equal(mk({}).valido, true);
  assert.equal(mk({ numeroAtomico: 200, id: 'elem-200' }).valido, false);
  assert.equal(mk({ simbolo: 'Zzzzzz' }).valido, false);
  assert.equal(mk({ id: 'elem-099' }).valido, false);
});

test('detecta duplicados de id, símbolo y número atómico', () => {
  const a = elementos[0];
  assert.match(validarCatalogoElementos([a, { ...a }]).errores.join(), /id duplicado/);
  assert.match(validarCatalogoElementos([a, { ...a, id: 'x' }]).errores.join(), /símbolo duplicado/);
  assert.match(validarCatalogoElementos([a, { ...a, id: 'x', simbolo: 'Zz' }]).errores.join(), /numeroAtomico duplicado/);
});

test('un registro roto no se descarta en silencio: queda en errores', () => {
  const r = validarCatalogoElementos([elementos[0], { id: 'a' }]);
  assert.equal(r.valido, false);
  assert.equal(r.elementosValidos.length, 1);
  assert.ok(r.errores.length > 0);
});
