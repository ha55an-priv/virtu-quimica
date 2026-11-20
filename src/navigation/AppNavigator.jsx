import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useSession from '../app/useSession';
import { colors, spacing, typography } from '../config/theme';
import {
  CatalogoScreen,
  FichaElementoScreen,
  InicioDocenteScreen,
  InicioEstudianteScreen,
  LeccionesScreen,
} from '../modules/quimica';
import { ROLES } from '../shared/services/authService';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { session, login, logout, retryRestore } = useSession();

  if (session.status === 'signedOut') {
    return <AuthNavigator onLogin={login} sessionMessage={session.message} />;
  }

  if (session.status !== 'signedIn') {
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
        ) : (
          <ActivityIndicator accessibilityLabel="Actualizando sesión" />
        )}
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator
      key={session.profile.rol}
      screenOptions={{ headerRight: () => <Button title="Salir" onPress={() => void logout()} /> }}
    >
      {session.profile.rol === ROLES.estudiante ? (
        <Stack.Screen
          name="InicioEstudiante"
          component={InicioEstudianteScreen}
          options={{ title: 'Inicio estudiante' }}
        />
      ) : (
        <Stack.Screen
          name="InicioDocente"
          component={InicioDocenteScreen}
          options={{ title: 'Inicio docente' }}
        />
      )}
      <Stack.Screen name="Lecciones" component={LeccionesScreen} />
      <Stack.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Catálogo' }} />
      <Stack.Screen
        name="FichaElemento"
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
    backgroundColor: colors.background,
  },
  actions: { gap: spacing.md },
  message: { color: colors.text, fontSize: typography.body },
});
