# RF-Q-05 — Campo y resultados de búsqueda

## Alcance y estado de integración

Base: `development`, commit `ca5abf1`, que ya incluye la [especificación RF-Q-04](../README.md).
Se implementan el filtro puro, sus pruebas unitarias y el campo controlado. **El buscador
todavía no aparece en la aplicación:** el listado RF-Q-02 no está integrado en esta base.
No se reemplaza `CatalogoScreen` ni se copia el listado desde otra rama.

Estado consultado al preparar esta tarea:

| Dependencia                                                           | Estado verificado                                                                       | Consecuencia                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [RF-Q-02, PR #7](https://github.com/ha55an-priv/virtu-quimica/pull/7) | Abierto, sin fusionar. Contrato leído en `3be1ef9`.                                     | La conexión visual queda pendiente de su integración en `development`. |
| [Q-24, PR #2](https://github.com/ha55an-priv/virtu-quimica/pull/2)    | Abierto, sin fusionar. Contrato leído en `8230392`.                                     | La fuente real sigue pendiente en `development`.                       |
| RF-Q-03                                                               | Rama remota `mateo/RF-Q-03-estados-catalogo`, commit `d1c6b8b`, fuera de `development`. | Conservar su componente y conectar los estados cuando se integre.      |

Estas referencias se revisaron en modo de solo lectura. El estado de un PR puede cambiar;
comprobarlo de nuevo antes de integrar. No se incorporan archivos de esas ramas.

## Filtro reutilizable

```js
import { filtrarElementos } from '../services/filtrarElementos';

const visibles = filtrarElementos(elementos, consulta);
```

`elementos` debe ser un arreglo de objetos con `nombre` y `simbolo` como cadenas no vacías;
`consulta` debe ser una cadena. El filtro devuelve un arreglo nuevo y conserva las referencias
y el orden originales. No añade duplicados cuando ambos campos coinciden.

Aplica exactamente las reglas de RF-Q-04: `trim()` únicamente a los extremos de la consulta,
Unicode NFC, minúsculas y sustitución de las cinco vocales con tilde aguda. Conserva `ñ`, `ü`
y espacios interiores. Busca una subcadena literal en nombre **o** símbolo, en cualquier
posición. No concatena campos ni busca por otras propiedades.

- Consulta vacía o solo espacios: todos los registros disponibles.
- Sin coincidencias: arreglo vacío.
- Colección cargada pero vacía: arreglo vacío para cualquier consulta.
- Contrato inválido: lanza `TypeError` con el campo o índice afectado, incluso al borrar la
  consulta o cuando el registro inválido no habría coincidido. No convierte errores en `[]`.

La validación aquí cubre solo la entrada de búsqueda; no sustituye la validación de la fuente
de Q-24 (número atómico, identidad, duplicados de origen y demás propiedades).

### Compatibilidad con Q-24

El PR #2 contiene un objeto JSON con `metadata` y `elementos`. Su servicio
`obtenerElementosQuimicos()` devuelve el arreglo de registros con `nombre` y `simbolo`;
**ese arreglo** es la entrada compatible, no el objeto JSON completo. El servicio también
expone `obtenerErroresCatalogo()`: los errores de fuente deben presentarse mediante RF-Q-03.
No se importa ese servicio aquí porque todavía no existe en `development`.

## Componente controlado

```jsx
import { useState } from 'react';

import BuscadorElementos from '../components/BuscadorElementos';

function CampoDelCatalogo() {
  const [consulta, setConsulta] = useState('');

  return <BuscadorElementos value={consulta} onChangeText={setConsulta} />;
}
```

Este ejemplo explica el uso; no agrega una pantalla de prueba ni conecta todavía el catálogo.
Las dos props son obligatorias: `value` es una cadena y `onChangeText` recibe el nuevo texto.
El componente comunica cada cambio inmediatamente, sin esperar Enter, y permite borrar todo
mediante «Limpiar», que envía `''` y devuelve el foco al campo. No normaliza ni recorta el valor
visible: el filtro se ocupa de la comparación, conservando lo que escribe el usuario.

Usa el placeholder y la etiqueta accesible «Buscar por nombre o símbolo», tipografía del
proyecto, colores de `brandTheme` y un botón con área mínima de 48 unidades.
Referencia de la API: [TextInput de React Native](https://reactnative.dev/docs/textinput).

## Conexión con el listado de RF-Q-02 cuando se integre

El contrato revisado acepta `consulta`, `filtrarElementos`, `buscador` y `onConsultaChange`.
`buscador` puede ser un nodo o una función que recibe `{ consulta, onConsultaChange }`.
Por ello, no se pasa directamente `BuscadorElementos` como función: sus props se llaman
`value` y `onChangeText`. La correspondencia es:

```jsx
<CatalogoScreen
  elementos={elementos}
  consulta={consulta}
  onConsultaChange={setConsulta}
  filtrarElementos={filtrarElementos}
  buscador={({ consulta, onConsultaChange }) => (
    <BuscadorElementos value={consulta} onChangeText={onConsultaChange} />
  )}
  EstadoCatalogo={EstadoCatalogo}
  loading={loading}
  error={error}
  onRetry={onRetry}
/>
```

Aquí `consulta` y `setConsulta` provienen de `useState('')` en el controlador real del catálogo,
`elementos` de una carga válida, y los estados y reintento de su fuente. Mantener los callbacks
existentes de selección y navegación. Este fragmento es una guía de integración futura, no
código ejecutado por la pantalla actual.

Al integrar RF-Q-02, la entrada pública del catálogo que usa la navegación deberá proporcionar
ese estado, el filtro y el campo por defecto. Abrir «Catálogo» desde el inicio normal debe
mostrar el buscador sin configurar props desde una pantalla de prueba. No alcanza con copiar
el fragmento a una vista aislada. Reutilizar el listado existente y mantener su API de props.

### Separar ausencia de coincidencias y estados de la fuente

El PR #7 revisado entrega los resultados filtrados como `items` al componente de estados.
Eso confunde una búsqueda sin coincidencias con un catálogo vacío. Al realizar la integración,
ajustar únicamente esa conexión en el consumidor, sin reescribir `EstadoCatalogo` de RF-Q-03:

1. Entregar a `EstadoCatalogo` la colección original mediante `items={elementos}` y conservar
   sus props `loading`, `error`, `onRetry` y `children`.
2. Ejecutar el filtro después de una carga válida. Mostrar un error de contrato como error
   del catálogo; no silenciarlo con un arreglo vacío ni ejecutar el filtro sobre datos pendientes.
3. Dentro de `children`, si el catálogo original tiene registros pero el resultado filtrado
   está vacío, mostrar **«No se encontraron elementos»**. En otro caso, renderizar el `FlatList`
   existente con los resultados filtrados. Aplicar la misma distinción al fallback del listado
   si RF-Q-03 todavía no está integrado.
4. Mantener el buscador accesible también cuando no hay coincidencias, para cambiar o limpiar
   el texto. Al limpiar, recalcular con `''` y recuperar todos los registros disponibles.

| Situación                                                  | Presentación esperada                                 |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| Carga pendiente                                            | Estado de carga de RF-Q-03.                           |
| Error de fuente o contrato                                 | Error del catálogo y reintento cuando corresponda.    |
| Carga correcta, colección original vacía                   | «No hay elementos químicos disponibles».              |
| Colección original con registros, filtro sin coincidencias | «No se encontraron elementos».                        |
| Consulta vacía                                             | Todos los registros disponibles en su orden original. |

## Verificación y pendientes

Sin instalar dependencias, ejecutar desde la raíz:

```bash
node --test src/modules/quimica/__tests__/filtrarElementos.test.mjs
node node_modules/eslint/bin/eslint.js src/modules/quimica/services/filtrarElementos.js src/modules/quimica/__tests__/filtrarElementos.test.mjs src/modules/quimica/components/BuscadorElementos.jsx
node node_modules/prettier/bin/prettier.cjs --check src/modules/quimica/services/filtrarElementos.js src/modules/quimica/__tests__/filtrarElementos.test.mjs src/modules/quimica/components/BuscadorElementos.jsx src/modules/quimica/docs/RF-Q-05-buscador-elementos.md
npm run lint
git diff development...HEAD --check
```

En PowerShell con scripts deshabilitados, usar `npm.cmd run lint`. Las pruebas importan la
función real; no transforman ni duplican su implementación. Con Node 24 puede aparecer el
aviso `MODULE_TYPELESS_PACKAGE_JSON` por los módulos JavaScript del proyecto; no implica un
fallo de las pruebas ni requiere cambiar la configuración global de módulos.

Las 28 pruebas cubren nombre, símbolo, subcadenas, mayúsculas, tildes y Unicode, espacios,
consulta vacía, borrado progresivo, ausencia de coincidencias, orden, identidad, no duplicación,
colección vacía, comparación literal y rechazo de datos inválidos. El filtro y el componente
pasan lint y formato en sus archivos. El lint global ya fallaba antes de RF-Q-05 por archivos
ajenos a la tarea; no se corrigen ni se reformatean esos archivos aquí.

La comprobación visual en Expo y la integración con los datos reales quedan pendientes de
RF-Q-02, Q-24 y la conexión con RF-Q-03. También queda pendiente validar el conjunto Expo
instalado: la comprobación adicional de transformación JSX no pudo ejecutarse al no resolver
`babel-preset-expo` en este entorno; el análisis de sintaxis JSX sí pasó. No se afirma que
el campo se haya probado en un dispositivo.

Después de integrar, comprobar desde la navegación habitual: escribir un nombre y un símbolo,
cambiar mayúsculas y tildes, introducir una consulta ausente, borrar progresivamente y pulsar
«Limpiar». Confirmar que se distinguen catálogo vacío, carga fallida y búsqueda sin coincidencias,
y que la selección sigue abriendo la ficha existente.
