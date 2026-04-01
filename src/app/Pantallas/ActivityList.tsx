import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native";
import { inscripciones } from "@/src/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useAppContext } from "@/src/context/AppContextProvider";


const ACTIVIDADES_DATA = [
    { id: "1", name: "YOGA", day: "LUNES", time: "6:00 AM", icon: "meditation" as any },
    { id: "2", name: "YOGA", day: "MIÉRCOLES", time: "6:00 AM", icon: "meditation" as any },
    { id: "3", name: "ZUMBA", day: "MARTES", time: "10:00 AM", icon: "human-female-dance" as any },
    { id: "4", name: "ZUMBA", day: "JUEVES", time: "7:00 PM", icon: "human-female-dance" as any },
    { id: "5", name: "SPINNING", day: "VIERNES", time: "6:30 AM", icon: "bike" as any },
    { id: "6", name: "SPINNING", day: "SÁBADO", time: "9:00 AM", icon: "bike" as any },
];

export const ListaActividades = () => {

    const db = useSQLiteContext();
    const drizzleDb = drizzle(db, { schema: { inscripciones } });
    const { usuario } = useAppContext();

    function volverAtras() {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/"); 
        }
    }

    async function apuntarseActividad(idActividad: string) {
        if (!usuario) {
            Alert.alert("Error", "No hay usuario logueado");
            return;
        }

        //  1. COMPROBAR SI YA ESTÁ APUNTADO
        const yaApuntado = await drizzleDb
            .select()
            .from(inscripciones)
            .all();

        const existe = yaApuntado.find(
            (i) =>
            i.usuarioId === parseInt(usuario.id) &&
            i.actividadId === parseInt(idActividad)
        );

        if (existe) {
            Alert.alert("Aviso", "Ya estás apuntado a esta actividad");
            return;
        }

        //  2. SI NO ESTÁ APUNTADO → PREGUNTAR
        Alert.alert(
            "Confirmación",
            "¿Te quieres apuntar a esta actividad?",
            [
            { text: "No", style: "cancel" },
            {
                text: "Sí",
                onPress: async () => {
                    console.log(await drizzleDb.select().from(inscripciones).all());
                await drizzleDb.insert(inscripciones).values({
                    usuarioId: parseInt(usuario.id),
                    actividadId: parseInt(idActividad),
                });

                Alert.alert("OK", "Te has apuntado correctamente");
                },
            },
            ]
        );
    }

    return (
        <LinearGradient
            colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
            style={styles.mainContainer}
        >
            <SafeAreaView style={styles.safeArea}>
                
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>LISTA DE</Text>
                    <Text style={styles.headerSubtitle}>ACTIVIDADES</Text>
                </View>

                {/* Contenedor principal de la tarjeta */}
                <View style={styles.formCard}>
                    
                    {/* 1. ÁREA DE LISTA: El flex: 1 aquí es CLAVE para que no empuje los botones */}
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            {ACTIVIDADES_DATA.map((actividad) => (
                               <TouchableOpacity
                                    key={actividad.id}
                                    style={styles.activityRow}
                                    onPress={() => apuntarseActividad(actividad.id)}
                                    >
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name={actividad.icon} size={30} color="#0a3d62" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.activityName}>{actividad.name}</Text>
                                        <Text style={styles.activityTime}>{actividad.day}, {actividad.time}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default ListaActividades;

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    safeArea: { flex: 1 },
    header: { 
        alignItems: "center", 
        paddingVertical: 10 
    },
    headerTitle: { fontSize: 26, fontWeight: "900", color: "#0a3d62" },
    headerSubtitle: { fontSize: 32, fontWeight: "900", color: "#0a3d62", fontStyle: "italic", marginTop: -10 },
    
    formCard: {
        flex: 1,
        backgroundColor: "#f4f4f4",
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 40,
        padding: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    scrollContent: {
        paddingBottom: 10,
    },
    activityRow: { 
        flexDirection: "row", 
        alignItems: "center", 
        paddingVertical: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: "#e0e0e0" 
    },
    iconContainer: { 
        width: 50, height: 50, borderRadius: 12, backgroundColor: "#fff", 
        justifyContent: "center", alignItems: "center", marginRight: 15 
    },
    textContainer: { flex: 1 },
    activityName: { fontSize: 17, fontWeight: "bold", color: "#333" },
    activityTime: { fontSize: 13, color: "#777" },
    
    footer: {
        marginTop: 10,
        paddingTop: 10,
        alignItems: 'center',
        backgroundColor: "#f4f4f4", // Mismo color que la tarjeta para que no se note el corte
    },
    actionButton: {
        backgroundColor: "#002851",
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: "center",
        width: '100%',
    },
    actionButtonText: { 
        fontSize: 18, 
        fontWeight: "bold", 
        color: "#fff",
        textTransform: 'uppercase'
    },
    cancelContainer: {
        marginTop: 15,
        paddingVertical: 5,
    },
    cancelText: { 
        color: "#888", 
        fontSize: 15, 
        textDecorationLine: "underline",
        textAlign: 'center'
    },
});