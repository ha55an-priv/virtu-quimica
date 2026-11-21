import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { brandColors, brandRadius } from '../../../config/brandTheme';
import { spacing, typography } from '../../../config/theme';

/**
 * Campo controlado: el padre conserva la consulta y actualiza los resultados.
 * Con RF-Q-02: value={consulta}, onChangeText={onConsultaChange}.
 *
 * @param {{ value: string, onChangeText: (texto: string) => void }} props
 */
export default function BuscadorElementos({ value, onChangeText }) {
  const inputRef = useRef(null);
  const [enfocado, setEnfocado] = useState(false);

  function limpiarConsulta() {
    onChangeText('');
    inputRef.current?.focus();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Buscar elementos</Text>
      <View style={[styles.control, enfocado && styles.focused]}>
        <TextInput
          ref={inputRef}
          accessibilityLabel="Buscar por nombre o símbolo"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          onBlur={() => setEnfocado(false)}
          onChangeText={onChangeText}
          onFocus={() => setEnfocado(true)}
          placeholder="Buscar por nombre o símbolo"
          placeholderTextColor={brandColors.muted}
          returnKeyType="search"
          selectionColor={brandColors.primary}
          style={styles.input}
          underlineColorAndroid="transparent"
          value={value}
        />
        {value.length > 0 && (
          <Pressable
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
            onPress={limpiarConsulta}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
          >
            <Text style={styles.clearText}>Limpiar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: spacing.sm },
  label: { color: brandColors.text, fontSize: typography.body, fontWeight: '600' },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: brandColors.border,
    borderWidth: 1,
    borderRadius: brandRadius.control,
    backgroundColor: brandColors.surface,
  },
  focused: { borderColor: brandColors.primary },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: brandColors.text,
    fontSize: typography.body,
  },
  clearButton: {
    minWidth: 48,
    minHeight: 48,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: brandRadius.control,
  },
  pressed: { backgroundColor: brandColors.accentSurface },
  clearText: { color: brandColors.primary, fontSize: typography.body, fontWeight: '600' },
});
