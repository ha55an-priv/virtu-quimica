import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brandColors, brandRadius } from '../../../config/brandTheme';
import { spacing, typography } from '../../../config/theme';
import {
  EducationAction,
  EducationCard,
  EducationHero,
  EducationMessage,
  EducationScreen,
} from '../../../shared/components/EducationLayout';
import BuscadorElementos from '../components/BuscadorElementos';
import ElementoCard from '../components/ElementoCard';
import ChemistryIcon from '../components/ChemistryIcon';
import { DATOS_PROVISIONALES, ELEMENTOS_PROVISIONALES } from '../data/elementosProvisionales';
import { QUIMICA_ROUTES } from '../routes';
import { notificarSeleccion, resolverElementos } from '../services/catalogoIntegration';
import { filtrarElementos as filtrarElementosPorDefecto } from '../services/filtrarElementos';

function InicioScreen({ navigation, nombreCompleto, docente = false }) {
  const nombre = typeof nombreCompleto === 'string' ? nombreCompleto.trim() : '';
  const saludo = nombre ? `Hola, ${nombre}` : 'Te damos la bienvenida';
  const role = docente ? 'Docente' : 'Estudiante';

  return (
    <EducationScreen>
      <EducationHero
        eyebrow={`Virtu Química · ${role}`}
        title={saludo}
        description={
          docente
            ? 'Consulta los recursos de Química para preparar tus clases.'
            : 'Explora los temas de Química y conoce los elementos de la tabla periódica.'
        }
        illustration={<ChemistryIcon type="atom" inHero />}
      />
      <EducationAction
        title="Lecciones"
        description="Unidades y temas de Química."
        icon={<ChemistryIcon type="book" />}
        onPress={() => navigation.navigate(QUIMICA_ROUTES.unidadesLecciones)}
      />
      <EducationAction
        title="Catálogo de elementos"
        description="Elementos y fichas de la tabla periódica."
        icon={<ChemistryIcon type="table" />}
        onPress={() => navigation.navigate(QUIMICA_ROUTES.catalogo)}
      />
    </EducationScreen>
  );
}

export function InicioEstudianteScreen({ navigation, nombreCompleto }) {
  return <InicioScreen navigation={navigation} nombreCompleto={nombreCompleto} />;
}

export function InicioDocenteScreen({ navigation, nombreCompleto }) {
  return <InicioScreen navigation={navigation} nombreCompleto={nombreCompleto} docente />;
}

export function UnidadesLeccionesScreen() {
  return (
    <EducationScreen>
      <EducationHero
        eyebrow="Aprendizaje"
        title="Unidades y lecciones"
        description="Los temas de Química estarán organizados por unidad."
        illustration={<ChemistryIcon type="book" inHero />}
      />
      <EducationMessage
        icon={<ChemistryIcon type="book" />}
        title="Contenido en preparación"
        description="Aquí podrás abrir una unidad y consultar sus lecciones cuando estén disponibles."
      />
    </EducationScreen>
  );
}

function mensajeError(error) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'No se pudo cargar el catálogo.';
}

function MensajeSinCoincidencias() {
  return (
    <EducationMessage
      title="No se encontraron elementos"
      description="Ajusta o limpia la búsqueda para ver el catálogo completo."
      icon={<ChemistryIcon type="table" />}
    />
  );
}

function MensajeCatalogoVacio() {
  return (
    <EducationMessage
      title="Catálogo vacío"
      description="La fuente de datos no tiene elementos registrados."
      icon={<ChemistryIcon type="table" />}
    />
  );
}

function EstadoCatalogoFallback({ loading, error, items, total, onRetry, children }) {
  if (loading) {
    return <EducationMessage title="Cargando catálogo" description="Obteniendo elementos…" />;
  }
  if (error) {
    return (
      <EducationMessage
        title="No se pudo cargar el catálogo"
        description={mensajeError(error)}
        icon={<ChemistryIcon type="atom" />}
      />
    );
  }
  if (items.length === 0) {
    return total > 0 ? <MensajeSinCoincidencias /> : <MensajeCatalogoVacio />;
  }
  return children;
}

/**
 * Listado del catálogo (RF-Q-02).
 *
 * Contrato de props para integración:
 * - `elementos`: array de objetos `{ id, nombre, simbolo, numeroAtomico, clasificacion?, descripcion? }`.
 * - `consulta` + `filtrarElementos(elementos, consulta)`: por defecto usa el buscador real
 *   de Rodrigo; se pueden sobrescribir para integrar otro proveedor.
 * - `buscador`: nodo React o función `({ consulta, onConsultaChange }) => nodo`; por defecto
 *   se renderiza `BuscadorElementos`, así que es usable desde el inicio de la app.
 * - `EstadoCatalogo`: componente de Mateo con props `{ loading, error, items, onRetry, children }`.
 * - `loading`, `error`, `onRetry`: estados de la fuente de datos.
 * - `onSelectElement(elemento)`: callback prioritario; si no existe, usa `navigation`.
 */
export function CatalogoScreen({
  navigation,
  elementos = ELEMENTOS_PROVISIONALES,
  consulta: consultaExterna,
  filtrarElementos = filtrarElementosPorDefecto,
  buscador,
  onConsultaChange,
  EstadoCatalogo,
  loading = false,
  error = null,
  onRetry,
  onSelectElement,
}) {
  const [consultaInterna, setConsultaInterna] = useState('');
  const consulta = consultaExterna ?? consultaInterna;

  const actualizarConsulta = (texto) => {
    if (typeof onConsultaChange === 'function') {
      onConsultaChange(texto);
      return;
    }
    setConsultaInterna(texto);
  };

  const elementosFiltrados = useMemo(
    () => resolverElementos(elementos, consulta, filtrarElementos),
    [elementos, consulta, filtrarElementos],
  );

  const sinCoincidencias =
    !loading && !error && elementos.length > 0 && elementosFiltrados.length === 0;

  const seleccionar = (elemento) => {
    notificarSeleccion(elemento, onSelectElement, navigation, QUIMICA_ROUTES.fichaElemento);
  };

  const buscadorNode =
    typeof buscador === 'function'
      ? buscador({ consulta, onConsultaChange: actualizarConsulta })
      : (buscador ?? <BuscadorElementos value={consulta} onChangeText={actualizarConsulta} />);

  const lista = (
    <FlatList
      data={elementosFiltrados}
      keyExtractor={(item, index) => String(item?.id ?? `elemento-${index}`)}
      renderItem={({ item }) => <ElementoCard elemento={item} onPress={() => seleccionar(item)} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      style={styles.listArea}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<MensajeSinCoincidencias />}
    />
  );

  const contenido = sinCoincidencias ? (
    <MensajeSinCoincidencias />
  ) : EstadoCatalogo ? (
    <EstadoCatalogo loading={loading} error={error} items={elementosFiltrados} onRetry={onRetry}>
      {lista}
    </EstadoCatalogo>
  ) : (
    <EstadoCatalogoFallback
      loading={loading}
      error={error}
      items={elementosFiltrados}
      total={elementos.length}
      onRetry={onRetry}
    >
      {lista}
    </EstadoCatalogoFallback>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <View style={styles.header}>
        <EducationHero
          eyebrow="Tabla periódica"
          title="Catálogo de elementos"
          description="Selecciona un elemento para abrir su ficha."
          illustration={<ChemistryIcon type="table" inHero />}
        />
        {buscadorNode}
        {elementos === ELEMENTOS_PROVISIONALES && DATOS_PROVISIONALES ? (
          <Text style={styles.notice}>
            Datos provisionales: 1 registro verificado en la API. Pendiente de integrar Q-24.
          </Text>
        ) : null}
      </View>
      {contenido}
    </SafeAreaView>
  );
}

export function FichaElementoScreen() {
  return (
    <EducationScreen>
      <EducationHero
        eyebrow="Tabla periódica"
        title="Ficha de elemento"
        description="Vista provisional sin datos del elemento."
        illustration={<ChemistryIcon type="atom" inHero />}
      />
      <EducationCard>
        <View style={styles.elementHeader}>
          <View style={styles.elementTile}>
            <Text style={styles.atomicNumber} accessible={false}>
              —
            </Text>
            <Text style={styles.symbol} accessible={false}>
              —
            </Text>
          </View>
          <View style={styles.elementName}>
            <Text style={styles.title}>Nombre del elemento</Text>
            <Text style={styles.pending}>Sin datos disponibles</Text>
          </View>
        </View>
        <View style={styles.property}>
          <Text style={styles.propertyLabel}>Símbolo</Text>
          <Text style={styles.pending}>Pendiente</Text>
        </View>
        <View style={styles.property}>
          <Text style={styles.propertyLabel}>Número atómico</Text>
          <Text style={styles.pending}>Pendiente</Text>
        </View>
        <View style={styles.property}>
          <Text style={styles.propertyLabel}>Propiedades</Text>
          <Text style={styles.pending}>Pendientes</Text>
        </View>
      </EducationCard>
    </EducationScreen>
  );
}

const styles = StyleSheet.create({
  elementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  elementTile: {
    width: 76,
    height: 76,
    padding: spacing.sm,
    justifyContent: 'center',
    backgroundColor: brandColors.accentSurface,
    borderColor: brandColors.secondary,
    borderWidth: 1,
    borderRadius: brandRadius.control,
  },
  atomicNumber: { position: 'absolute', top: 5, right: 8, color: brandColors.muted, fontSize: 14 },
  symbol: { textAlign: 'center', color: brandColors.primary, fontSize: 30, fontWeight: '800' },
  elementName: { flex: 1, gap: 4 },
  title: { color: brandColors.primary, fontSize: 18, fontWeight: '700' },
  property: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: brandColors.border,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  propertyLabel: { color: brandColors.text, fontSize: typography.body, fontWeight: '600' },
  pending: { color: brandColors.muted, fontSize: typography.body },
  screen: { flex: 1, backgroundColor: brandColors.background },
  header: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  notice: {
    color: brandColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  listArea: { flex: 1 },
  list: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  separator: { height: spacing.sm },
});
