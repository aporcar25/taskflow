import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={styles.container}>
                <Text style={styles.text}>Esta pantalla no existe.</Text>
                <Link href="/" style={styles.link}>
                    <Text>Volver al inicio</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' },
    text: { color: '#fff', fontSize: 18, marginBottom: 20 },
    link: { color: '#a3e635' },
});
