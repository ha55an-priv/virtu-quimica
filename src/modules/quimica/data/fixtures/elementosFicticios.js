/**
 * DATOS FICTICIOS PARA PRUEBAS DE INTERFAZ (RF-Q-02 / RF-Q-03).
 * NO provienen del backend ni de ninguna fuente química.
 * NUNCA deben agregarse a data/elementosQuimicos.json (hay una prueba que lo verifica).
 * Ejemplo definido por Randall en RF-Q-01.
 */
export const ELEMENTO_FICTICIO = {
  id: 999,
  nombre: 'Elementum Ficticio',
  simbolo: 'Ef',
  numeroAtomico: 999,
  clasificacion: 'Categoría de ejemplo (ficticia)',
  descripcion:
    'Objeto de ejemplo local explícitamente ficticio para validar el contrato interno del catálogo. No representa un elemento químico real.',
};

/** Ficticio sin campos opcionales: sirve para probar que la UI tolera su ausencia. */
export const ELEMENTO_FICTICIO_MINIMO = {
  id: 998,
  nombre: 'Elementum Mínimo',
  simbolo: 'Em',
  numeroAtomico: 998,
};
