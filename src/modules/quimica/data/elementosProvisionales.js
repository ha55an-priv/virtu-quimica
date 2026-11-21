/**
 * Datos PROVISIONALES del catálogo mientras Q-24 no se integra en esta rama.
 *
 * El único registro es una copia literal de la respuesta real verificada en Q-23:
 * GET https://backend-virtu.onrender.com/api/glosarios/quimica
 * No es una fuente Q-24 y no representa la tabla periódica completa.
 */
export const ELEMENTOS_PROVISIONALES = Object.freeze([
  Object.freeze({
    id: 1,
    nombre: 'Oxígeno',
    simbolo: 'O',
    numeroAtomico: 8,
    clasificacion: 'No metal',
    descripcion: null,
  }),
]);

export const DATOS_PROVISIONALES = true;
