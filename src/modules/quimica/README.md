# Módulo de Química (`src/modules/quimica`)

Módulo exclusivo de la materia **Química** para la aplicación **Virtu Química** (`APP_SLUG = 'quimica'`)[cite: 3]. La guía general de módulos está en [src/modules/README.md](../README.md) y la del proyecto en el [README principal](../../../README.md).

## Estructura del módulo

- `index.js`: punto de entrada del módulo (exporta `QuimicaHomeScreen` y utilidades compartidas).
- `data/`: datos locales versionados y *fixtures* de prueba del catálogo químico.
  - `elementosQuimicos.json`: fuente local versionada con metadatos y elementos validados.
  - `fixtures/elementosFicticios.js`: objetos explícitamente ficticios para pruebas de UI/contrato (nunca incluidos en el catálogo real).
- `services/`: lógica de validación y acceso a datos del módulo.
  - `validacionElementos.js`: normalización y validación pura del esquema de elementos.
  - `catalogoElementosService.js`: fuente única síncrona del catálogo químico para el equipo.
- `screens/`: pantallas del módulo (inicio, catálogo, ficha de elemento, unidades/lecciones)[cite: 3].
- `components/`: componentes reutilizables propios de Química[cite: 1].
- `__tests__/`: pruebas unitarias ejecutables con Node (`node --test`).

---

## Fuente de datos del catálogo químico (Q-24)

### Decisión

Archivo local JSON versionado (`data/elementosQuimicos.json`), consumido únicamente a través de `services/catalogoElementosService.js`. No se utiliza ningún endpoint remoto ni se crea backend nuevo[cite: 3, 5].

**Justificación:**

- `RF-Q-01` establece no asumir que `GET /glosarios/quimica` contiene los 118 elementos de la tabla periódica, y `Q-19` / `RF-Q-08` mantienen el glosario académico como una funcionalidad independiente[cite: 2, 3, 5].
- No existe evidencia verificada de que el endpoint del glosario entregue número atómico ni clasificación.
- En la auditoría de API (`Q-23`), los endpoints protegidos requieren autenticación JWT y la base de datos del backend presentó indisponibilidad al intentar autenticar, por lo que no se pueden capturar respuestas `200` reales.

**Alcance actual:** 5 elementos validados (`H`, `He`, `C`, `O`, `Na`), con `metadata.completo = false`[cite: 5]. No se afirma que existan los 118 elementos; una prueba automatizada impide marcar `completo: true` mientras no existan 118 elementos con números atómicos contiguos `1..118`[cite: 3, 5].

---

### Esquema interno (`ElementoQuimico` — compatible con RF-Q-01)

| Campo | Tipo | Requerido | Notas |
| :--- | :--- | :--- | :--- |
| `id` | `string \| number` | Sí | En el catálogo real: `elem-` + `Z` a 3 dígitos (ej. `elem-006`). Tratar como identificador opaco[cite: 5]. |
| `nombre` | `string` | Sí | Nombre del elemento en español[cite: 5]. |
| `simbolo` | `string` | Sí | Símbolo químico canónico (`^[A-Z][a-z]{0,2}$` en datos reales)[cite: 5]. |
| `numeroAtomico` | `number` | Sí | Entero positivo mayor que `0`, sin coerción (`1..118` en datos reales)[cite: 5]. |
| `clasificacion` | `string` | No | Si falta, la clave se omite; la UI tolera su ausencia[cite: 5]. |
| `descripcion` | `string` | No | Si falta, la clave se omite; no se inventa contenido[cite: 3, 5]. |
| `ejemploOpcional` | `string` | No | Campo opcional para fórmula o compuesto ilustrativo cuando exista[cite: 2, 5]. |

---

### Procedencia por campo

| Campo | Origen |
| :--- | :--- |
| `simbolo`, `numeroAtomico` | *IUPAC Periodic Table of the Elements* — https://iupac.org/what-we-do/periodic-table-of-elements/ (versión `2022-05-04`)[cite: 5] |
| `nombre` | Nombre en español adoptado por el equipo (la tabla IUPAC consultada publica los nombres en inglés)[cite: 5] |
| `clasificacion` | Asignación del equipo según los grupos de la tabla periódica convencional (no provista por la tabla IUPAC consultada)[cite: 5] |
| `descripcion`, `ejemploOpcional` | Redacción propia del equipo[cite: 5] |

**Estado de verificación:** `metadata.verificacion.estado = "pendiente-contraste-manual"`[cite: 5]. Contrastar cada elemento con la tabla IUPAC y completar `verificadoPor` y `fechaVerificacion` antes de cerrar `Q-24`[cite: 5].

---

### Comparación con el glosario (`GET /glosarios/quimica`)

| Campo del catálogo | ¿Lo entrega el glosario? |
| :--- | :--- |
| `nombre`, `simbolo`, `numeroAtomico`, `clasificacion`, `descripcion` | No confirmado (sin respuesta `200` autenticada documentada en `Q-23`)[cite: 5]. |
| *(Referencia)* | `Q-19` indica que el glosario consulta términos y definiciones; sus nombres de campo reales siguen pendientes de verificación[cite: 2, 5]. |

Si tras revalidar la API autenticada en `Q-23` el glosario entregara estos campos, se evaluará un adaptador opcional sin mezclar ni reemplazar la fuente local validada[cite: 5].

---

### Validaciones automatizadas

Ejecutar las pruebas unitarias del catálogo con Node (sin dependencias externas)[cite: 5]:

```bash
node --test src/modules/quimica/__tests__/catalogoElementos.test.mjs