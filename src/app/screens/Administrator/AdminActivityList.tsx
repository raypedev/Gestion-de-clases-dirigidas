import { useAppContext } from "@/src/context/AppContextProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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

  const cargarActividades = async () => {
    try {
      setCargando(true);
      const res = await drizzleDb.select().from(actividades);
      setListaActividades(res);
    } catch (error) {
      console.error("Error al cargar:", error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarActividades();
    }, []),
  );

  const verReservas = (id: number) => {
    router.push({
      pathname: "/screens/Administrator/ActivityDetails",
      params: { id: id },
    });
  };

  const eliminarActividad = (id: number, nombre: string) => {
    Alert.alert("Eliminar", `¿Borrar ${nombre}?`, [
      { text: "No", style: "cancel" },
      {
        text: "Sí, eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await drizzleDb
              .delete(actividades)
              .where(eq(actividades.id, Number(id)));
            cargarActividades();
          } catch (error) {
            console.error("Error al borrar en BD:", error);
          }
        },
      },
    ]);
  };

  const cerrarSesion = () => {
    setMenuVisible(false);
    setUsuario(null);
    router.replace("/");
  };

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.profileIconContainer}
          onPress={() => setMenuVisible(true)}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={45}
            color="#ccc"
          />
        </TouchableOpacity>

        <Modal visible={menuVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownMenu}>
                {/* Cabecera con nombre */}
                <View style={styles.userInfoSection}>
                  <Text style={styles.userNameText}>
                    {usuario?.nick || "rayco"}
                  </Text>
                </View>

                <View style={styles.menuDivider} />

                {/* Ítem Estadísticas */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/screens/Administrator/Estadistics");
                  }}
                >
                  <Text style={styles.menuItemText}>Estadísticas</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                {/* Cerrar Sesión */}
                <TouchableOpacity
                  style={styles.logoutItem}
                  onPress={cerrarSesion}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color="#0a3d62"
                  />
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
            <View style={{ flex: 1, justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#0a3d62" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {listaActividades.length === 0 ? (
                <Text style={styles.emptyText}>
                  Lista vacía. Crea una actividad.
                </Text>
              ) : (
                listaActividades.map((act) => (
                  <View key={act.id} style={styles.activityRow}>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons
                        name={act.icon || "run"}
                        size={30}
                        color="#0a3d62"
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.activityName}>{act.nombre}</Text>
                      <Text style={styles.activityTime}>
                        {act.dia}, {act.hora}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => verReservas(act.id)}
                      style={styles.actionIconButton}
                    >
                      <MaterialCommunityIcons
                        name="eye-outline"
                        size={26}
                        color="#0a3d62"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => eliminarActividad(act.id, act.nombre)}
                      style={styles.actionIconButton}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={26}
                        color="#e74c3c"
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/screens/Administrator/AddActivity")}
            >
              <Text style={styles.actionButtonText}>AÑADIR ACTIVIDAD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.buttonSeparator]}
              onPress={() => router.push("/screens/Administrator/UserList")}
            >
              <Text style={styles.actionButtonText}>USUARIOS REGISTRADOS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.cancelContainer}
            >
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
  profileIconContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)" },
  dropdownMenu: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: 240,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  userInfoSection: { paddingHorizontal: 20, paddingVertical: 10 },
  userNameText: { fontSize: 18, fontWeight: "bold", color: "#0a3d62" },
  menuDivider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 5 },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoutText: {
    marginLeft: 12,
    color: "#0a3d62",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: { alignItems: "center", paddingVertical: 10 },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#0a3d62" },
  headerSubtitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0a3d62",
    fontStyle: "italic",
    marginTop: -10,
  },
  formCard: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 40,
    padding: 20,
  },
  scrollContent: { paddingBottom: 10 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 20 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  activityName: { fontSize: 17, fontWeight: "bold" },
  activityTime: { fontSize: 13, color: "#777" },
  actionIconButton: { padding: 8 },
  footer: { marginTop: 10, alignItems: "center" },
  actionButton: {
    backgroundColor: "#002851",
    borderRadius: 20,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
  },
  buttonSeparator: { marginTop: 12 },
  actionButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelContainer: { marginTop: 15 },
  cancelText: { color: "#888", textDecorationLine: "underline" },
});
