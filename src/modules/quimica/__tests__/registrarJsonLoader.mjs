// SOLO PARA PRUEBAS EN NODE. No se usa en la aplicación.
// Metro/Expo acepta imports de `.json` y rutas sin extensión; Node ESM no.
// Este loader permite ejecutar pruebas contra el servicio real en Node.
import { register } from 'node:module';

register(
  'data:text/javascript,' +
    encodeURIComponent(`
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (specifier.startsWith('.') && !/\\.[a-z]+$/i.test(specifier)) {
      return nextResolve(specifier + '.js', context);
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    const texto = await readFile(fileURLToPath(url), 'utf8');
    return { format: 'module', shortCircuit: true, source: 'export default ' + texto };
  }
  return nextLoad(url, context);
}`),
  import.meta.url,
);