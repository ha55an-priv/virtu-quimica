import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  CatalogoScreen,
  FichaElementoScreen,
  InicioDocenteScreen,
  InicioEstudianteScreen,
  LeccionesScreen,
  LoginScreen,
} from '../modules/quimica';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Virtu Química' }} />
      <Stack.Screen
        name="InicioEstudiante"
        component={InicioEstudianteScreen}
        options={{ title: 'Inicio estudiante' }}
      />
      <Stack.Screen
        name="InicioDocente"
        component={InicioDocenteScreen}
        options={{ title: 'Inicio docente' }}
      />
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
