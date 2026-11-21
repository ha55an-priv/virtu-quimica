# RF-Q-04 — Definir criterios de búsqueda

Especificación del filtrado del catálogo de elementos de Virtu Química. Esta tarjeta define
el comportamiento esperado; la implementación del servicio, el buscador visual y sus pruebas
de integración corresponden a tareas posteriores.

## 1. Estado del catálogo y contrato disponible

Revisión realizada sobre `development`, commit `fe38ecf3d26232f769ef4e6467e0db1bf3c044a8`,
base de `feature/rf-q-04-criterios-busqueda`.

- [screens/PlaceholderScreens.jsx](screens/PlaceholderScreens.jsx) contiene un catálogo y una
  ficha provisionales, sin registros ni carga de elementos.
- `services/` contiene únicamente `.gitkeep`; no existe un servicio de catálogo integrado.
- No se encontraron referencias a Q-24 ni un archivo `elementosQuimicos.json` en los archivos
  versionados de esta base. No se toman cambios de otras ramas como contrato disponible.
- El [README principal](../../../README.md#q-12--navegación-de-química) documenta únicamente
  el paso de `elemento.id` a la ficha como `elementoId` (cadena o número). Esto es un contrato
  de navegación, no una confirmación de la estructura del catálogo.

**La fuente de datos y su contrato real están pendientes de integración.** No se puede
confirmar todavía el contenedor de la colección, los nombres de sus propiedades ni sus
elementos disponibles. Esta especificación define el contrato mínimo requerido para la
búsqueda; su compatibilidad con datos reales deberá verificarse cuando se integre la fuente.

| Campo permitido para buscar | Tipo requerido | Significado |
| --- | --- | --- |
| `nombre` | Cadena no vacía | Nombre del elemento en español, con su ortografía original. |
| `simbolo` | Cadena no vacía | Símbolo químico, con sus mayúsculas y minúsculas originales. |

No se busca por `id`, número atómico, propiedades ni otros campos. No se fija aquí una ruta
JSON ni un endpoint que todavía no existen. Si la fuente finalmente usa otros nombres o un
contenedor, la integración deberá documentar su correspondencia con `nombre` y `simbolo`
antes de implementar el filtro. Un campo ausente o de otro tipo es un problema del contrato,
no debe convertirse silenciosamente en texto ni presentarse como una búsqueda sin resultados.

## 2. Reglas de búsqueda

1. **Entrada:** una consulta de texto y la colección de elementos actualmente disponibles
   después de una carga válida. No se presupone una colección completa de 118 elementos.
2. **Espacios:** aplicar `trim()` a la consulta para quitar espacios en blanco al principio
   y al final, incluidos tabulaciones y saltos de línea. Los espacios interiores se conservan:
   no se eliminan, no se agrupan y no separan términos de búsqueda.
3. **Consulta vacía:** si después de `trim()` queda una cadena vacía, devolver todos los
   elementos actualmente disponibles, en el orden recibido. Esto incluye la entrada inicial
   `''`, una consulta formada solo por espacios y el borrado de una consulta anterior.
4. **Mayúsculas y tildes:** para consulta, `nombre` y `simbolo`, normalizar el texto a Unicode
   NFC, convertirlo a minúsculas y luego sustituir `á`, `é`, `í`, `ó`, `ú` por `a`, `e`, `i`, `o`, `u`.
   Así, `hidrogeno`, `HIDRÓGENO` e `hidrógeno` son equivalentes. NFC también permite comparar
   vocales acentuadas representadas con caracteres combinados. Se conservan `ñ`, `ü`, signos
   y demás caracteres; no se transliteran. Esta decisión facilita buscar sin teclado con tildes.
5. **Coincidencia parcial:** incluir un elemento si la consulta normalizada es una subcadena
   contigua de su `nombre` **o** de su `simbolo` normalizados, en cualquier posición. No basta
   con buscar prefijos. No se concatenan campos ni se exige que ambos coincidan.
6. **Comparación literal:** no hay expresiones regulares, comodines, corrección de errores,
   traducciones ni búsqueda por semejanza. No se exige una longitud mínima para buscar.
7. **Resultados:** conservar el orden y la identidad de los registros de la colección original.
   Un registro que coincida por ambos campos aparece una sola vez. No se prioriza la
   coincidencia exacta de símbolo ni se modifican los nombres y símbolos mostrados.
8. **Sin coincidencias:** devolver una colección vacía. La futura interfaz deberá indicar
   «No se encontraron elementos» y permitir modificar o borrar la consulta. No sustituir
   el resultado por todos los elementos; solo una consulta vacía restablece el listado.

En términos del filtro: después de recortar y normalizar la consulta, se conserva cada
registro cuyo nombre normalizado contiene la consulta o cuyo símbolo normalizado la contiene.
La normalización se usa únicamente para comparar; no altera la fuente.

Una colección cargada correctamente pero vacía produce una colección vacía para cualquier
consulta y debe indicarse como catálogo sin elementos disponibles. Una carga pendiente o
fallida se trata como carga o error del catálogo, no como ausencia de coincidencias.

## 3. Ejemplos y comprobación posterior

**Todavía no hay registros reales para verificar estos ejemplos.** Las filas con elementos
son casos condicionales: se aplican únicamente si la fuente integrada contiene los valores
indicados. No representan datos ya disponibles ni obligan a agregarlos. Las inclusiones
indicadas no son listas exhaustivas: puede haber otros elementos que también coincidan.

| Consulta literal | Precondición en el catálogo integrado | Resultado esperado |
| --- | --- | --- |
| `hid` | `nombre: 'Hidrógeno'` | Incluye ese registro por coincidencia parcial del nombre. |
| `na` | `simbolo: 'Na'` | Incluye ese registro por símbolo; también incluye otros nombres o símbolos que contengan `na`. |
| `CAR` | `nombre: 'Carbono'` | Incluye ese registro, sin distinguir mayúsculas. |
| `  CAR  ` | `nombre: 'Carbono'` | Mismo resultado que `CAR`, por recorte de espacios exteriores. |
| `bon` | `nombre: 'Carbono'` | Incluye ese registro por una subcadena interior. |
| `hidrogeno` / `HIDRÓGENO` | `nombre: 'Hidrógeno'` | Ambas consultas incluyen ese registro y producen el mismo resultado. |
| `ca r` | `nombre: 'Carbono', simbolo: 'C'` | No incluye ese registro; el espacio interior es literal. |
| `''` (cadena vacía) | Colección cargada correctamente | Devuelve todos los elementos disponibles, conservando el orden. |
| `'   '` (solo espacios) | Colección cargada correctamente | Mismo resultado que una cadena vacía. |
| Una cadena comprobada como ausente de ambos campos de todos los registros | Colección cargada correctamente | Devuelve una colección vacía y corresponde indicar que no hay coincidencias. |

Cuando se integre la fuente, registrar su ruta o servicio, el contenedor de la colección,
los tipos y los nombres reales de los campos. Confirmar si existen Hidrógeno, Na y Carbono;
si faltan, adaptar los ejemplos a registros existentes sin inventar entradas del catálogo.
Comprobar también el vaciado de la consulta, la conservación del orden y la ausencia de
duplicación cuando un registro coincide por ambos campos.

## 4. Cobertura de la tarjeta y dependencias

| Actividad de RF-Q-04 | Definición |
| --- | --- |
| Definir búsqueda por nombre y símbolo | Secciones 1 y 2: campos `nombre` y `simbolo`, unidos con OR. |
| Establecer coincidencias parciales y sin distinción de mayúsculas | Sección 2: subcadena contigua y normalización común. |
| Definir espacios y entradas vacías | Sección 2: `trim()`, espacios interiores literales y restauración del listado. |
| Documentar ejemplos y comportamiento esperado | Sección 3, más los estados sin coincidencias y catálogo vacío de la sección 2. |

- **Especificación clara de búsqueda:** cubierta por este documento.
- **Compatibilidad con la fuente elegida:** pendiente de validación; esta base no incluye
  una fuente de catálogo ni un contrato de `nombre` y `simbolo` que permita confirmarla.
- **Dependencia:** integración de la fuente de catálogo y confirmación de su contrato por
  la tarea responsable (Q-24, si el equipo confirma que le corresponde). No se presupone
  su estado ni se incorporan cambios pendientes de otros compañeros.

RF-Q-04 deja definidos los criterios. La comprobación con datos reales y la implementación
posterior del buscador requieren resolver la dependencia anterior.

## 5. RF-Q-05 — Implementación del buscador

El filtro, sus pruebas unitarias y el campo controlado están disponibles. La conexión visual
queda pendiente de integrar RF-Q-02; el catálogo continúa siendo provisional en esta base.
Consultar la [guía de uso, contratos y dependencias de RF-Q-05](docs/RF-Q-05-buscador-elementos.md).
El estado de la sección 1 corresponde a la revisión original de RF-Q-04; la guía enlazada
registra la revisión posterior de las tareas de catálogo, sin dar sus cambios por integrados.
