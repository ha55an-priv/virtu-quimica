/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const babel = require('@babel/core');

// Ejecuta el componente real con JSX transformado y primitivas nativas aisladas.
// No sustituye una prueba visual en Android/iOS.
function cargarModulo(relativePath, dependencies) {
  const filename = path.join(__dirname, relativePath);
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    babelrc: false,
    configFile: false,
    plugins: [
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
      '@babel/plugin-transform-modules-commonjs',
    ],
  });
  const sandbox = {
    exports: {},
    require: (name) => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === 'react/jsx-runtime') return require(name);
      throw new Error(`Importación inesperada: ${name}`);
    },
  };
  vm.runInNewContext(code, sandbox, { filename });
  return sandbox.exports;
}

const native = {
  ActivityIndicator: 'ActivityIndicator',
  FlatList: 'FlatList',
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
const EstadoCatalogo = cargarModulo('../components/EstadoCatalogo.js', {
  'react-native': native,
  '../../../config/theme': theme,
}).default;
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

const { QUIMICA_ROUTES } = require('../routes.js');
const { CatalogoScreen } = cargarModulo('../screens/PlaceholderScreens.jsx', {
  react: { useState: (initial) => [initial, () => {}], useMemo: (calculate) => calculate() },
  'react-native': native,
  'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
  '../../../config/brandTheme': { brandColors: {}, brandRadius: {} },
  '../../../config/theme': theme,
  '../../../shared/components/EducationLayout': {
    EducationHero: 'EducationHero',
    EducationMessage: 'EducationMessage',
  },
  '../components/BuscadorElementos': 'BuscadorElementos',
  '../components/ElementoCard': 'ElementoCard',
  '../components/ChemistryIcon': 'ChemistryIcon',
  '../components/EstadoCatalogo': EstadoCatalogo,
  '../data/elementosProvisionales': require('../data/elementosProvisionales.js'),
  '../routes': { QUIMICA_ROUTES },
  '../services/catalogoIntegration': require('../services/catalogoIntegration.js'),
  '../services/filtrarElementos': require('../services/filtrarElementos.js'),
});

function estadoDePantalla(screen) {
  const wrapper = nodes(screen).find((node) => node.type === EstadoCatalogo);
  assert.ok(wrapper, 'La pantalla usa EstadoCatalogo por defecto');
  return wrapper.type(wrapper.props);
}

test('catálogo vacío usa RF-Q-03 y conserva el buscador', () => {
  const screen = CatalogoScreen({ elementos: [], consulta: 'O' });
  assert.ok(nodes(screen).some((node) => node.type === 'BuscadorElementos'));
  assert.deepEqual(texts(estadoDePantalla(screen)), ['No hay elementos químicos disponibles']);
});

test('RF-Q-05 conserva el listado, el mensaje sin coincidencias y la selección', () => {
  const calls = [];
  const navigation = { navigate: (...args) => calls.push(args) };
  const lista = estadoDePantalla(CatalogoScreen({ consulta: 'oxigeno', navigation }));
  assert.equal(lista.type, 'FlatList');
  assert.equal(lista.props.data.length, 1);
  const [item] = lista.props.data;
  const card = lista.props.renderItem({ item });
  assert.equal(card.type, 'ElementoCard');
  card.props.onPress();
  assert.equal(calls.length, 1);
  const [ruta, parametros] = calls[0];
  assert.equal(ruta, QUIMICA_ROUTES.fichaElemento);
  assert.equal(parametros.elementoId, item.id);

  const sinCoincidencias = estadoDePantalla(CatalogoScreen({ consulta: 'zz' }));
  assert.equal(sinCoincidencias.type, 'FlatList');
  assert.equal(sinCoincidencias.props.data.length, 0);
  const mensaje = sinCoincidencias.props.ListEmptyComponent;
  assert.equal(mensaje.type().props.title, 'No se encontraron elementos');
});

test('la pantalla delega carga, error y reintento al componente RF-Q-03', () => {
  let intentos = 0;
  const props = { elementos: [], error: 'Fuente indisponible', onRetry: () => intentos++ };
  const carga = estadoDePantalla(CatalogoScreen({ ...props, loading: true }));
  assert.ok(nodes(carga).some((node) => node.type === 'ActivityIndicator'));
  assert.equal(button(carga), undefined);

  const error = estadoDePantalla(CatalogoScreen(props));
  assert.ok(texts(error).includes(props.error));
  button(error).props.onPress();
  assert.equal(intentos, 1);
});
