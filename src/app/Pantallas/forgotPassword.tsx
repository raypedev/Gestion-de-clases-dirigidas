import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
    function navigateBack() {
        router.push({ pathname: "/" }); // Vuelve a la pantalla principal
    }

    return (
        <LinearGradient
            colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
            style={styles.mainContainer}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Logo / Título */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>Olvidaste tu contraseña</Text>
                </View>

                {/* Tarjeta de recuperación */}
                <View style={styles.formCard}>
                    <Text style={styles.cardTitle}>Recupera tu cuenta</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        placeholderTextColor="#888"
                    />

                    <TouchableOpacity style={styles.sendButton}>
                        <Text style={styles.sendButtonText}>Enviar correo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={navigateBack}>
                        <Text style={styles.forgotPassword}>
                            Volver al inicio de sesión
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: "flex-start",
    },
    header: {
        flex: 0.6, // reducido para que ocupe menos espacio
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    logoText: {
        fontSize: 36,
        fontWeight: "900",
        fontStyle: "italic",
        letterSpacing: -1,
        color: "#0a3d62",
        textAlign: "center",
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 25,
        marginTop: 10, // reducido para acercar la tarjeta al título
        paddingHorizontal: 25,
        paddingVertical: 35,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    input: {
        backgroundColor: "#f8f9fa",
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#eee",
        color: "#333",
    },
    sendButton: {
        backgroundColor: "#0a3d62",
        borderRadius: 15,
        paddingVertical: 14,
        paddingHorizontal: 30,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#0a3d62",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
        alignSelf: "center",
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        letterSpacing: 1.5,
        textAlign: "center",
    },
    forgotPassword: {
        textAlign: "center",
        marginTop: 20,
        color: "#777",
        fontSize: 14,
    },
});