# RF-Q-02 · Listado del catálogo

Responsable: Randall · Sprint 1 · Base: `origin/development` (`fe38ecf`)

## 1. Alcance

Implementa la pantalla `Catalogo` como listado funcional con `FlatList`, tarjeta por
elemento y callback de selección. No modifica `App.js`, `AuthNavigator`, `index.js`,
ni archivos de Eduardo, Rodrigo o Mateo.

Archivos tocados:

| Archivo                                                | Cambio                                               |
| ------------------------------------------------------ | ---------------------------------------------------- |
| `src/modules/quimica/screens/PlaceholderScreens.jsx`   | Reemplaza solo `CatalogoScreen` por el listado real. |
| `src/modules/quimica/components/ElementoCard.jsx`      | Nuevo. Tarjeta presentacional del elemento.          |
| `src/modules/quimica/data/elementosProvisionales.js`   | Nuevo. Fuente provisional explícita.                 |
| `src/modules/quimica/services/catalogoIntegration.js`  | Nuevo. Helpers puros de integración.                 |
| `src/modules/quimica/docs/RF-Q-02-listado-catalogo.md` | Este documento.                                      |

## 2. Fuente de datos

Q-24 todavía no está fusionada en `development`, así que el listado usa
`ELEMENTOS_PROVISIONALES`, marcado como provisional en código y en pantalla.

El único registro es una copia literal de la respuesta real verificada en Q-23:

```js
{
  id: 1,
  nombre: 'Oxígeno',
  simbolo: 'O',
  numeroAtomico: 8,
  clasificacion: 'No metal',
  descripcion: null,
}
```

No se inventaron elementos ni valores químicos. Cuando Eduardo integre Q-24, basta con
pasar su array como prop `elementos`; no hay que editar la pantalla.

## 3. API de props

```js
<CatalogoScreen
  elementos={elementos}
  consulta={consulta}
  filtrarElementos={filtrarElementos}
  buscador={buscador}
  onConsultaChange={setConsulta}
  EstadoCatalogo={EstadoCatalogo}
  loading={loading}
  error={error}
  onRetry={recargar}
  onSelectElement={abrirFicha}
  navigation={navigation}
/>
```

| Prop               | Tipo                                                          | Default                      | Responsable           | Uso                                                                             |
| ------------------ | ------------------------------------------------------------- | ---------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `elementos`        | `ElementoQuimico[]`                                           | `ELEMENTOS_PROVISIONALES`    | Eduardo / Q-24        | Fuente del listado.                                                             |
| `consulta`         | `string`                                                      | estado interno `''`          | Rodrigo               | Texto controlado por `BuscadorElementos`; se puede controlar desde fuera.       |
| `filtrarElementos` | `(elementos, consulta) => ElementoQuimico[]`                  | `filtrarElementos` (RF-Q-05) | Rodrigo               | Filtra por nombre/símbolo, sin tildes ni mayúsculas.                            |
| `buscador`         | `ReactNode` o `({ consulta, onConsultaChange }) => ReactNode` | `BuscadorElementos`          | Rodrigo               | Se renderiza sobre el listado; por defecto ya es usable desde el inicio.        |
| `onConsultaChange` | `(texto: string) => void`                                     | —                            | Rodrigo               | Se entrega a la forma función de `buscador`.                                    |
| `EstadoCatalogo`   | `React.ComponentType<{loading,error,items,onRetry,children}>` | fallback interno             | Mateo                 | Envuelve la lista sin reescribirla.                                             |
| `loading`          | `boolean`                                                     | `false`                      | Mateo / fuente        | Estado de carga.                                                                |
| `error`            | `string \| Error \| null`                                     | `null`                       | Mateo / fuente        | Error a mostrar.                                                                |
| `onRetry`          | `() => void`                                                  | —                            | Mateo / fuente        | Reintento.                                                                      |
| `onSelectElement`  | `(elemento) => void`                                          | —                            | Eduardo / integración | Tiene prioridad sobre `navigation`.                                             |
| `navigation`       | React Navigation prop                                         | —                            | Hassan                | Si no hay callback, navega a `FichaElemento` con `{ elementoId: elemento.id }`. |

Contrato del elemento usado:

```js
{
  id,                  // number | string, obligatorio
  nombre,              // string, obligatorio
  simbolo,             // string, obligatorio
  numeroAtomico,       // number entero >= 1, obligatorio
  clasificacion,       // string | null, opcional
  descripcion,         // string | null, opcional
}
```

## 4. Decisiones de integración

- Rodrigo: RF-Q-05 ya está en `development`. La pantalla usa por defecto su
  `filtrarElementos` y su `BuscadorElementos`, así que el usuario puede buscar desde el inicio
  sin pasar props. Siguen siendo sobreescribibles para otros proveedores.
- Mateo: pasar `EstadoCatalogo`. Esta pantalla solo entrega `{ loading, error, items,
onRetry, children }`; no duplica su lógica. El fallback interno existe solo para que
  RF-Q-02 sea funcional de forma aislada. Verificado por solo lectura en
  `origin/mateo/RF-Q-03-estados-catalogo`: su componente
  `src/modules/quimica/components/EstadoCatalogo.js` acepta exactamente esas cinco props,
  así que no necesita adaptador. No se modificó ningún archivo de esa rama.
- Eduardo: pasar `elementos` desde Q-24 y `onSelectElement` para abrir la ficha. Si no
  pasa callback, la navegación usa `QUIMICA_ROUTES.fichaElemento` ya publicada por Hassan.
- Hassan: no es necesario tocar navegación; `index.js` ya exporta `CatalogoScreen`.

## 5. Pruebas

Pruebas puras de integración (sin renderer de React Native):

```bash
node src/modules/quimica/services/catalogoIntegration.test.cjs
```

Casos: lista sin filtro, delegación al filtro inyectado, fallback ante resultado inválido,
integración con el filtro real de RF-Q-05 (`oxigeno`, `OXÍGENO`, sin coincidencias), selección
por callback, selección por navegación y selección sin handler.

Verificación adicional ejecutada:

```bash
npx prettier --check <archivos tocados>
npx eslint <archivos tocados>
```

## 6. Estado

- Listado funcional: **sí**, con fuente provisional.
- Búsqueda: **integrada** con RF-Q-05 por defecto y sobreescribible por props.
- Estados: **fallback mínimo**; reemplazable por el componente de Mateo. Se distingue
  “catálogo vacío” (la fuente no trae registros) de “sin coincidencias” (la búsqueda no
  encuentra elementos), incluso cuando se usa `EstadoCatalogo`.
- Ficha: **no implementada**; se abre por callback o ruta existente.
