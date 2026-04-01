import { useAppContext } from "@/src/context/AppContextProvider";
import { inscripciones } from "@/src/db/schema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react"; // Añadido useState
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity, // Añadido Modal
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    const { usuario, setUsuario } = useAppContext(); // Extraemos setUsuario para el logout
    const [menuVisible, setMenuVisible] = useState(false); // Estado para el dropdown

    function volverAtras() {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/");
        }
    }

    const cerrarSesion = () => {
        setMenuVisible(false);
        setUsuario(null);
        router.replace("/");
    };

    async function apuntarseActividad(idActividad: string) {
        if (!usuario) {
            Alert.alert("Error", "No hay usuario logueado");
            return;
        }

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

        Alert.alert(
            "Confirmación",
            "¿Te quieres apuntar a esta actividad?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí",
                    onPress: async () => {
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

                {/* ICONO DE PERFIL */}
                <TouchableOpacity
                    style={styles.profileIconContainer}
                    onPress={() => setMenuVisible(true)}
                >
                    <MaterialCommunityIcons name="account-circle" size={45} color="#ccc" />
                </TouchableOpacity>

                {/* MODAL DEL MENÚ DESPLEGABLE */}
                <Modal
                    visible={menuVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.dropdownMenu}>
                                <View style={styles.userInfoSection}>
                                    <Text style={styles.userNameText}>{usuario?.nick || "Usuario"}</Text>
                                </View>

                                <View style={styles.menuDivider} />

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setMenuVisible(false);
                                        router.push("/Pantallas/UserProfile");
                                    }}>
                                    <Text style={styles.menuItemText}>Mi perfil</Text></TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setMenuVisible(false);
                                        router.push("/Pantallas/MyActivities");
                                    }}
                                >
                                    <Text style={styles.menuItemText}>Mis actividades</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setMenuVisible(false);
                                        router.push("/Pantallas/Help");
                                    }}
                                >
                                    <Text style={styles.menuItemText}>Ayuda</Text>
                                </TouchableOpacity>

                                <View style={styles.menuDivider} />

                                <TouchableOpacity style={styles.logoutItem} onPress={cerrarSesion}>
                                    <MaterialCommunityIcons name="logout" size={18} color="#333" />
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
    profileIconContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 100,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        width: 220,
        paddingVertical: 15,
        elevation: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    userInfoSection: {
        paddingHorizontal: 20,
        paddingBottom: 5,
    },
    userNameText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    userSubText: { fontSize: 13, color: '#888' },
    menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    menuItem: { paddingVertical: 10, paddingHorizontal: 20 },
    menuItemText: { fontSize: 15, color: '#333' },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    logoutText: { marginLeft: 10, fontSize: 15, color: '#333', fontWeight: '500' },
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
});