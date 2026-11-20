import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../config/theme';

export const APP_SLUG = 'quimica';

export {
  CatalogoScreen,
  FichaElementoScreen,
  InicioDocenteScreen,
  InicioEstudianteScreen,
  LeccionesScreen,
} from './screens/PlaceholderScreens';

export function QuimicaHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Química</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.title,
    color: colors.text,
  },
});
