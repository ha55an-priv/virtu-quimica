/**
 * Prueba de integración con el backend real para Q-13.
 *
 * Uso:
 *   VIRTU_USER=... VIRTU_PASS=... node scripts/verificar-api-q13.cjs
 *
 * Las credenciales se leen del entorno y nunca se imprimen. No se versionan cuentas
 * ni tokens. Si Química no tiene unidades, el script termina con éxito y lo reporta
 * como estado vacío real (no inventa datos académicos).
 */

const BASE_URL = process.env.API_BASE_URL?.trim() || 'https://backend-virtu.onrender.com/api';

async function pedir(path, options = {}) {
  const respuesta = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  const texto = await respuesta.text();
  let cuerpo;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    cuerpo = texto;
  }
  return { status: respuesta.status, cuerpo };
}

function fallar(mensaje) {
  console.error(`FAIL: ${mensaje}`);
  process.exitCode = 1;
}

(async () => {
  const usuario = process.env.VIRTU_USER;
  const contrasena = process.env.VIRTU_PASS;
  if (!usuario || !contrasena) {
    fallar('Faltan VIRTU_USER o VIRTU_PASS en el entorno.');
    return;
  }

  const login = await pedir('/auth/login', {
    method: 'POST',
    body: { username: usuario, password: contrasena },
  });
  if (login.status !== 200) {
    fallar(`POST /auth/login respondió ${login.status}.`);
    return;
  }
  const token = login.cuerpo?.data?.token;
  if (typeof token !== 'string' || !token) {
    fallar('La API no devolvió un token de sesión.');
    return;
  }
  console.log('PASS: autenticación real (token no impreso)');
  const auth = { Authorization: `Bearer ${token}` };

  const contenidos = await pedir('/contenidos/quimica', { headers: auth });
  if (contenidos.status !== 200) {
    fallar(`GET /contenidos/quimica respondió ${contenidos.status}.`);
    return;
  }
  const datos = contenidos.cuerpo?.data;
  if (!datos || !Array.isArray(datos.unidades)) {
    fallar('GET /contenidos/quimica no devolvió { data: { unidades: [] } }.');
    return;
  }
  console.log('PASS: GET /contenidos/quimica con forma real');

  const lecciones = datos.unidades.flatMap((unidad) => unidad.lecciones ?? []);
  console.log(`INFO: ${datos.unidades.length} unidad(es), ${lecciones.length} lección(es) reales.`);

  if (lecciones.length === 0) {
    console.log('PASS: estado vacío real confirmado; no se inventan datos académicos.');
    return;
  }

  const idLeccion = lecciones[0].id;
  if (idLeccion === null || idLeccion === undefined) {
    fallar('La lección real no tiene id; no se puede consultar el detalle.');
    return;
  }

  const detalle = await pedir(`/lecciones/${encodeURIComponent(String(idLeccion))}`, {
    headers: auth,
  });
  if (detalle.status !== 200) {
    fallar(`GET /lecciones/${idLeccion} respondió ${detalle.status}.`);
    return;
  }
  if (typeof detalle.cuerpo?.data?.titulo !== 'string') {
    fallar('GET /lecciones/:id no devolvió un título real.');
    return;
  }
  console.log('PASS: GET /lecciones/:id con forma real');
  console.log('Todas las pruebas de backend real Q-13 pasaron.');
})();
