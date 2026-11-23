# RF-Q-09 · Verificación de la ficha y documentación de resultados

Responsable: Eduardo · Sprint 1 · Base: `origin/development` (`b0bec9d`)

> **Estado: PARCIAL.** Las pruebas automáticas cubren la lógica (datos → selección → ficha).
> Quedan pendientes la prueba visual de la ficha (sección 4) y la comparación con IUPAC (sección 5).
> No marcar la tarjeta como Hecho hasta completarlas.

## 1. Qué se verificó y cómo

| Actividad de la tarjeta | Cómo se cubre | Estado |
| --- | --- | --- |
| 1. Probar selección de distintos elementos | Automático (lógica) + manual en celular | Lógica ☑ · Pantalla ☐ |
| 2. Comparar datos mostrados con la fuente original | Manual contra el PDF de IUPAC (sección 5) | ☐ |
| 3. Comprobar campos opcionales y errores | Automático (sección 6) + elemento mínimo en celular | Lógica ☑ · Pantalla ☐ |
| 4. Registrar capturas y observaciones | Secciones 4 y 7 | ☐ |

Las pruebas automáticas **no renderizan la pantalla**: comprueban que cada elemento llega a la ficha con su id y que la ficha
lo recupera de la misma fuente, sin datos inventados.

## 2. Resultados automáticos

Pegar aquí la salida real de ejecutar (Node 20.19+ / 22.7+):

```bash
node --test src/modules/quimica/__tests__/catalogoElementos.test.mjs
node --import ./src/modules/quimica/__tests__/registrarJsonLoader.mjs --test src/modules/quimica/__tests__/integracionCatalogo.test.mjs
node --import ./src/modules/quimica/__tests__/registrarJsonLoader.mjs --test src/modules/quimica/__tests__/verificacionRfQ09.test.mjs
```

Resultado: _(completar: pruebas totales / pasan / fallan)_

## 3. Procedimiento manual (celular con Expo Go, sin emulador)

1. `npx expo start` y escanear el QR con Expo Go. Iniciar sesión con una cuenta de prueba.
2. Entrar a Catálogo y abrir cada elemento de la tabla. Capturar la ficha.
3. Anotar si algún texto se corta, si los subíndices (H₂O, Li₂CO₃) se ven bien y si el botón volver regresa al catálogo.
4. Para el elemento mínimo: cambiar **temporalmente** la selección para pasar `ELEMENTO_FICTICIO_MINIMO` y capturar. **No commitear ese cambio.**

## 4. Elementos probados (catálogo local, 10 elementos)

| Id | Símbolo | Z | Nombre | Clasificación | Ejemplo | IUPAC (símbolo y Z) | Ficha en celular | Captura |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| elem-001 | H | 1 | Hidrógeno | No metal | H₂O (agua) | ☐ | ☐ | |
| elem-002 | He | 2 | Helio | Gas noble | — (omitido) | ☐ | ☐ | |
| elem-003 | Li | 3 | Litio | Metal alcalino | Li₂CO₃ (carbonato de litio) | ☐ | ☐ | |
| elem-004 | Be | 4 | Berilio | Metal alcalinotérreo | — (omitido) | ☐ | ☐ | |
| elem-005 | B | 5 | Boro | Metaloide | H₃BO₃ (ácido bórico) | ☐ | ☐ | |
| elem-006 | C | 6 | Carbono | No metal | CH₄ (metano) | ☐ | ☐ | |
| elem-007 | N | 7 | Nitrógeno | No metal | NH₃ (amoníaco) | ☐ | ☐ | |
| elem-008 | O | 8 | Oxígeno | No metal | O₂ / CO₂ | ☐ | ☐ | |
| elem-009 | F | 9 | Flúor | Halógeno | — (omitido) | ☐ | ☐ | |
| elem-011 | Na | 11 | Sodio | Metal alcalino | NaCl (cloruro de sodio) | ☐ | ☐ | |

## 5. Comparación con la fuente original

- **Fuente:** IUPAC Periodic Table of the Elements, versión del 2022-05-04 (`metadata.fuenteIUPAC.versionTabla`).
  PDF oficial: https://iupac.org/wp-content/uploads/2022/07/IUPAC_Periodic_Table-04May22_CRA.pdf
- **Comprobado:** la página oficial indica que su última versión es del 4 de mayo de 2022, igual que la registrada en el JSON.
- **Pendiente (manual):** comparar símbolo y número atómico de los 10 elementos con el PDF y marcar la columna "IUPAC" de la sección 4.
  La página solo muestra la tabla como imagen y PDF, sin datos por elemento en texto, así que no se pudo automatizar.
- **Alcance de la comparación:** la tabla IUPAC cubre símbolo y número atómico. `nombre` (español), `clasificacion`, `descripcion`
  y `ejemploOpcional` son del equipo y **no tienen fuente externa** (ver `metadata.procedencia`).
- **Cruce con el glosario real (Q-23):** el único elemento común, Oxígeno, coincide en nombre, símbolo, Z (8) y clasificación
  ("No metal"). Lo verifica `integracionCatalogo.test.mjs`.
- Al terminar: completar `metadata.verificacion` en el JSON (`estado`, `verificadoPor`, `fechaVerificacion`).

## 6. Campos opcionales y errores

| Caso | Cómo se probó | Resultado |
| --- | --- | --- |
| Sin `ejemploOpcional` (He, Be, F) | Automático: la clave no existe en el objeto | ☐ copiar resultado |
| Sin `clasificacion` ni `descripcion` | Automático con `ELEMENTO_FICTICIO_MINIMO` (los 10 reales traen ambos) | ☐ copiar resultado |
| Elemento mínimo en pantalla | Manual (sección 3, paso 4) | ☐ |
| Id inexistente (`elem-999`, `1`, vacío, `null`) | Automático: devuelve `null` sin excepción | ☐ copiar resultado |
| Registro inválido (`numeroAtomico: "6"`, `{}`, `null`) | Automático: `normalizarElemento` devuelve `null` | ☐ copiar resultado |
| Ficha con id inexistente en pantalla | Manual: debe mostrar "Elemento no encontrado" | ☐ |

## 7. Defectos y observaciones

| # | Hallazgo | Estado |
| --- | --- | --- |
| 1 | `obtenerErroresElemento` (elementoContract) exige "texto o null" en los opcionales: un elemento que omite `clasificacion` o `descripcion` no lo cumple. No afecta a los 10 reales. | Abierto · coordinar con Randall |
| 2 | `fichaCatalogoConnector.js` está en `development`, pero la integración documentada usa solo `notificarSeleccion`. Verificar con `git grep fichaCatalogoConnector` si algo lo importa; si no, eliminarlo. | Por verificar |
| 3 | `elementosProvisionales.js` quedó sin uso (su `id: 1` no existe en el catálogo local). | Pendiente de borrar con Randall |
| 4 | Descripción de Flúor: "el más electronegativo y reactivo de todos" es un superlativo; confirmar con una fuente citada o suavizarlo. | Por revisar |
| 5 | Contraste IUPAC de los 10 elementos sin hacer (`pendiente-contraste-manual`). | Abierto |
| 6 | `npm run lint` no verificado en este PR. | Por ejecutar |

_(Agregar aquí lo observado en el celular: textos cortados, subíndices, navegación.)_

## 8. Limitaciones

- Las pruebas automáticas no cubren el renderizado de `FichaElementoScreen` ni `CatalogoScreen`.
- No se probó la búsqueda: corresponde a RF-Q-06.
- El catálogo tiene 10 elementos (`completo: false`), no los 118.
- Sin la sección 4 completa, no se puede afirmar que "la ficha fue probada con varios elementos" en dispositivo.
