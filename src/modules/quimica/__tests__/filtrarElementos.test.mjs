import assert from 'node:assert/strict';
import test from 'node:test';

import { filtrarElementos } from '../services/filtrarElementos.js';

// Datos aislados para probar el filtro; no son una fuente del catálogo de producción.
const elementos = Object.freeze(
  [
    { id: 'na', nombre: 'Sodio', simbolo: 'Na', clasificacion: 'Metal alcalino' },
    { id: 'cl', nombre: 'Cloro', simbolo: 'Cl' },
    { id: 'h', nombre: 'Hidrógeno', simbolo: 'H' },
    { id: 'c', nombre: 'Carbono', simbolo: 'C', descripcion: 'Dato solo de prueba' },
    { id: 'he', nombre: 'Helio', simbolo: 'He' },
    { id: 'o', nombre: 'Oxígeno', simbolo: 'O' },
  ].map((elemento) => Object.freeze(elemento)),
);
const [sodio, cloro, hidrogeno, carbono, helio] = elementos;

test('encuentra un nombre completo', () => {
  assert.deepEqual(filtrarElementos(elementos, 'Carbono'), [carbono]);
});

test('encuentra por símbolo aunque el nombre no contenga la consulta', () => {
  assert.deepEqual(filtrarElementos(elementos, 'Na'), [sodio]);
});

test('encuentra subcadenas al inicio, en medio y al final del nombre', () => {
  for (const consulta of ['car', 'bon', 'ono']) {
    assert.deepEqual(filtrarElementos(elementos, consulta), [carbono]);
  }
  assert.deepEqual(filtrarElementos(elementos, 'hid'), [hidrogeno]);
});

test('admite una subcadena del símbolo de un solo carácter', () => {
  assert.deepEqual(filtrarElementos(elementos, 'a'), [sodio, carbono]);
});

test('ignora mayúsculas y minúsculas en nombres y símbolos', () => {
  for (const consulta of ['CAR', 'car', 'cAr']) {
    assert.deepEqual(filtrarElementos(elementos, consulta), [carbono]);
  }
  assert.deepEqual(filtrarElementos(elementos, 'na'), [sodio]);
  assert.deepEqual(filtrarElementos(elementos, 'NA'), [sodio]);
});

test('encuentra nombres con y sin tilde', () => {
  for (const consulta of ['hidrogeno', 'HIDRÓGENO', 'hidrógeno']) {
    assert.deepEqual(filtrarElementos(elementos, consulta), [hidrogeno]);
  }
});

test('normaliza las cinco vocales agudas también en la consulta', () => {
  const muestra = [{ nombre: 'ÁÉÍÓÚ', simbolo: 'X' }];
  for (const consulta of ['aeiou', 'ÁÉÍÓÚ', 'áéíóú']) {
    assert.deepEqual(filtrarElementos(muestra, consulta), muestra);
  }
});

test('normaliza Unicode compuesto y descompuesto en campos y consulta', () => {
  const muestra = [{ nombre: 'Hidro\u0301geno', simbolo: 'H' }];
  assert.deepEqual(filtrarElementos(muestra, 'HIDRÓGENO'), muestra);
  assert.deepEqual(filtrarElementos(elementos, 'HIDRO\u0301GENO'), [hidrogeno]);
});

test('conserva ñ y ü según RF-Q-04', () => {
  const muestra = [{ nombre: 'Peña Güiro', simbolo: 'X' }];
  assert.deepEqual(filtrarElementos(muestra, 'pena'), []);
  assert.deepEqual(filtrarElementos(muestra, 'guiro'), []);
  assert.deepEqual(filtrarElementos(muestra, 'PEÑA'), muestra);
  assert.deepEqual(filtrarElementos(muestra, 'GÜIRO'), muestra);
});

test('recorta espacios, tabulaciones y saltos de línea exteriores', () => {
  assert.deepEqual(filtrarElementos(elementos, ' \t CAR \r\n '), [carbono]);
});

test('no elimina ni agrupa espacios interiores ni separa términos', () => {
  assert.deepEqual(filtrarElementos(elementos, 'ca r'), []);
  assert.deepEqual(filtrarElementos(elementos, 'car bono'), []);
  const muestra = [{ nombre: 'Nombre  de prueba', simbolo: 'X' }];
  assert.deepEqual(filtrarElementos(muestra, 'nombre  de'), muestra);
  assert.deepEqual(filtrarElementos(muestra, 'nombre de'), []);
});

test('devuelve todos los elementos para una cadena vacía', () => {
  assert.deepEqual(filtrarElementos(elementos, ''), elementos);
});

test('devuelve todos los elementos para una consulta solo de espacios en blanco', () => {
  assert.deepEqual(filtrarElementos(elementos, ' \t\r\n '), elementos);
});

test('permite borrar progresivamente la consulta y recupera el listado completo', () => {
  for (const consulta of ['carbono', 'carbon', 'carbo', 'carb', 'car']) {
    assert.deepEqual(filtrarElementos(elementos, consulta), [carbono]);
  }
  assert.deepEqual(filtrarElementos(elementos, 'ca'), [carbono]);
  assert.deepEqual(filtrarElementos(elementos, 'c'), [cloro, carbono]);
  assert.deepEqual(filtrarElementos(elementos, ''), elementos);
});

test('devuelve un arreglo vacío sin coincidencias', () => {
  assert.deepEqual(filtrarElementos(elementos, 'zzzz'), []);
});

test('conserva el orden original sin priorizar el símbolo exacto', () => {
  assert.deepEqual(filtrarElementos(elementos, 'o'), elementos);
  assert.deepEqual(filtrarElementos(elementos, 'c'), [cloro, carbono]);
});

test('no duplica un registro que coincide por nombre y símbolo', () => {
  const resultado = filtrarElementos(elementos, 'h');
  assert.deepEqual(resultado, [hidrogeno, helio]);
  assert.equal(new Set(resultado).size, resultado.length);
});

test('devuelve un arreglo nuevo con los objetos originales y no modifica la fuente', () => {
  const antes = JSON.stringify(elementos);
  for (const consulta of ['', 'car', 'o', 'zzzz']) {
    const resultado = filtrarElementos(elementos, consulta);
    assert.notEqual(resultado, elementos);
    for (const elemento of resultado) {
      assert.ok(elementos.includes(elemento));
    }
    resultado.length = 0;
    assert.equal(JSON.stringify(elementos), antes);
  }
});

test('acepta una colección vacía', () => {
  assert.deepEqual(filtrarElementos([], ''), []);
  assert.deepEqual(filtrarElementos([], 'hid'), []);
});

test('no busca por id, clasificación ni descripción', () => {
  for (const consulta of ['metal', 'dato solo', 'solo-id']) {
    assert.deepEqual(
      filtrarElementos([{ ...carbono, id: 'solo-id', clasificacion: 'Metal' }], consulta),
      [],
    );
  }
});

test('compara símbolos y nombres con OR sin concatenar los campos', () => {
  assert.deepEqual(filtrarElementos(elementos, 'carbonoc'), []);
  assert.deepEqual(filtrarElementos(elementos, 'he'), [helio]);
});

test('interpreta signos y comodines literalmente', () => {
  for (const consulta of ['*', '.', '[', '.*']) {
    assert.deepEqual(filtrarElementos(elementos, consulta), []);
  }
  const muestra = [{ nombre: 'Dato.*', simbolo: 'X' }];
  assert.deepEqual(filtrarElementos(muestra, '.*'), muestra);
});

test('rechaza una colección que no sea un arreglo sin coerciones', () => {
  for (const invalido of [null, undefined, {}, 'Carbono', 0]) {
    assert.throws(() => filtrarElementos(invalido, ''), {
      name: 'TypeError',
      message: 'elementos debe ser un arreglo.',
    });
  }
});

test('rechaza consultas que no sean cadenas incluso con una colección vacía', () => {
  for (const invalida of [null, undefined, 0, {}, []]) {
    assert.throws(() => filtrarElementos([], invalida), {
      name: 'TypeError',
      message: 'consulta debe ser una cadena.',
    });
  }
});

test('rechaza registros inválidos en vez de ocultarlos', () => {
  for (const invalido of [null, undefined, [], 'Carbono', 3]) {
    assert.throws(() => filtrarElementos([invalido], 'zzzz'), {
      name: 'TypeError',
      message: 'elementos[0] debe ser un objeto.',
    });
  }
});

test('valida ambos campos aunque la consulta esté vacía o coincida con el otro campo', () => {
  for (const campo of ['nombre', 'simbolo']) {
    for (const invalido of [undefined, null, 3, {}, '', ' \t ']) {
      for (const consulta of ['', 'carbono', 'zzzz']) {
        assert.throws(() => filtrarElementos([{ ...carbono, [campo]: invalido }], consulta), {
          name: 'TypeError',
          message: `elementos[0].${campo} debe ser una cadena no vacía.`,
        });
      }
    }
  }
});

test('detecta registros inválidos después de una coincidencia válida', () => {
  assert.throws(() => filtrarElementos([carbono, { nombre: 'Otro' }], 'car'), {
    name: 'TypeError',
    message: 'elementos[1].simbolo debe ser una cadena no vacía.',
  });
});

test('rechaza arreglos con posiciones sin un registro', () => {
  assert.throws(() => filtrarElementos(new Array(1), ''), {
    name: 'TypeError',
    message: 'elementos[0] debe ser un objeto.',
  });
});
