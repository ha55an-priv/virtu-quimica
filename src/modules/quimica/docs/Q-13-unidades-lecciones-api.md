# Q-13 · Unidades y lecciones desde API

Responsable: Randall · Rama: `feature/q-13-unidades-lecciones-api` · Base: `origin/development` (`fe38ecf`)

## 1. Alcance

Implementa el listado de unidades/lecciones y el detalle de lección usando el contrato real
documentado en Q-23 y el `httpClient` central del proyecto. No implementa progreso ni
cuestionarios (Sprint 2). No modifica `App.js`, `AuthNavigator`, `routes.js` ni archivos de
compañeros.

| Archivo                                                   | Cambio                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/modules/quimica/services/contenidoMappers.js`        | Nuevo. Mapeos puros de la forma real de la API.                              |
| `src/modules/quimica/services/contenidosService.js`       | Nuevo. `GET /contenidos/:slug` y `GET /lecciones/:id` vía `httpClient`.      |
| `src/modules/quimica/services/contenidoMappers.test.cjs`  | Nuevo. 6 pruebas puras con payloads reales.                                  |
| `src/modules/quimica/screens/UnidadesLeccionesScreen.jsx` | Nuevo. Listado con loading, error, vacío y selección.                        |
| `src/modules/quimica/screens/LeccionDetalleScreen.jsx`    | Nuevo. Detalle con loading, error y vacío real.                              |
| `src/modules/quimica/index.js`                            | Exporta la nueva pantalla en lugar del placeholder.                          |
| `scripts/verificar-api-q13.cjs`                           | Nuevo. Prueba de integración con backend real, sin credenciales versionadas. |
| `src/modules/quimica/docs/Q-13-unidades-lecciones-api.md` | Este documento.                                                              |

## 2. Evidencia real de la API

Verificada el **2026-11-20** contra `https://backend-virtu.onrender.com/api`:

- Swagger UI `/docs` → `200`; spec embebido en `/docs/swagger-ui-init.js` (`openapi 3.0.3`, 32 paths).
- No existe `/openapi.json`.
- `POST /auth/login` → `200` (cuenta de prueba tomada del propio Swagger; credenciales no impresas).
- `GET /contenidos/quimica` → `200`.
- `GET /lecciones/4` → `200` (id derivado de la respuesta real, no inventado).
- `GET /lecciones/999999` → `404` con `{ "error": "Error", "message": "Lección no encontrada" }`.
- `GET /contenidos/no-existe-q13` → `404` con `{ "error": "Error", "message": "Contenido académico no encontrado" }`.
- Sin token → `401` con `{ "error": "No autorizado", "message": "Token de autenticación no proporcionado" }`.

Respuesta real de `GET /contenidos/quimica` (id `4`):

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

Respuesta real de `GET /lecciones/4` (campos de texto completos; aquí resumidos para no
repetir el documento, el mapeo los conserva íntegros):

```json
{
  "status": "success",
  "data": {
    "id": 4,
    "titulo": "Enlaces Covalentes e Iónicos",
    "definicion": "Los enlaces químicos son fuerzas que mantienen unidos los átomos…",
    "ejemplo": "El cloruro de sodio (sal común, NaCl) es un enlace iónico…",
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

### Resultado

**No hay bloqueo del backend**: Química tiene 1 unidad y 1 lección consultables. El estado
vacío quedó implementado de todos modos para el caso de que el backend responda `200` con
`unidades: []`; en ese caso se muestra un mensaje real y no se inventa contenido.

## 3. Mapeos

| API real                                                           | Modelo de la app           | Decisión                                           |
| ------------------------------------------------------------------ | -------------------------- | -------------------------------------------------- |
| `data.unidades[]`                                                  | `unidades[]`               | Array vacío se conserva como estado vacío.         |
| `unidad.descripcion: null`                                         | `descripcion: null`        | No se inventa texto.                               |
| `unidad.totalLecciones`                                            | `totalLecciones`           | Si falta, se calcula desde `lecciones.length`.     |
| `leccion.estado`, `unidad.estadoUnidad`                            | —                          | Se descartan: progreso es Sprint 2.                |
| `data.tieneCuestionario`, `cuestionarioId`, `tiempoLimiteSegundos` | Se conservan en el detalle | Solo informativos; no se abre ningún cuestionario. |
| `data.estadoEstudiante`                                            | —                          | Se descarta: progreso es Sprint 2.                 |
| `data.definicion`, `data.ejemplo`                                  | Igual                      | Si ambos son vacíos, se muestra estado vacío real. |

## 4. Servicios y estados

```js
import {
  obtenerContenidoQuimica,
  obtenerLeccion,
  SLUG_QUIMICA,
} from '../services/contenidosService';
```

- `obtenerContenidoQuimica({ signal })` → `GET /contenidos/quimica` con el `httpClient` central.
- `obtenerLeccion(id, { signal })` → `GET /lecciones/:id` con el id derivado de la lista.
- El token lo inyecta el interceptor existente; no se guarda ni se reenvía token en esta capa.
- Errores mapeados: `401`, `403`, `404`, timeout, red y mensaje real de la API.

Pantallas:

- `UnidadesLeccionesScreen`: loading → error con reintento → vacío real → `FlatList` de unidades.
- `LeccionDetalleScreen`: loading → error con reintento → definición y ejemplo, o vacío real.

## 5. Conexión a rutas (Q-12)

No existe rama ni PR de Q-12 en `origin` al momento de esta entrega; `development` sigue en
`fe38ecf`. El `Stack.Screen` de `UnidadesLecciones` ya está registrado en `AppNavigator.jsx`
con `QUIMICA_ROUTES.unidadesLecciones`, así que no fue necesario tocar navegación.

Para conectar una ruta de detalle cuando Q-12 esté disponible, pasar la prop desde el
navegador; no hay que editar estas pantallas:

```jsx
<UnidadesLeccionesScreen
  onSelectLeccion={(leccion) => navigation.navigate('LeccionDetalle', { leccionId: leccion.id })}
/>
```

Si no se entrega `onSelectLeccion`, la pantalla muestra `LeccionDetalleScreen` de forma local.
Tampoco se agregó una clave nueva a `QUIMICA_ROUTES` para no pisar el trabajo de Q-12.

Otras props inyectables: `cargarContenido` en el listado y `cargarLeccion` en el detalle.

## 6. Pruebas

### Unitarias (sin red)

```bash
node src/modules/quimica/services/contenidoMappers.test.cjs
```

6 PASS: mapeo real de contenido, mapeo real de detalle, estado vacío, rechazo de respuestas
inválidas, mensajes de error y exclusión de progreso.

### Backend real

```bash
# Exporta las credenciales de prueba publicadas en el Swagger del proyecto.
VIRTU_USER=... VIRTU_PASS=... node scripts/verificar-api-q13.cjs
```

El script imprime solo PASS/FAIL y cantidades; nunca imprime usuario, contraseña ni token.
También acepta `API_BASE_URL` para apuntar a otro entorno.

### Verificación local adicional

```bash
npx prettier --check <archivos tocados>
npx eslint <archivos tocados>
```

## 7. Estado

- Lecciones consultables: **sí**, con datos reales del backend.
- Bloqueo del backend: **ninguno**; 1 unidad y 1 lección disponibles.
- Progreso y cuestionarios: **fuera de alcance** (Sprint 2).
- Navegación a ruta de detalle de Q-12: **pendiente de Q-12**, resuelta por prop.
