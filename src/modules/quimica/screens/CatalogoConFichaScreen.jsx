import { useMemo } from 'react';

import {
  obtenerElementosQuimicos,
  obtenerErroresCatalogo,
} from '../services/catalogoElementosService';
import { CatalogoScreen } from './PlaceholderScreens';

/**
 * RF-Q-08: alimenta el catálogo con la fuente única local (Q-24).
 *
 * No reimplementa la selección: `CatalogoScreen` ya navega a `FichaElemento` con
 * `{ elementoId }` (`catalogoIntegration.notificarSeleccion`) y la ficha (`RF-Q-07`)
 * vuelve a leer ese id en el mismo servicio, de modo que listado y ficha comparten
 * una sola fuente de datos.
 *
 * Las props externas (`elementos`, `error`, `onSelectElement`, etc.) tienen prioridad.
 */
export default function CatalogoConFichaScreen(props) {
  const { elementos: elementosExternos, error: errorExterno } = props;

  const elementos = useMemo(
    () => elementosExternos ?? obtenerElementosQuimicos(),
    [elementosExternos],
  );

  const error =
    errorExterno ??
    (elementos.length === 0 && obtenerErroresCatalogo().length > 0
      ? 'La fuente local del catálogo no tiene elementos válidos.'
      : null);

  return <CatalogoScreen {...props} elementos={elementos} error={error} />;
}