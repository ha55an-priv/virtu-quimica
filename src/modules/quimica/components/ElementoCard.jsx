import { Pressable, StyleSheet, Text, View } from 'react-native';

import { brandColors, brandRadius, brandShadow } from '../../../config/brandTheme';
import { spacing, typography } from '../../../config/theme';

function texto(valor, fallback = '—') {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : fallback;
}

function numeroAtomico(valor) {
  return Number.isInteger(valor) && valor > 0 ? String(valor) : '—';
}

/**
 * Tarjeta de un elemento del catálogo. No decide navegación: solo avisa al padre.
 *
 * @param {Object} props
 * @param {Object} props.elemento Elemento con el contrato `{ id, nombre, simbolo, numeroAtomico }`.
 * @param {() => void} props.onPress Callback de selección.
 */
export default function ElementoCard({ elemento, onPress }) {
  const nombre = texto(elemento?.nombre, 'Elemento sin nombre');
  const simbolo = texto(elemento?.simbolo);
  const atomico = numeroAtomico(elemento?.numeroAtomico);
  const clasificacion = texto(elemento?.clasificacion, '');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${nombre}, símbolo ${simbolo}, número atómico ${atomico}`}
      accessibilityHint="Abre la ficha del elemento"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.tile} accessible={false}>
        <Text style={styles.atomicNumber}>{atomico}</Text>
        <Text style={styles.symbol}>{simbolo}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {nombre}
        </Text>
        {clasificacion ? (
          <Text style={styles.classification} numberOfLines={1}>
            {clasificacion}
          </Text>
        ) : null}
        <Text style={styles.hint}>Ver ficha</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 92,
    padding: spacing.md,
    borderRadius: brandRadius.card,
    backgroundColor: brandColors.surface,
    ...brandShadow,
  },
  pressed: { backgroundColor: brandColors.accentSurface },
  tile: {
    width: 64,
    height: 64,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: brandColors.accentSurface,
    borderColor: brandColors.secondary,
    borderWidth: 1,
    borderRadius: brandRadius.control,
  },
  atomicNumber: {
    position: 'absolute',
    top: 4,
    right: 6,
    color: brandColors.muted,
    fontSize: 13,
  },
  symbol: {
    color: brandColors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  info: { flex: 1, gap: 3 },
  name: { color: brandColors.primary, fontSize: 18, fontWeight: '700' },
  classification: { color: brandColors.muted, fontSize: typography.body },
  hint: { color: brandColors.secondary, fontSize: 14, fontWeight: '700' },
});
