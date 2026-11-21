# Q-24 + RF-Q-08 · Fuente de datos del catálogo e integración con listado y ficha

Responsable: Eduardo · Sprint 1 · Base: `origin/development` (`f9b5cf1`)

## 1. Decisión de fuente

El catálogo de elementos usa **un archivo local JSON versionado**:
`src/modules/quimica/data/elementosQuimicos.json`, leído solo a través de
`services/catalogoElementosService.js`. No se consume el glosario remoto ni se crea backend.

**Por qué (evidencia de Q-23, `docs/Q-23-RF-Q-01-contrato-api-catalogo.md`):**

- `GET /glosarios/quimica` devolvió **1 solo elemento** (Oxígeno). No sostiene un catálogo.
- El registro del glosario **no trae `descripcion`**. Trae `formulaEjemplo`, que no equivale a una descripción.
- El backend no busca por número atómico y no tiene Hidrógeno (`?q=hidrogeno` → 0 resultados).

**Alcance actual:** subconjunto inicial (`completo = false`).
**No representa los 118 elementos.** Una prueba impide marcar `completo: true` sin comprobarlo.

## 2. Qué ofrece el glosario frente al catálogo local

| Campo del catálogo | Glosario `GET /glosarios/quimica` (Q-23) | Catálogo local (Q-24) |
| ------------------ | ---------------------------------------- | --------------------- |
| `nombre`           | Sí (`nombre`, `elementoQuimico`)         | Sí                    |
| `simbolo`          | Sí                                       | Sí                    |
| `numeroAtomico`    | Sí                                       | Sí                    |
| `clasificacion`    | Sí                                       | Sí                    |
| `descripcion`      | **No**                                   | Sí (redacción propia) |
| `ejemploOpcional`  | Equivale a `formulaEjemplo` (no mapeado) | Opcional              |
| Elementos totales  | 1 verificado                             | Subconjunto local     |

**Coincidencia con la fuente original:** el único elemento común, Oxígeno, coincide en
`nombre`, `simbolo`, `numeroAtomico` (8) y `clasificacion` ("No metal"). Lo verifica la prueba
`integracionCatalogo.test.mjs`, que usa una copia literal de la respuesta real de Q-23.

## 3. Esquema y procedencia por campo

Contrato interno acordado con Randall (RF-Q-01). `id` es `elem-` + Z con 3 dígitos (string).

| Campo                            | Origen                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `simbolo`, `numeroAtomico`       | IUPAC Periodic Table of the Elements, https://iupac.org/what-we-do/periodic-table-of-elements/ (versión 2022-05-04) |
| `nombre`                         | Nombre en español adoptado por el equipo (la tabla IUPAC consultada usa nombres en inglés)                      |
| `clasificacion`                  | Asignación del equipo según los grupos de la tabla periódica convencional; no la provee la tabla IUPAC consultada |
| `descripcion`, `ejemploOpcional` | Redacción propia del equipo                                                                                     |

**Verificación pendiente:** `metadata.verificacion.estado = "pendiente-contraste-manual"`. Nombre,
símbolo y número atómico aún deben contrastarse con la tabla IUPAC y registrar
`verificadoPor` y `fechaVerificacion`. Hasta entonces los datos **no deben llamarse "verificados"**.

## 4. Integración (RF-Q-08)[cite: 6]

elementosQuimicos.json -> catalogoElementosService -> CatalogoConFichaScreen -> CatalogoScreen[cite: 6]
                                  ^                                              | navigate('FichaElemento', { elementoId })[cite: 6]
                                  +---------------- FichaElementoScreen <--------+[cite: 6]

- `CatalogoConFichaScreen` solo alimenta `CatalogoScreen` con `obtenerElementosQuimicos()`. Se
  exporta desde `index.js` con el nombre `CatalogoScreen`, por lo que `AppNavigator` no cambia.[cite: 6]
- La selección la resuelve `notificarSeleccion` (RF-Q-02): envía solo `{ elementoId }`.[cite: 6]
- La ficha (RF-Q-07) vuelve a leer ese id en el **mismo servicio**. No se pasa el objeto por
  navegación, así que listado y ficha no pueden divergir.[cite: 6]
- Los datos provisionales (`elementosProvisionales.js`, `id: 1` de la API) quedan sin uso. Su `id`
  no existe en el catálogo local. Pendiente de borrar, coordinando con Randall.[cite: 6]

## 5. Decisiones que Q-23 dejó pendientes[cite: 6]

1. **Fuente canónica y `descripcion`:** el JSON local es la fuente canónica y sí provee `descripcion`.[cite: 6]
2. **`id` mixto:** el catálogo usa solo ids string locales (`elem-NNN`). El `id` numérico del
   glosario no se usa en la navegación. Si algún día se combinan fuentes, la clave de cruce debe
   ser `numeroAtomico` o `simbolo`, no `id`.[cite: 6]
3. **`formulaEjemplo`:** no se mapea. Si se integra el glosario, correspondería a `ejemploOpcional`.[cite: 6]
4. **Mezcla de fuentes:** no se mezclan. El glosario académico sigue siendo independiente.[cite: 6]

## 6. Errores y campos faltantes[cite: 6]

- Elementos sin `clasificacion`, `descripcion` o `ejemploOpcional`: la clave se omite y la ficha
  muestra un aviso o no muestra el bloque, sin error.[cite: 6]
- `id` inexistente: la ficha muestra "Elemento no encontrado" sin lanzar excepciones.[cite: 6]
- Fuente local con errores y sin elementos válidos: el catálogo muestra el estado de error.
  Con errores parciales, `console.warn` en desarrollo y se listan los elementos válidos.[cite: 6]
- **Incompatibilidad conocida:** `obtenerErroresElemento` (elementoContract) exige `texto o null` en
  los opcionales. Un elemento que omite `clasificacion` o `descripcion` no la cumple. Pendiente
  coordinar con Randall.[cite: 6]

## 7. Pruebas[cite: 6]

node --test src/modules/quimica/__tests__/catalogoElementos.test.mjs[cite: 6]
node --import ./src/modules/quimica/__tests__/registrarJsonLoader.mjs --test src/modules/quimica/__tests__/integracionCatalogo.test.mjs[cite: 6]

`registrarJsonLoader.mjs` es solo para Node (Metro acepta imports de `.json` y sin extensión, Node no).[cite: 6]
No se ejecutó prueba en dispositivo/emulador Android en esta etapa.[cite: 6]