import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brandColors as colors, brandRadius, brandShadow } from '../../../config/brandTheme';
import { spacing, typography } from '../../../config/theme';
import { loginErrorMessage } from '../../../shared/services/authService';

export default function LoginScreen({ onLogin, sessionMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);

  async function submit() {
    if (submitting.current) return;
    if (!username.trim() || !password) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }

    setError('');
    submitting.current = true;
    setPending(true);
    try {
      await onLogin(username.trim(), password);
    } catch (failure) {
      setError(loginErrorMessage(failure));
      setPending(false);
    } finally {
      submitting.current = false;
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.layout}>
            <View style={styles.brand}>
              <View style={styles.atomBadge} accessible={false}>
                <View style={styles.orbit} />
                <View style={[styles.orbit, styles.orbitLeft]} />
                <View style={[styles.orbit, styles.orbitRight]} />
                <View style={styles.atomCore} />
              </View>
              <Text accessibilityRole="header" style={styles.brandName}>
                Virtu Química
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.field}>
                <Text style={styles.label}>Usuario</Text>
                <View
                  style={[styles.control, focusedField === 'username' && styles.controlFocused]}
                >
                  <TextInput
                    accessibilityLabel="Usuario"
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect={false}
                    editable={!pending}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedField('username')}
                    style={styles.input}
                    value={username}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Contraseña</Text>
                <View
                  style={[styles.control, focusedField === 'password' && styles.controlFocused]}
                >
                  <TextInput
                    accessibilityLabel="Contraseña"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect={false}
                    editable={!pending}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onSubmitEditing={submit}
                    returnKeyType="go"
                    secureTextEntry={!passwordVisible}
                    style={styles.input}
                    value={password}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    onPress={() => setPasswordVisible((visible) => !visible)}
                    style={({ pressed }) => [styles.eyeButton, pressed && styles.eyePressed]}
                  >
                    <View style={styles.eyeOutline} />
                    <View style={styles.eyePupil} />
                    {passwordVisible && <View style={styles.eyeSlash} />}
                  </Pressable>
                </View>
              </View>

              {sessionMessage ? <Text style={styles.notice}>{sessionMessage}</Text> : null}
              {error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ busy: pending, disabled: pending }}
                disabled={pending}
                onPress={submit}
                style={({ pressed }) => [
                  styles.submit,
                  pressed && styles.submitPressed,
                  pending && styles.submitDisabled,
                ]}
              >
                {pending && <ActivityIndicator color={colors.surface} />}
                <Text style={styles.submitText}>
                  {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  layout: { width: '100%', maxWidth: 440, gap: spacing.lg },
  brand: { alignItems: 'center', gap: spacing.md },
  brandName: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  atomBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbit: {
    position: 'absolute',
    width: 46,
    height: 20,
    borderWidth: 2,
    borderRadius: 24,
    borderColor: colors.secondary,
  },
  orbitLeft: { transform: [{ rotate: '60deg' }] },
  orbitRight: { transform: [{ rotate: '-60deg' }] },
  atomCore: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.surface },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: brandRadius.card,
    backgroundColor: colors.surface,
    ...brandShadow,
  },
  field: { gap: spacing.sm },
  label: { color: colors.text, fontSize: typography.body, fontWeight: '600' },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: brandRadius.control,
    backgroundColor: colors.background,
  },
  controlFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: typography.body,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  eyeButton: {
    width: 48,
    height: 48,
    marginRight: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: brandRadius.control,
  },
  eyePressed: { backgroundColor: colors.accentSurface },
  eyeOutline: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderWidth: 2,
    borderColor: colors.primary,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    transform: [{ rotate: '45deg' }],
  },
  eyePupil: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  eyeSlash: {
    position: 'absolute',
    width: 25,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
    transform: [{ rotate: '-45deg' }],
  },
  notice: {
    padding: spacing.sm,
    color: colors.primary,
    backgroundColor: colors.accentSurface,
    borderRadius: brandRadius.control,
    fontSize: typography.body,
  },
  error: {
    padding: spacing.sm,
    color: colors.errorText,
    backgroundColor: colors.errorSurface,
    borderRadius: brandRadius.control,
    fontSize: typography.body,
  },
  submit: {
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: brandRadius.control,
    backgroundColor: colors.primary,
  },
  submitPressed: { backgroundColor: colors.pressed },
  submitDisabled: { backgroundColor: colors.disabled },
  submitText: {
    flexShrink: 1,
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
