import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
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

const ACTIVIDADES_DATA = [
    { id: "1", name: "YOGA", day: "LUNES", time: "6:00 AM", type: "material", icon: "meditation" as any },
    { id: "2", name: "YOGA", day: "MIÉRCOLES", time: "6:00 AM", type: "material", icon: "meditation" as any },
    { id: "3", name: "ZUMBA", day: "MARTES", time: "10:00 AM", type: "font-awesome", icon: "running" as any },
    { id: "4", name: "ZUMBA", day: "JUEVES", time: "7:00 PM", type: "font-awesome", icon: "running" as any },
    { id: "5", name: "SPINNING", day: "VIERNES", time: "6:30 AM", type: "material", icon: "bike" as any },
    { id: "6", name: "SPINNING", day: "SÁBADO", time: "9:00 AM", type: "material", icon: "bike" as any },
    { id: "7", name: "GAP", day: "LUNES", time: "7:00 AM", type: "material", icon: "weight-lifter" as any },
    { id: "8", name: "GAP", day: "JUEVES", time: "6:00 PM", type: "material", icon: "weight-lifter" as any },
];

export const ListaActividades = () => {

    // CORRECCIÓN PARA TYPESCRIPT: Definimos el tipo como any
    const RenderIcon = ({ item }: { item: any }) => {
        if (!item) return null;

        if (item.type === "material") {
            return <MaterialCommunityIcons name={item.icon} size={30} color="#0a3d62" />;
        }
        return <FontAwesome5 name={item.icon} size={24} color="#0a3d62" />;
    };

    function navegarAnadirActividad() {
        router.push({ pathname: "/Pantallas/addAtividad" });
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

                <View style={styles.formCard}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollPadding}
                    >
                        {ACTIVIDADES_DATA.map((actividad) => (
                            <TouchableOpacity key={actividad.id} style={styles.activityRow}>
                                <View style={styles.iconContainer}>
                                    <RenderIcon item={actividad} />
                                </View>

                                <View style={styles.textContainer}>
                                    <Text style={styles.activityName}>{actividad.name}</Text>
                                    <Text style={styles.activityTime}>{actividad.day}, {actividad.time}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={navegarAnadirActividad}
                    >
                        <Text style={styles.loginButtonText}>AÑADIR ACTIVIDAD</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default ListaActividades;

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    safeArea: { flex: 1 },
    header: { alignItems: "center", marginVertical: 20 },
    headerTitle: { fontSize: 32, fontWeight: "900", color: "#0a3d62", letterSpacing: 1 },
    headerSubtitle: { fontSize: 38, fontWeight: "900", color: "#0a3d62", fontStyle: "italic", marginTop: -12 },
    formCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        marginHorizontal: 25,
        marginBottom: 40,
        borderRadius: 30,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    scrollPadding: { paddingBottom: 80 },
    activityRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
    iconContainer: { width: 55, height: 55, borderRadius: 15, backgroundColor: "#f8f9fa", justifyContent: "center", alignItems: "center", marginRight: 15 },
    textContainer: { flex: 1 },
    activityName: { fontSize: 18, fontWeight: "bold", color: "#333" },
    activityTime: { fontSize: 14, color: "#777", marginTop: 2 },
    loginButton: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "#0a3d62",
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: "#0a3d62",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    loginButtonText: { fontSize: 18, fontWeight: "bold", color: "#fff", letterSpacing: 2 },
});