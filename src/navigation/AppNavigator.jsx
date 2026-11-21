import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useSession from '../app/useSession';
import { brandColors, brandRadius } from '../config/brandTheme';
import { spacing, typography } from '../config/theme';
import {
  CatalogoScreen,
  FichaElementoScreen,
  InicioDocenteScreen,
  InicioEstudianteScreen,
  UnidadesLeccionesScreen,
} from '../modules/quimica';
import { QUIMICA_ROUTES } from '../modules/quimica/routes';
import { ROLES } from '../shared/services/authService';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator();

const homeByRole = new Map([
  [
    ROLES.estudiante,
    {
      name: QUIMICA_ROUTES.inicioEstudiante,
      component: InicioEstudianteScreen,
      title: 'Inicio estudiante',
    },
  ],
  [
    ROLES.docente,
    {
      name: QUIMICA_ROUTES.inicioDocente,
      component: InicioDocenteScreen,
      title: 'Inicio docente',
    },
  ],
]);

export default function AppNavigator() {
  const { session, login, logout, retryRestore } = useSession();
  const home = session.status === 'signedIn' ? homeByRole.get(session.profile?.rol) : undefined;

  if (session.status === 'signedOut') {
    return <AuthNavigator onLogin={login} sessionMessage={session.message} />;
  }

  if (!home) {
    return (
      <SafeAreaView style={styles.status}>
        {session.status === 'restoreFailed' ? (
          <View style={styles.actions}>
            <Text style={styles.message} accessibilityRole="alert">
              No se pudo verificar la sesión. Revisa tu conexión e intenta de nuevo.
            </Text>
            <Button title="Reintentar" onPress={retryRestore} />
            <Button title="Cerrar sesión" onPress={() => void logout()} />
          </View>
        ) : session.status === 'clearFailed' ? (
          <View style={styles.actions}>
            <Text style={styles.message} accessibilityRole="alert">
              No se pudo borrar la sesión guardada.
            </Text>
            <Button title="Reintentar cierre de sesión" onPress={() => void logout()} />
          </View>
        ) : session.status === 'signedIn' ? (
          <View style={styles.actions}>
            <Text style={styles.message} accessibilityRole="alert">
              Tu cuenta no tiene un rol compatible con Virtu Química.
            </Text>
            <Button title="Cerrar sesión" onPress={() => void logout()} />
          </View>
        ) : (
          <ActivityIndicator accessibilityLabel="Actualizando sesión" color={brandColors.primary} />
        )}
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator
      key={home.name}
      initialRouteName={home.name}
      screenOptions={{
        headerStyle: { backgroundColor: brandColors.surface },
        headerTintColor: brandColors.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            onPress={() => void logout()}
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
          >
            <Text style={styles.logoutLabel}>Salir</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name={home.name} options={{ title: home.title }}>
        {(props) => <home.component {...props} nombreCompleto={session.profile.nombreCompleto} />}
      </Stack.Screen>
      <Stack.Screen
        name={QUIMICA_ROUTES.unidadesLecciones}
        component={UnidadesLeccionesScreen}
        options={{ title: 'Unidades y lecciones' }}
      />
      <Stack.Screen
        name={QUIMICA_ROUTES.catalogo}
        component={CatalogoScreen}
        options={{ title: 'Catálogo' }}
      />
      <Stack.Screen
        name={QUIMICA_ROUTES.fichaElemento}
        component={FichaElementoScreen}
        options={{ title: 'Ficha de elemento' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  status: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: brandColors.background,
  },
  actions: { gap: spacing.md },
  message: { color: brandColors.text, fontSize: typography.body },
  logout: {
    minHeight: 44,
    minWidth: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: brandRadius.control,
    backgroundColor: brandColors.background,
  },
  logoutPressed: { backgroundColor: brandColors.accentSurface },
  logoutLabel: { color: brandColors.primary, fontSize: 15, fontWeight: '700' },
});
