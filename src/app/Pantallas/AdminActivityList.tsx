import { useAppContext } from "@/src/context/AppContextProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router"; // <-- Añadido useFocusEffect
import React, { useCallback, useState } from "react"; // <-- Añadido useCallback
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- BASE DE DATOS ---
import { actividades } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export const ListaActividades = () => {
    const { usuario, setUsuario } = useAppContext();
    const [menuVisible, setMenuVisible] = useState(false);
    const [listaActividades, setListaActividades] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    const db = useSQLiteContext();
    const drizzleDb = drizzle(db);

    // Cargar actividades
    const cargarActividades = async () => {
        try {
            setCargando(true);
            const res = await drizzleDb.select().from(actividades);
            setListaActividades(res);
            console.log("Actividades cargadas:", res.length);
        } catch (error) {
            console.error("Error al cargar:", error);
        } finally {
            setCargando(false);
        }
    };

    // REFRESCAR AL ENTRAR EN LA PANTALLA
    useFocusEffect(
        useCallback(() => {
            cargarActividades();
        }, [])
    );

    // FUNCIÓN DE BORRADO
    const eliminarActividad = (id: number, nombre: string) => {
        console.log("Botón pulsado para ID:", id); 

        Alert.alert(
            "Eliminar",
            `¿Borrar ${nombre}?`,
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Sí, eliminar", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await drizzleDb.delete(actividades).where(eq(actividades.id, Number(id)));
                            console.log("Borrado exitoso de la BD");
                            cargarActividades(); // Refrescar lista
                        } catch (error) {
                            console.error("Error al borrar en BD:", error);
                            Alert.alert("Error", "No se pudo borrar");
                        }
                    } 
                }
            ]
        );
    };

    const cerrarSesion = () => {
        setMenuVisible(false);
        setUsuario(null);
        router.replace("/");
    };

    return (
        <LinearGradient colors={["#e0f7f9", "#ffffff", "#e0f7f9"]} style={styles.mainContainer}>
            <SafeAreaView style={styles.safeArea}>
                
                <TouchableOpacity style={styles.profileIconContainer} onPress={() => setMenuVisible(true)}>
                    <MaterialCommunityIcons name="account-circle" size={45} color="#ccc" />
                </TouchableOpacity>

                <Modal visible={menuVisible} transparent animationType="fade">
                    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.dropdownMenu}>
                                <View style={styles.userInfoSection}>
                                    <Text style={styles.userNameText}>{usuario?.nick || "Admin"}</Text>
                                    <Text style={styles.userSubText}>Panel de Administración</Text>
                                </View>
                                <View style={styles.menuDivider} />
                                <TouchableOpacity style={styles.logoutItem} onPress={cerrarSesion}>
                                    <MaterialCommunityIcons name="logout" size={18} color="#0a3d62" />
                                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>LISTA DE</Text>
                    <Text style={styles.headerSubtitle}>ACTIVIDADES</Text>
                </View>

                <View style={styles.formCard}>
                    {cargando ? (
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color="#0a3d62" />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {listaActividades.length === 0 ? (
                                <Text style={styles.emptyText}>Lista vacía. Crea una actividad.</Text>
                            ) : (
                                listaActividades.map((act) => (
                                    <View key={act.id} style={styles.activityRow}>
                                        <View style={styles.iconContainer}>
                                            <MaterialCommunityIcons name={act.icon || "run"} size={30} color="#0a3d62" />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <Text style={styles.activityName}>{act.nombre}</Text>
                                            <Text style={styles.activityTime}>{act.dia}, {act.hora}</Text>
                                        </View>
                                        
                                        <TouchableOpacity 
                                            onPress={() => eliminarActividad(act.id, act.nombre)}
                                            style={styles.deleteButton}
                                        >
                                            <MaterialCommunityIcons name="trash-can-outline" size={26} color="#e74c3c" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    )}

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/Pantallas/addActivity")}>
                            <Text style={styles.actionButtonText}>AÑADIR ACTIVIDAD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelContainer}>
                            <Text style={styles.cancelText}>Volver</Text>
                        </TouchableOpacity>
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
    profileIconContainer: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
    dropdownMenu: { position: 'absolute', top: 100, right: 20, backgroundColor: 'white', borderRadius: 12, width: 220, paddingVertical: 15, elevation: 15 },
    userInfoSection: { paddingHorizontal: 20, paddingBottom: 5 },
    userNameText: { fontSize: 18, fontWeight: 'bold' },
    userSubText: { fontSize: 13, color: '#888' },
    menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    logoutItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    logoutText: { marginLeft: 10, color: '#0a3d62', fontWeight: 'bold' },
    header: { alignItems: "center", paddingVertical: 10 },
    headerTitle: { fontSize: 26, fontWeight: "900", color: "#0a3d62" },
    headerSubtitle: { fontSize: 32, fontWeight: "900", color: "#0a3d62", fontStyle: "italic", marginTop: -10 },
    formCard: { flex: 1, backgroundColor: "#f4f4f4", marginHorizontal: 20, marginBottom: 20, borderRadius: 40, padding: 20 },
    scrollContent: { paddingBottom: 10 },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
    activityRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
    iconContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginRight: 15 },
    textContainer: { flex: 1 },
    activityName: { fontSize: 17, fontWeight: "bold" },
    activityTime: { fontSize: 13, color: "#777" },
    deleteButton: { padding: 10 },
    footer: { marginTop: 10, alignItems: 'center' },
    actionButton: { backgroundColor: "#002851", borderRadius: 20, paddingVertical: 18, width: '100%', alignItems: "center" },
    actionButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    cancelContainer: { marginTop: 15 },
    cancelText: { color: "#888", textDecorationLine: "underline" },
});