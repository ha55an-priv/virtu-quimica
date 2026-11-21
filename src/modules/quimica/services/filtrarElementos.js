const vocalesSinTilde = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };

function normalizarTexto(texto) {
  return texto
    .normalize('NFC')
    .toLowerCase()
    .replace(/[áéíóú]/g, (vocal) => vocalesSinTilde[vocal]);
}

function validarElemento(elemento, indice) {
  if (!elemento || typeof elemento !== 'object' || Array.isArray(elemento)) {
    throw new TypeError(`elementos[${indice}] debe ser un objeto.`);
  }

  for (const campo of ['nombre', 'simbolo']) {
    if (typeof elemento[campo] !== 'string' || !elemento[campo].trim()) {
      throw new TypeError(`elementos[${indice}].${campo} debe ser una cadena no vacía.`);
    }
  }
}

/**
 * Filtra por nombre o símbolo según RF-Q-04, sin alterar los registros ni su orden.
 *
 * @param {Object[]} elementos Colección ya cargada, con nombre y simbolo no vacíos.
 * @param {string} consulta Texto del campo de búsqueda; vacío devuelve todos los registros.
 * @returns {Object[]} Nuevo arreglo con las referencias originales que coinciden.
 * @throws {TypeError} Si la colección, la consulta o algún registro incumplen el contrato.
 */
export function filtrarElementos(elementos, consulta) {
  if (!Array.isArray(elementos)) {
    throw new TypeError('elementos debe ser un arreglo.');
  }
  if (typeof consulta !== 'string') {
    throw new TypeError('consulta debe ser una cadena.');
  }

  const criterio = normalizarTexto(consulta.trim());
  const resultados = [];

  for (const [indice, elemento] of elementos.entries()) {
    // Validar también registros que no coinciden y consultas vacías: no ocultar errores.
    validarElemento(elemento, indice);
    if (
      criterio === '' ||
      normalizarTexto(elemento.nombre).includes(criterio) ||
      normalizarTexto(elemento.simbolo).includes(criterio)
    ) {
      resultados.push(elemento);
    }
  }

  return resultados;
}
