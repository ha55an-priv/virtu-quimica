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
  InicioDocenteScreen,
  InicioEstudianteScreen,
} from './screens/PlaceholderScreens';

export { default as CatalogoScreen } from './screens/CatalogoConFichaScreen';
export { default as FichaElementoScreen, default as FichaElemento } from './screens/FichaElementoScreen';
export { default as UnidadesLeccionesScreen } from './screens/UnidadesLeccionesScreen';

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