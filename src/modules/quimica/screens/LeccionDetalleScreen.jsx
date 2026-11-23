import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brandColors, brandRadius, brandShadow } from '../../../config/brandTheme';
import { spacing, typography } from '../../../config/theme';
import { mensajeErrorContenido } from '../services/contenidoMappers';
import { obtenerLeccion } from '../services/contenidosService';

function Seccion({ titulo, contenido }) {
  if (!contenido) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      <Text style={styles.sectionBody}>{contenido}</Text>
    </View>
  );
}

/**
 * Detalle de una lección. No muestra progreso ni cuestionario (Sprint 2).
 * El contenido se obtiene de GET /lecciones/:id con el id real de la lista.
 */
export default function LeccionDetalleScreen({
  leccion,
  cargarLeccion = obtenerLeccion,
  onVolver,
}) {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intentos, setIntentos] = useState(0);

  const idLeccion = leccion?.id;
  const idInvalido = idLeccion === null || idLeccion === undefined;
  const errorMostrado = idInvalido ? 'No se seleccionó ninguna lección.' : error;
  const cargandoMostrado = !idInvalido && cargando;

  useEffect(() => {
    if (idInvalido) return undefined;

    const control = new AbortController();
    let activo = true;

    cargarLeccion(idLeccion, { signal: control.signal })
      .then((respuesta) => {
        if (activo) setDetalle(respuesta);
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
  }, [idInvalido, idLeccion, cargarLeccion, intentos]);

  const recargar = () => {
    setCargando(true);
    setError(null);
    setIntentos((numero) => numero + 1);
  };

  const sinContenido =
    !cargandoMostrado && !errorMostrado && detalle && !detalle.definicion && !detalle.ejemplo;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver a unidades y lecciones"
        onPress={onVolver}
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
      >
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      {cargandoMostrado ? (
        <View style={styles.center} accessibilityState={{ busy: true }}>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={styles.centerText}>Cargando la lección…</Text>
        </View>
      ) : null}

      {!cargandoMostrado && errorMostrado ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.centerTitle}>
            No se pudo cargar la lección
          </Text>
          <Text style={styles.centerText}>{errorMostrado}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga de la lección"
            onPress={recargar}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      {!cargandoMostrado && !errorMostrado && detalle ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>{detalle.unidad?.titulo ?? 'Lección'}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {detalle.titulo}
          </Text>
          <Seccion titulo="Definición" contenido={detalle.definicion} />
          <Seccion titulo="Ejemplo" contenido={detalle.ejemplo} />
          {sinContenido ? (
            <View style={styles.empty}>
              <Text style={styles.centerText}>
                El backend no registró texto teórico para esta lección.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brandColors.background },
  back: { alignSelf: 'flex-start', margin: spacing.md, padding: spacing.sm },
  backPressed: { opacity: 0.7 },
  backText: { color: brandColors.primary, fontSize: typography.body, fontWeight: '700' },
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
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: { color: brandColors.secondary, fontSize: 14, fontWeight: '700' },
  title: { color: brandColors.primary, fontSize: typography.title, fontWeight: '800' },
  section: {
    padding: spacing.md,
    borderRadius: brandRadius.card,
    backgroundColor: brandColors.surface,
    gap: spacing.sm,
    ...brandShadow,
  },
  sectionTitle: { color: brandColors.primary, fontSize: 18, fontWeight: '700' },
  sectionBody: { color: brandColors.text, fontSize: typography.body, lineHeight: 24 },
  empty: {
    padding: spacing.md,
    borderRadius: brandRadius.control,
    backgroundColor: brandColors.accentSurface,
  },
});
