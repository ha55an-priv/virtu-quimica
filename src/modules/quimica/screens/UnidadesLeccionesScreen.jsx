import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brandColors, brandRadius, brandShadow } from '../../../config/brandTheme';
import { spacing, typography } from '../../../config/theme';
import { EducationHero } from '../../../shared/components/EducationLayout';
import ChemistryIcon from '../components/ChemistryIcon';
import { mensajeErrorContenido } from '../services/contenidoMappers';
import { obtenerContenidoQuimica } from '../services/contenidosService';
import LeccionDetalleScreen from './LeccionDetalleScreen';

function UnidadCard({ unidad, onElegirLeccion }) {
  const total = unidad.totalLecciones ?? unidad.lecciones.length;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ChemistryIcon type="book" />
        <View style={styles.cardTitle}>
          <Text style={styles.unidadTitulo}>{unidad.titulo}</Text>
          <Text style={styles.meta}>{total === 1 ? '1 lección' : `${total} lecciones`}</Text>
        </View>
      </View>
      {unidad.descripcion ? <Text style={styles.descripcion}>{unidad.descripcion}</Text> : null}
      {unidad.lecciones.map((leccion) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir lección: ${leccion.titulo}`}
          key={String(leccion.id ?? leccion.orden)}
          onPress={() => onElegirLeccion(leccion)}
          style={({ pressed }) => [styles.leccion, pressed && styles.leccionPressed]}
        >
          <Text style={styles.leccionOrden}>{leccion.orden ?? '—'}</Text>
          <Text style={styles.leccionTitulo} numberOfLines={2}>
            {leccion.titulo}
          </Text>
          <Text accessibilityElementsHidden style={styles.flecha}>
            ›
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * Listado de unidades y lecciones desde GET /contenidos/quimica.
 *
 * - `cargarContenido`: inyectable para pruebas; por defecto usa el httpClient central.
 * - `onSelectLeccion(leccion)`: si se entrega, se invoca en vez de abrir el detalle local.
 *   Cuando Q-12 registre la ruta de detalle, se conecta así sin tocar este archivo:
 *   `onSelectLeccion={(leccion) => navigation.navigate('LeccionDetalle', { leccionId: leccion.id })}`
 */
export default function UnidadesLeccionesScreen({
  cargarContenido = obtenerContenidoQuimica,
  onSelectLeccion,
}) {
  const [contenido, setContenido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);

  useEffect(() => {
    const control = new AbortController();
    let activo = true;

    cargarContenido({ signal: control.signal })
      .then((respuesta) => {
        if (activo) setContenido(respuesta);
      })
      .catch((fallo) => {
        if (activo && fallo?.name !== 'AbortError') setError(mensajeErrorContenido(fallo));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
      control.abort();
    };
  }, [cargarContenido, intentos]);

  const recargar = () => {
    setCargando(true);
    setError(null);
    setIntentos((numero) => numero + 1);
  };

  const elegirLeccion = (leccion) => {
    if (typeof onSelectLeccion === 'function') {
      onSelectLeccion(leccion);
      return;
    }
    setLeccionSeleccionada(leccion);
  };

  if (leccionSeleccionada) {
    return (
      <LeccionDetalleScreen
        key={String(leccionSeleccionada.id)}
        leccion={leccionSeleccionada}
        onVolver={() => setLeccionSeleccionada(null)}
      />
    );
  }

  const unidades = contenido?.unidades ?? [];
  const sinUnidades = !cargando && !error && unidades.length === 0;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <View style={styles.header}>
        <EducationHero
          eyebrow="Aprendizaje"
          title="Unidades y lecciones"
          description="Contenido real de Química consultado desde la API."
          illustration={<ChemistryIcon type="book" inHero />}
        />
      </View>

      {cargando ? (
        <View style={styles.center} accessibilityState={{ busy: true }}>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={styles.centerText}>Cargando unidades y lecciones…</Text>
        </View>
      ) : null}

      {!cargando && error ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.centerTitle}>
            No se pudieron cargar las unidades
          </Text>
          <Text style={styles.centerText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga de unidades"
            onPress={recargar}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      {sinUnidades ? (
        <View style={styles.center}>
          <Text style={styles.centerTitle}>Sin unidades registradas</Text>
          <Text style={styles.centerText}>
            La API respondió correctamente, pero Química todavía no tiene unidades cargadas.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga de unidades"
            onPress={recargar}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      {!cargando && !error && !sinUnidades ? (
        <FlatList
          data={unidades}
          keyExtractor={(unidad) => String(unidad.id ?? unidad.orden)}
          renderItem={({ item }) => <UnidadCard unidad={item} onElegirLeccion={elegirLeccion} />}
          style={styles.listArea}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brandColors.background },
  header: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  centerTitle: {
    color: brandColors.primary,
    fontSize: typography.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerText: {
    color: brandColors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: brandRadius.control,
    backgroundColor: brandColors.primary,
  },
  buttonText: { color: brandColors.surface, fontSize: typography.body, fontWeight: '700' },
  listArea: { flex: 1 },
  list: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  separator: { height: spacing.md },
  card: {
    padding: spacing.md,
    borderRadius: brandRadius.card,
    backgroundColor: brandColors.surface,
    gap: spacing.sm,
    ...brandShadow,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { flex: 1, gap: 2 },
  unidadTitulo: { color: brandColors.primary, fontSize: 18, fontWeight: '700' },
  meta: { color: brandColors.muted, fontSize: 14 },
  descripcion: { color: brandColors.muted, fontSize: typography.body, lineHeight: 22 },
  leccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: brandColors.border,
  },
  leccionPressed: { backgroundColor: brandColors.accentSurface },
  leccionOrden: {
    color: brandColors.secondary,
    fontSize: 14,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  leccionTitulo: { flex: 1, color: brandColors.text, fontSize: typography.body },
  flecha: { color: brandColors.muted, fontSize: 22 },
});
