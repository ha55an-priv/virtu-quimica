/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const babel = require('@babel/core');

// Ejecuta el componente real con JSX transformado y primitivas nativas aisladas.
// No sustituye una prueba visual en Android/iOS.
const filename = path.join(__dirname, '../components/EstadoCatalogo.js');
const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
  filename,
  babelrc: false,
  configFile: false,
  plugins: [
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    '@babel/plugin-transform-modules-commonjs',
  ],
});
const native = {
  ActivityIndicator: 'ActivityIndicator',
  Pressable: 'Pressable',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (styles) => styles },
};
const theme = {
  colors: { primary: '#2563EB', background: '#FFFFFF', text: '#111827' },
  spacing: { sm: 8, md: 16, lg: 24 },
  typography: { title: 24, body: 16 },
};
const sandbox = {
  exports: {},
  require: (name) => {
    if (name === 'react-native') return native;
    if (name === '../../../config/theme') return theme;
    if (name === 'react/jsx-runtime') return require(name);
    throw new Error(`Importación inesperada: ${name}`);
  },
};
vm.runInNewContext(code, sandbox, { filename });
const EstadoCatalogo = sandbox.exports.default;
const content = require('react/jsx-runtime').jsx('Text', { children: 'Listado real' });
function nodes(tree) {
  if (tree == null || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat().flatMap(nodes)];
}
function texts(tree) {
  return nodes(tree)
    .filter((node) => node.type === 'Text')
    .map((node) => node.props.children);
}
function button(tree) {
  return nodes(tree).find((node) => node.type === 'Pressable');
}

test('carga: indicador nativo, mensaje y listado oculto', () => {
  const tree = EstadoCatalogo({ loading: true, items: [{}], children: content });
  assert.ok(nodes(tree).some((node) => node.type === 'ActivityIndicator'));
  assert.ok(texts(tree).includes('Cargando elementos químicos...'));
  assert.ok(!nodes(tree).includes(content));
});
test('errores de texto, Error, objetos y mensajes vacíos', () => {
  for (const error of ['Sin conexión', new Error('Sin conexión'), { message: 'Sin conexión' }]) {
    assert.ok(texts(EstadoCatalogo({ error })).includes('Sin conexión'));
  }
  for (const error of [{}, { message: 4 }, '   ', { message: '' }]) {
    assert.ok(
      texts(EstadoCatalogo({ error })).includes(
        'No se pudieron cargar los elementos químicos. Inténtalo de nuevo.',
      ),
    );
  }
});
test('Reintentar ejecuta una vez el callback sin pasar el evento nativo', () => {
  let calls = 0;
  const tree = EstadoCatalogo({
    error: 'Error',
    onRetry: (...args) => {
      calls += 1;
      assert.equal(args.length, 0);
    },
  });
  assert.equal(button(tree).props.disabled, false);
  button(tree).props.onPress({ nativeEvent: {} });
  assert.equal(calls, 1);
});
test('arreglo vacío muestra el mensaje y oculta children', () => {
  const tree = EstadoCatalogo({ items: [], children: content });
  assert.ok(texts(tree).includes('No hay elementos químicos disponibles'));
  assert.ok(!nodes(tree).includes(content));
});
test('datos disponibles conservan children sin envolver ni duplicar el listado', () => {
  assert.equal(EstadoCatalogo({ items: [{ numeroAtomico: 1 }], children: content }), content);
  assert.equal(EstadoCatalogo({ items: [{}] }), null);
});
test('items ausentes, nulos o de tipo incorrecto son seguros', () => {
  for (const items of [undefined, null, {}, 'Hidrógeno', 3, false, { length: 1 }]) {
    assert.ok(texts(EstadoCatalogo({ items })).includes('No hay elementos químicos disponibles'));
  }
  assert.ok(texts(EstadoCatalogo({})).includes('No hay elementos químicos disponibles'));
});
test('callback ausente o inválido deshabilita el botón de forma accesible', () => {
  for (const onRetry of [undefined, null, true, 'retry', {}]) {
    const retry = button(EstadoCatalogo({ error: 'Error', onRetry }));
    assert.equal(retry.props.disabled, true);
    assert.equal(retry.props.accessibilityState.disabled, true);
    assert.equal(retry.props.onPress, undefined);
  }
});
test('prioridad: cargando > error > vacío > contenido', () => {
  for (const items of [[], [{}]]) {
    assert.ok(
      texts(EstadoCatalogo({ loading: true, error: 'Fallo', items })).includes(
        'Cargando elementos químicos...',
      ),
    );
    assert.ok(texts(EstadoCatalogo({ loading: false, error: 'Fallo', items })).includes('Fallo'));
  }
  assert.equal(
    EstadoCatalogo({ loading: false, error: null, items: [{}], children: content }),
    content,
  );
});
