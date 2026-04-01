import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Help() {
    const helpSections = [
        {
            title: "¿Cómo me apunto a una actividad?",
            content: "En la pantalla principal, verás un listado de clases (Yoga, Zumba, etc.). Simplemente pulsa sobre la actividad que te interese y confirma en el mensaje que aparecerá en pantalla.",
            icon: "calendar-check"
        },
        {
            title: "¿Cómo edito mi información?",
            content: "Pulsa en el icono de perfil arriba a la derecha, selecciona 'Mi perfil' y verás tus datos. Dale al botón 'EDITAR PERFIL' para modificar tu nombre, DNI o contraseña.",
            icon: "account-edit"
        },
        {
            title: "¿Puedo cambiar mi correo?",
            content: "No, por razones de seguridad el correo electrónico está vinculado a tu cuenta y no puede ser modificado por el usuario.",
            icon: "email-lock"
        },
        {
            title: "Control de Administrador",
            content: "Si eres administrador, al loguearte con tus credenciales especiales accederás a una lista exclusiva para gestionar las actividades del centro.",
            icon: "shield-check"
        }
    ];

    return (
        <LinearGradient colors={["#e0f7f9", "#ffffff"]} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color="#0a3d62" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CENTRO DE AYUDA</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.introCard}>
                        <MaterialCommunityIcons name="information-outline" size={40} color="#0a3d62" />
                        <Text style={styles.introTitle}>¿En qué podemos ayudarte?</Text>
                        <Text style={styles.introText}>Consulta las guías rápidas para sacar el máximo partido a tu aplicación de entrenamiento.</Text>
                    </View>

                    {helpSections.map((section, index) => (
                        <View key={index} style={styles.helpCard}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name={section.icon as any} size={24} color="#0a3d62" />
                                <Text style={styles.cardTitle}>{section.title}</Text>
                            </View>
                            <Text style={styles.cardContent}>{section.content}</Text>
                        </View>
                    ))}

                    <TouchableOpacity 
                        style={styles.contactBtn}
                        onPress={() => Alert.alert("Soporte", "Contactando con soporte técnico...")}
                    >
                        <Text style={styles.contactBtnText}>Contactar con Soporte</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 10 
    },
    backButton: { 
        padding: 8, 
        backgroundColor: 'white', 
        borderRadius: 12, 
        elevation: 2 
    },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#0a3d62' },
    scrollContent: { padding: 20 },
    introCard: {
        alignItems: 'center',
        marginBottom: 25,
        padding: 10
    },
    introTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
    introText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5 },
    helpCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0a3d62',
        marginLeft: 10
    },
    cardContent: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20
    },
    contactBtn: {
        backgroundColor: '#0a3d62',
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30
    },
    contactBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});