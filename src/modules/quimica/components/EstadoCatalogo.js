import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../config/theme';

function mensajeError(error) {
  if (typeof error === 'string' && error.trim()) return error;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return 'No se pudieron cargar los elementos químicos. Inténtalo de nuevo.';
}

/**
 * Envuelve el listado de RF-Q-02 sin conocer su presentación ni su servicio.
 * Prioridad: loading > error > items vacío o inválido > children.
 * El consumidor valida los registros; aquí solo se comprueba el arreglo.
 */
export default function EstadoCatalogo({ loading = false, error, items, onRetry, children }) {
  if (loading) {
    return (
      <View style={styles.container} accessibilityState={{ busy: true }}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Cargando" />
        <Text style={styles.message} accessibilityLiveRegion="polite">
          Cargando elementos químicos...
        </Text>
      </View>
    );
  }

  if (error) {
    const puedeReintentar = typeof onRetry === 'function';
    return (
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">
          No se pudo cargar el catálogo
        </Text>
        <Text style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {mensajeError(error)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
          accessibilityState={{ disabled: !puedeReintentar }}
          disabled={!puedeReintentar}
          onPress={puedeReintentar ? () => onRetry() : undefined}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            !puedeReintentar && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.message} accessibilityLiveRegion="polite">
          No hay elementos químicos disponibles
        </Text>
      </View>
    );
  }

  return children ?? null;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 480,
  },
  message: {
    color: colors.text,
    fontSize: typography.body,
    textAlign: 'center',
    maxWidth: 480,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.background, fontSize: typography.body, fontWeight: '600' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
