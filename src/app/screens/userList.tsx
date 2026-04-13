import { useAppContext } from "@/src/context/AppContextProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- BASE DE DATOS ---
import { usuarios } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export const UserList = () => {
  const { usuario, setUsuario } = useAppContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const res = await drizzleDb.select().from(usuarios);
      setListaUsuarios(res);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, []),
  );

  const cerrarSesion = () => {
    setMenuVisible(false);
    setUsuario(null);
    router.replace("/");
  };

  const eliminarUsuario = (id: number, nombre: string) => {
    Alert.alert("Eliminar Usuario", `¿Estás seguro de borrar a ${nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await drizzleDb.delete(usuarios).where(eq(usuarios.id, id));
            cargarUsuarios();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar al usuario");
          }
        },
      },
    ]);
  };

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
          <MaterialCommunityIcons
            name="account-circle"
            size={45}
            color="#ccc"
          />
        </TouchableOpacity>

        {/* MODAL DE MENÚ ACTUALIZADO */}
        <Modal visible={menuVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownMenu}>
                <View style={styles.userInfoSection}>
                  <Text style={styles.userNameText}>
                    {usuario?.nick || "rayco"}
                  </Text>
                </View>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/screens/Estadistics");
                  }}
                >
                  <Text style={styles.menuItemText}>Estadísticas</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

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
          <Text style={styles.headerTitle}>USUARIOS</Text>
          <Text style={styles.headerSubtitle}>REGISTRADOS</Text>
        </View>

        <View style={styles.formCard}>
          {cargando ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0a3d62" />
            </View>
          ) : (
            <FlatList
              data={listaUsuarios}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.userRow}>
                  <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons
                      name="account"
                      size={28}
                      color="#0a3d62"
                    />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.userName}>{item.nombre}</Text>
                    <Text style={styles.userEmail}>{item.correo}</Text>
                    <Text style={styles.userPassword}>
                      Pass: {item.password}
                    </Text>
                  </View>

                  <View style={styles.actionIcons}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/screens/editUser",
                          params: { id: item.id },
                        })
                      }
                      style={{ marginRight: 10 }}
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={22}
                        color="#0a3d62"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => eliminarUsuario(item.id, item.nombre)}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={22}
                        color="#e74c3c"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No hay usuarios registrados.
                </Text>
              }
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/screens/registeruser")}
            >
              <Text style={styles.actionButtonText}>AÑADIR USUARIO</Text>
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

export default UserList;

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
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
  header: { alignItems: "center", paddingVertical: 10, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#0a3d62" },
  headerSubtitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0a3d62",
    fontStyle: "italic",
    marginTop: -8,
  },
  formCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 35,
    padding: 20,
    elevation: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#e0f7f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 2 },
  userPassword: { fontSize: 12, color: "#aaa", fontStyle: "italic" },
  actionIcons: { flexDirection: "row", alignItems: "center" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  footer: { marginTop: 10, alignItems: "center" },
  actionButton: {
    backgroundColor: "#002851",
    borderRadius: 20,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelContainer: { marginTop: 15 },
  cancelText: { color: "#888", textDecorationLine: "underline" },
});
