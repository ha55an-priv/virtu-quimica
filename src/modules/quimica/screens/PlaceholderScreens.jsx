import { Button, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../../../config/theme';

function PlaceholderScreen({ children, message }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.message}>{message}</Text>
      {children}
    </ScrollView>
  );
}

function InicioScreen({ navigation, message }) {
  return (
    <PlaceholderScreen message={message}>
      <Button title="Lecciones" onPress={() => navigation.navigate('Lecciones')} />
      <Button title="Catálogo" onPress={() => navigation.navigate('Catalogo')} />
    </PlaceholderScreen>
  );
}

export function InicioEstudianteScreen({ navigation }) {
  return <InicioScreen navigation={navigation} message="Inicio de estudiante en preparación." />;
}

export function InicioDocenteScreen({ navigation }) {
  return <InicioScreen navigation={navigation} message="Inicio de docente en preparación." />;
}

export function LeccionesScreen() {
  return <PlaceholderScreen message="Lecciones de Química en preparación." />;
}

export function CatalogoScreen({ navigation }) {
  return (
    <PlaceholderScreen message="Catálogo de elementos en preparación.">
      <Button
        title="Abrir ficha provisional"
        onPress={() => navigation.navigate('FichaElemento')}
      />
    </PlaceholderScreen>
  );
}

export function FichaElementoScreen() {
  return <PlaceholderScreen message="Ficha de elemento en preparación." />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    color: colors.text,
    fontSize: typography.body,
  },
});
