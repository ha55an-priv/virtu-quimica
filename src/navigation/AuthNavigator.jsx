import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../modules/quimica/screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ onLogin, sessionMessage }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" options={{ title: 'Virtu Química', headerShown: false }}>
        {() => <LoginScreen onLogin={onLogin} sessionMessage={sessionMessage} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
