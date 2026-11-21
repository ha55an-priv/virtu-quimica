# Q-23 + RF-Q-01 · Auditoría de API y contrato del catálogo

Responsable: Randall · Sprint 1 · Base: `origin/development` (`fe38ecf`)

## 1. Alcance y método

Se inspeccionaron `src/config/apiConfig.js`, `src/shared/services/httpClient.js`,
`src/shared/services/authService.js`, `package.json` y el árbol de `src/modules/quimica`.
La URL configurada en el proyecto coincide con la documentada por el backend:

```js
// src/config/apiConfig.js
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'https://backend-virtu.onrender.com/api';
```

No se creó backend, tablas ni endpoints nuevos. No se subieron credenciales: las cuentas
de prueba se tomaron en memoria desde la descripción de Swagger y se redactaron en toda
la evidencia guardada.

Fuentes consultadas:

- Swagger UI: `https://backend-virtu.onrender.com/docs` → `HTTP 200`.
- Especificación embebida: `https://backend-virtu.onrender.com/docs/swagger-ui-init.js`
  (`openapi 3.0.3`, `Virtu API 1.2.0`, 32 paths). No existe `/openapi.json` (`HTTP 404`).
- Llamadas reales con `curl`/`fetch` al servidor de Render. Primera respuesta del
  servidor: `Sat, 21 Nov 2026 00:49:37 GMT`.

> Nota de reproducibilidad: las primeras peticiones hechas con el cliente web devolvieron
> `503` (arranque frío de Render). Al repetir con `curl` el servicio respondió `200`. La
> evidencia de abajo corresponde a esas respuestas reales, no a una simulación.

## 2. Matriz de endpoints

| Endpoint                                 | Método | Parámetros                                            | Auth                 | Documentado | Respuesta real | Observación                                                                                                                      |
| ---------------------------------------- | ------ | ----------------------------------------------------- | -------------------- | ----------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/auth/login`                            | POST   | body `{ username, password }`                         | No                   | Sí          | `200`          | Envelope `{ status, message, data: { token, usuario } }`. Token JWT redactado.                                                   |
| `/auth/me`                               | GET    | —                                                     | Sí (Bearer)          | Sí          | `200`          | Devuelve `{ status, data: <usuario> }`. Con JWT inválido responde `403`, aunque Swagger documenta `401`.                         |
| `/contenidos/{slug}`                     | GET    | path `slug=quimica`                                   | Sí (Bearer)          | Sí          | `200`          | Sí hay contenido de Química: id `4`, 1 unidad, 1 lección. El ejemplo de Swagger usa Historia (id `6`), no Química.               |
| `/lecciones/{id}`                        | GET    | path `id=4` (id real tomado de `/contenidos/quimica`) | Sí (Bearer)          | Sí          | `200`          | Detalle con `definicion`, `ejemplo`, `unidad`, `tieneCuestionario: false`, `cuestionarioId: null`, `tiempoLimiteSegundos: null`. |
| `/glosarios/{materia}`                   | GET    | path `materia=quimica`, query opcional `q`            | Sí (Bearer)          | Sí          | `200`          | Devuelve fichas de elementos. Sin `q`: 1 resultado. El ejemplo de Swagger es de Historia, no de Química.                         |
| `/glosarios/quimica?q=hidrogeno`         | GET    | `q=hidrogeno`                                         | Sí (Bearer)          | Sí          | `200`          | `totalResultados: 0`, `mensaje: "No se encontraron coincidencias"`, `data: []`. No existe Hidrógeno en el backend.               |
| `/api`                                   | GET    | —                                                     | No                   | No          | `404`          | No es un endpoint; solo es el prefijo base.                                                                                      |
| `/openapi.json`                          | GET    | —                                                     | No                   | No          | `404`          | El spec va embebido en `/docs/swagger-ui-init.js`.                                                                               |
| `/contenidos/quimica` sin token          | GET    | —                                                     | No                   | Sí          | `401`          | `{ "error": "No autorizado", "message": "Token de autenticación no proporcionado" }`.                                            |
| `/contenidos/quimica` con token inválido | GET    | —                                                     | Sí (Bearer inválido) | Sí          | `403`          | `{ "error": "Token inválido", "message": "El token proporcionado no es válido" }`.                                               |

### 2.1 Evidencia real (JSON)

`POST /auth/login` → `200` (token y usuario de prueba redactados):

```json
{
  "status": "success",
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "<JWT_REDACTADO>",
    "usuario": {
      "id": 2,
      "username": "<USUARIO_PRUEBA>",
      "nombreCompleto": "Sofía Valenzuela",
      "rol": "ESTUDIANTE",
      "colegio": { "id": 1, "nombre": "Colegio Virtu Central" },
      "curso": { "id": 1, "nombre": "4to Medio A" }
    }
  }
}
```

`GET /contenidos/quimica` → `200`:

```json
{
  "status": "success",
  "data": {
    "id": 4,
    "nombre": "Química",
    "slug": "quimica",
    "resumen": "Exploración de la estructura atómica, enlaces moleculares, estequiometría y reacciones químicas.",
    "estaHabilitado": true,
    "unidades": [
      {
        "id": 4,
        "titulo": "Unidad 1: Estructura Atómica y Enlaces",
        "descripcion": null,
        "orden": 1,
        "estadoUnidad": "PENDIENTE",
        "totalLecciones": 1,
        "lecciones": [
          {
            "id": 4,
            "titulo": "Enlaces Covalentes e Iónicos",
            "orden": 1,
            "tieneCuestionario": false,
            "cuestionarioId": null,
            "estado": "PENDIENTE"
          }
        ]
      }
    ]
  }
}
```

`GET /lecciones/4` → `200`:

```json
{
  "status": "success",
  "data": {
    "id": 4,
    "titulo": "Enlaces Covalentes e Iónicos",
    "definicion": "Los enlaces químicos son fuerzas que mantienen unidos los átomos. El enlace iónico implica la transferencia completa de electrones, mientras que el covalente se basa en compartir electrones.",
    "ejemplo": "El cloruro de sodio (sal común, NaCl) es un enlace iónico, mientras que la molécula de agua (H2O) está unida mediante enlaces covalentes.",
    "orden": 1,
    "unidad": {
      "id": 4,
      "titulo": "Unidad 1: Estructura Atómica y Enlaces",
      "materia": "Química",
      "materiaSlug": "quimica"
    },
    "tieneCuestionario": false,
    "cuestionarioId": null,
    "tiempoLimiteSegundos": null,
    "estadoEstudiante": "PENDIENTE"
  }
}
```

`GET /glosarios/quimica` (sin query) → `200`:

```json
{
  "status": "success",
  "materia": "Química",
  "slug": "quimica",
  "totalResultados": 1,
  "data": [
    {
      "id": 1,
      "contenidoId": 4,
      "elementoQuimico": "Oxígeno",
      "nombre": "Oxígeno",
      "simbolo": "O",
      "numeroAtomico": 8,
      "clasificacion": "No metal",
      "formulaEjemplo": "H2O"
    }
  ]
}
```

`GET /glosarios/quimica?q=hidrogeno` → `200`:

```json
{
  "status": "success",
  "materia": "Química",
  "slug": "quimica",
  "totalResultados": 0,
  "mensaje": "No se encontraron coincidencias",
  "data": []
}
```

Comportamiento real de `?q=` sobre el único registro existente:

| Query       | `totalResultados` | Observación                                      |
| ----------- | ----------------: | ------------------------------------------------ |
| `hidrogeno` |                 0 | No hay registro de Hidrógeno. Aparece `mensaje`. |
| `oxigeno`   |                 1 | Coincide aunque se omita la tilde (`Oxígeno`).   |
| `O`         |                 1 | Busca también por `simbolo`.                     |
| `8`         |                 0 | El número atómico **no** se busca en el backend. |

## 3. Datos realmente disponibles para Química

- Contenidos: 1 unidad y 1 lección (`Enlaces Covalentes e Iónicos`), sin cuestionario.
- Glosario: **1** elemento químico (`Oxígeno`). No es la tabla periódica completa.
- El registro del glosario **no trae `descripcion`**. Trae `formulaEjemplo`, que no es
  equivalente a una descripción química y no debe usarse como tal.
- Riesgos: no asumir 118 elementos, no asumir Hidrógeno disponible, no inventar
  descripciones y no tratar `?q=` como buscador numérico.

## 4. Contrato interno del frontend

Nombre canónico: `ElementoQuimico`. Implementado en
[`../services/elementoContract.js`](../services/elementoContract.js).

| Campo           | Tipo                | Obligatorio | Origen real / decisión                                          |
| --------------- | ------------------- | ----------- | --------------------------------------------------------------- |
| `id`            | `number \| string`  | Sí          | `glosario.id`. Se conserva el tipo que entregue la fuente.      |
| `nombre`        | `string`            | Sí          | `glosario.nombre`, con fallback a `glosario.elementoQuimico`.   |
| `simbolo`       | `string`            | Sí          | `glosario.simbolo`.                                             |
| `numeroAtomico` | `number` entero ≥ 1 | Sí          | `glosario.numeroAtomico`.                                       |
| `clasificacion` | `string \| null`    | No          | `glosario.clasificacion`. Si falta, `null`.                     |
| `descripcion`   | `string \| null`    | No          | La API no la provee. Valor `null` hasta que Q-24 defina fuente. |

Campos del API que quedan fuera del contrato canónico, a la espera de decisión:
`contenidoId`, `elementoQuimico` (usado solo como fallback de `nombre`) y `formulaEjemplo`.

### 4.1 Ejemplo ficticio

```js
// FICTICIO: ilustra la forma del objeto. NO es un dato del backend ni de Q-24.
const ELEMENTO_DEMO = {
  id: 'demo-999',
  nombre: 'ElementoDemostracion',
  simbolo: 'Xd',
  numeroAtomico: 999,
  clasificacion: 'Ejemplo de contrato',
  descripcion: 'Solo para probar renderizado; no proviene de ninguna fuente real.',
};
```

### 4.2 Normalización desde el glosario real

`normalizarElementoDesdeGlosario(registro)` convierte un registro de
`GET /glosarios/quimica` al contrato canónico y devuelve `null` si faltan campos
obligatorios. Con el registro real de Oxígeno produce:

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

`formulaEjemplo: 'H2O'` se descarta deliberadamente en la normalización para no
confundirlo con `descripcion`.

## 5. Decisiones pendientes con el equipo

1. **Eduardo (Q-24):** confirmar si la fuente local JSON será la fuente canónica del
   catálogo y si ella sí provee `descripcion`. El glosario remoto no la provee.
2. **Rodrigo (RF-Q-04/RF-Q-05):** confirmar que el filtro actuará sobre `nombre` y
   `simbolo` del contrato canónico. El backend no busca por `numeroAtomico`; si se quiere
   búsqueda local por número, debe decidirse explícitamente.
3. Definir si `formulaEjemplo` se incorpora como campo opcional de extensión. Hoy no
   forma parte del contrato para no inventar semántica.
4. Definir el manejo de `id` mixto (`number` remoto / `string` local) en la navegación
   hacia `FichaElemento` (`route.params.elementoId` ya acepta cadena o número).
5. Definir si el catálogo consume el glosario remoto, el JSON local de Q-24, o una
   combinación normalizada. No mezclar formats sin pasar por `normalizarElementoDesdeGlosario`.

## 6. Bloqueo

**Sin bloqueo para la auditoría.** El backend respondió y se obtuvo JSON real. El único
bloqueo funcional relevante es de datos: el glosario remoto contiene un solo elemento y
sin descripción, por lo que no puede sostener por sí solo un catálogo de tabla periódica.

## 7. Reproducción (sin credenciales en el repositorio)

```bash
API=https://backend-virtu.onrender.com/api
# Exporta VIRTU_USER y VIRTU_PASS desde las cuentas de prueba publicadas en /docs.
TOKEN=$(curl -sS -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$VIRTU_USER\",\"password\":\"$VIRTU_PASS\"}" \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data.token")

curl -sS "$API/contenidos/quimica" -H "Authorization: Bearer $TOKEN"
curl -sS "$API/lecciones/4" -H "Authorization: Bearer $TOKEN"
curl -sS "$API/glosarios/quimica" -H "Authorization: Bearer $TOKEN"
curl -sS "$API/glosarios/quimica?q=oxigeno" -H "Authorization: Bearer $TOKEN"
```

## 8. Pruebas versionadas del contrato

```bash
node src/modules/quimica/services/elementoContract.test.cjs
```

Cubre: normalización del registro real de Oxígeno, ejemplo ficticio, rechazo de registros
incompletos, errores de validación y metadatos de obligatoriedad. No requiere dependencias
nuevas ni modifica `package.json`.
