import { useAppContext } from "@/src/context/AppContextProvider";
import { inscripciones } from "@/src/db/schema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACTIVIDADES_REF = [
    { id: "1", name: "YOGA", day: "LUNES", time: "6:00 AM", icon: "meditation" as any },
    { id: "2", name: "YOGA", day: "MIÉRCOLES", time: "6:00 AM", icon: "meditation" as any },
    { id: "3", name: "ZUMBA", day: "MARTES", time: "10:00 AM", icon: "human-female-dance" as any },
    { id: "4", name: "ZUMBA", day: "JUEVES", time: "7:00 PM", icon: "human-female-dance" as any },
    { id: "5", name: "SPINNING", day: "VIERNES", time: "6:30 AM", icon: "bike" as any },
    { id: "6", name: "SPINNING", day: "SÁBADO", time: "9:00 AM", icon: "bike" as any },
];

export default function MyActivities() {
    const { usuario } = useAppContext();
    const db = useSQLiteContext();
    const drizzleDb = drizzle(db);
    const [misActividades, setMisActividades] = useState<any[]>([]);

    useEffect(() => {
        cargarMisActividades();
    }, []);

    const cargarMisActividades = async () => {
        if (!usuario) return;
        try {
            const res = await drizzleDb
                .select()
                .from(inscripciones)
                .where(eq(inscripciones.usuarioId, parseInt(usuario.id)));

            const datosCompletos = res.map(inscripcion => {
                const info = ACTIVIDADES_REF.find(a => parseInt(a.id) === inscripcion.actividadId);
                return info ? { ...info, inscripcionId: inscripcion.id } : null;
            }).filter(item => item !== null);

            setMisActividades(datosCompletos);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron cargar tus reservas");
        }
    };

    const confirmarAnulacion = (actividadId: string, nombre: string) => {
        Alert.alert(
            "Anular Reserva",
            `¿Estás seguro de que quieres anular tu reserva para ${nombre}?`,
            [
                { text: "No, mantener", style: "cancel" },
                { 
                    text: "Sí, anular", 
                    style: "destructive", 
                    onPress: () => handleAnular(actividadId) 
                }
            ]
        );
    };

    const handleAnular = async (actividadId: string) => {
        try {
            // Eliminamos la fila donde coincidan el usuario y la actividad
            await drizzleDb
                .delete(inscripciones)
                .where(
                    and(
                        eq(inscripciones.usuarioId, parseInt(usuario!.id)),
                        eq(inscripciones.actividadId, parseInt(actividadId))
                    )
                );

            Alert.alert("Éxito", "Reserva anulada correctamente");
            cargarMisActividades(); // Recargamos la lista para que desaparezca la tarjeta
        } catch (error) {
            Alert.alert("Error", "No se pudo anular la reserva");
        }
    };

    return (
        <LinearGradient colors={["#e0f7f9", "#ffffff"]} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color="#0a3d62" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>MIS RESERVAS</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {misActividades.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="calendar-remove" size={80} color="#ccc" />
                            <Text style={styles.emptyText}>No tienes reservas activas en este momento.</Text>
                        </View>
                    ) : (
                        misActividades.map((actividad, index) => (
                            <View key={index} style={styles.activityCard}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name={actividad.icon} size={30} color="#0a3d62" />
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.actName}>{actividad.name}</Text>
                                    <Text style={styles.actDetail}>{actividad.day} • {actividad.time}</Text>
                                </View>
                                
                                {/* BOTÓN DE ANULAR */}
                                <TouchableOpacity 
                                    style={styles.deleteBtn} 
                                    onPress={() => confirmarAnulacion(actividad.id, actividad.name)}
                                >
                                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    backButton: { padding: 8, backgroundColor: 'white', borderRadius: 12, elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#0a3d62' },
    scrollContent: { padding: 20 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 20, paddingHorizontal: 40 },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    iconBox: { width: 50, height: 50, backgroundColor: '#fdf2f2', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    infoBox: { flex: 1, marginLeft: 15 },
    actName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    actDetail: { fontSize: 13, color: '#777' },
    deleteBtn: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fee2e2'
    }
});