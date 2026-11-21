import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../config/theme';

export const APP_SLUG = 'quimica';

export {
  CAMPOS_ELEMENTO,
  esElementoValido,
  normalizarElementoDesdeGlosario,
  obtenerErroresElemento,
} from './services/elementoContract';

export {
  CatalogoScreen,
  FichaElementoScreen,
  InicioDocenteScreen,
  InicioEstudianteScreen,
  UnidadesLeccionesScreen,
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
