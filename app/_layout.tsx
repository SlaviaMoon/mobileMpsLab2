import { Stack } from 'expo-router';
import { DatabaseProvider } from '../contexts/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
        <Stack>
        <Stack.Screen
            name="index"
            options={{
            headerTitle: 'Карта',
            }}
        />
        <Stack.Screen
            name="marker/[id]"
            options={{
            headerTitle: 'Детали маркера',
            }}
        />
        </Stack>
    </ DatabaseProvider>
  );
}