/**
 * Helpers puros de integración del catálogo (RF-Q-02).
 *
 * No implementan el filtro de Rodrigo ni los estados de Mateo: solo definen cómo se
 * conectan. Así RF-Q-02 no reescribe componentes de otros integrantes.
 */

/**
 * @param {Object[]} elementos Lista original.
 * @param {string} consulta Texto de búsqueda.
 * @param {(elementos: Object[], consulta: string) => Object[]} [filtrarElementos]
 * Filtro inyectado por Rodrigo. Si no viene, la lista se devuelve sin cambios.
 * @returns {Object[]} Lista a renderizar.
 */
export function resolverElementos(elementos, consulta, filtrarElementos) {
  const lista = Array.isArray(elementos) ? elementos : [];
  if (typeof filtrarElementos !== 'function') return lista;
  const resultado = filtrarElementos(lista, consulta);
  return Array.isArray(resultado) ? resultado : [];
}

/**
 * @param {Object} elemento Elemento seleccionado.
 * @param {(elemento: Object) => void} [onSelectElement] Callback de Eduardo/navegación.
 * @param {{ navigate: Function }} [navigation] Navegador de React Navigation.
 * @param {string} [routeName] Nombre de la ruta de ficha.
 * @returns {'callback'|'navigation'|'none'} Qué mecanismo se usó.
 */
export function notificarSeleccion(elemento, onSelectElement, navigation, routeName) {
  if (typeof onSelectElement === 'function') {
    onSelectElement(elemento);
    return 'callback';
  }
  if (navigation && typeof navigation.navigate === 'function') {
    navigation.navigate(routeName, { elementoId: elemento?.id });
    return 'navigation';
  }
  return 'none';
}
